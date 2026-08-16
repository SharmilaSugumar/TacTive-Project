import prisma from './prisma';

export const allocateCharger = async (vehicleId: string, vehicleType: string) => {
  // Added for CI/CD testing verification
  console.log('Executing allocation engine - CI/CD pipeline test');

  // 1. Check if vehicle is already in an active session
  const activeSession = await prisma.chargingRequest.findFirst({
    where: { vehicleId, status: { in: ['PENDING', 'ALLOCATED'] } }
  });
  if (activeSession) {
    throw new Error('Vehicle already has an active session');
  }

  // 2. Find compatible available chargers
  const availableCharger = await prisma.charger.findFirst({
    where: { type: vehicleType, status: 'AVAILABLE' }
  });

  if (availableCharger) {
    // Allocate to this charger
    await prisma.charger.update({
      where: { id: availableCharger.id },
      data: { status: 'CHARGING', vehicleId }
    });

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'CHARGING' }
    });

    const request = await prisma.chargingRequest.create({
      data: { vehicleId, chargerId: availableCharger.id, status: 'ALLOCATED' }
    });

    return { allocated: true, charger: availableCharger, request };
  } else {
    // Put into queue
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'QUEUED' }
    });

    const request = await prisma.chargingRequest.create({
      data: { vehicleId, status: 'PENDING' }
    });

    return { allocated: false, request };
  }
};

export const processQueueForCharger = async (chargerId: string) => {
  const charger = await prisma.charger.findUnique({ where: { id: chargerId } });
  if (!charger || charger.status !== 'AVAILABLE') return;

  // Find oldest pending request for this charger type
  const pendingRequest = await prisma.chargingRequest.findFirst({
    where: {
      status: 'PENDING',
      vehicleId: { not: '' } // To join vehicle type we need an include, wait prisma doesn't allow join conditions easily here
    },
    orderBy: { createdAt: 'asc' }
  });

  if (pendingRequest) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: pendingRequest.vehicleId } });
    if (vehicle && vehicle.type === charger.type) {
      // Allocate
      await prisma.charger.update({
        where: { id: charger.id },
        data: { status: 'CHARGING', vehicleId: vehicle.id }
      });
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { status: 'CHARGING' }
      });
      await prisma.chargingRequest.update({
        where: { id: pendingRequest.id },
        data: { status: 'ALLOCATED', chargerId: charger.id }
      });
      return { allocated: true, vehicleId: vehicle.id };
    }
  }
  return { allocated: false };
};

export const handleChargerFault = async (chargerId: string) => {
  const charger = await prisma.charger.findUnique({ where: { id: chargerId } });
  if (!charger || charger.status === 'FAULT') return;

  const vehicleId = charger.vehicleId;

  // Mark as FAULT
  await prisma.charger.update({
    where: { id: chargerId },
    data: { status: 'FAULT', vehicleId: null }
  });

  if (vehicleId) {
    // Session interrupted
    await prisma.chargingRequest.updateMany({
      where: { chargerId, status: 'ALLOCATED' },
      data: { status: 'PENDING', chargerId: null }
    });

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (vehicle) {
      // Try to find another compatible charger
      const availableCharger = await prisma.charger.findFirst({
        where: { type: vehicle.type, status: 'AVAILABLE' }
      });

      if (availableCharger) {
        // Reallocate to the new charger
        await prisma.charger.update({
          where: { id: availableCharger.id },
          data: { status: 'CHARGING', vehicleId: vehicle.id }
        });
        await prisma.chargingRequest.updateMany({
          where: { vehicleId: vehicle.id, status: 'PENDING' },
          data: { status: 'ALLOCATED', chargerId: availableCharger.id }
        });
        return { recovered: true, newChargerId: availableCharger.id };
      } else {
        // Priority queue: it's already marked PENDING with its old createdAt, so it has priority!
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { status: 'QUEUED' }
        });
      }
    }
  }

  return { recovered: false };
};
