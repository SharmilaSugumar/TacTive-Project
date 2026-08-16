import { describe, it, expect, vi, beforeEach } from 'vitest';
import { allocateCharger, processQueueForCharger, handleChargerFault } from '../src/services/allocationEngine';
import prisma from '../src/services/prisma';

vi.mock('../src/services/prisma', () => ({
  default: {
    chargingRequest: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    charger: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vehicle: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Allocation Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('allocateCharger', () => {
    it('should reject if vehicle has active session (Active Session Protection)', async () => {
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce({ id: '1', vehicleId: 'v1', status: 'PENDING', chargerId: null, createdAt: new Date(), updatedAt: new Date() });
      await expect(allocateCharger('v1', 'CCS')).rejects.toThrow('Vehicle already has an active session');
    });

    it('should allocate if compatible charger is available (Happy Path)', async () => {
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.charger.findFirst).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.charger.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.vehicle.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.chargingRequest.create).mockResolvedValueOnce({ id: 'req1', vehicleId: 'v1', chargerId: 'c1', status: 'ALLOCATED', createdAt: new Date(), updatedAt: new Date() });

      const result = await allocateCharger('v1', 'CCS');
      expect(result.allocated).toBe(true);
      expect(result.request?.chargerId).toBe('c1');
    });

    it('should queue if no compatible charger is available (Queue Allocation)', async () => {
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.charger.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.vehicle.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.chargingRequest.create).mockResolvedValueOnce({ id: 'req1', vehicleId: 'v1', chargerId: null, status: 'PENDING', createdAt: new Date(), updatedAt: new Date() });

      const result = await allocateCharger('v1', 'CCS');
      expect(result.allocated).toBe(false);
      expect(result.request?.status).toBe('PENDING');
    });
  });

  describe('processQueueForCharger', () => {
    it('should return if charger not found or not AVAILABLE', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce(null);
      const res1 = await processQueueForCharger('c1');
      expect(res1).toBeUndefined();

      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'CHARGING', vehicleId: 'v1', createdAt: new Date(), updatedAt: new Date() });
      const res2 = await processQueueForCharger('c1');
      expect(res2).toBeUndefined();
    });

    it('should return if no pending request', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce(null);
      const res = await processQueueForCharger('c1');
      expect(res?.allocated).toBe(false);
    });

    it('should return if vehicle not found or type mismatch', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce({ id: 'req1', vehicleId: 'v1', status: 'PENDING', chargerId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValueOnce(null);
      
      const res1 = await processQueueForCharger('c1');
      expect(res1?.allocated).toBe(false);

      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce({ id: 'req1', vehicleId: 'v1', status: 'PENDING', chargerId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValueOnce({ id: 'v1', type: 'CHAdeMO', status: 'QUEUED', createdAt: new Date(), updatedAt: new Date() });
      
      const res2 = await processQueueForCharger('c1');
      expect(res2?.allocated).toBe(false);
    });

    it('should allocate if valid pending request and vehicle match', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.chargingRequest.findFirst).mockResolvedValueOnce({ id: 'req1', vehicleId: 'v1', status: 'PENDING', chargerId: null, createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValueOnce({ id: 'v1', type: 'CCS', status: 'QUEUED', createdAt: new Date(), updatedAt: new Date() });
      
      const res = await processQueueForCharger('c1');
      expect(res?.allocated).toBe(true);
      expect(prisma.charger.update).toHaveBeenCalled();
      expect(prisma.vehicle.update).toHaveBeenCalled();
      expect(prisma.chargingRequest.update).toHaveBeenCalled();
    });
  });

  describe('handleChargerFault', () => {
    it('should return if charger not found or already FAULT', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce(null);
      const res1 = await handleChargerFault('c1');
      expect(res1).toBeUndefined();

      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'FAULT', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      const res2 = await handleChargerFault('c1');
      expect(res2).toBeUndefined();
    });

    it('should mark FAULT and return if no vehicle attached', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      const res = await handleChargerFault('c1');
      expect(res?.recovered).toBe(false);
      expect(prisma.charger.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { status: 'FAULT', vehicleId: null } });
    });

    it('should interrupt and reallocate if another compatible charger is available', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'CHARGING', vehicleId: 'v1', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValueOnce({ id: 'v1', type: 'CCS', status: 'CHARGING', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.charger.findFirst).mockResolvedValueOnce({ id: 'c2', type: 'CCS', status: 'AVAILABLE', vehicleId: null, createdAt: new Date(), updatedAt: new Date() });
      
      const res = await handleChargerFault('c1');
      expect(res?.recovered).toBe(true);
      expect(prisma.chargingRequest.updateMany).toHaveBeenCalledWith({ where: { chargerId: 'c1', status: 'ALLOCATED' }, data: { status: 'PENDING', chargerId: null } });
      expect(prisma.charger.update).toHaveBeenCalledWith({ where: { id: 'c2' }, data: { status: 'CHARGING', vehicleId: 'v1' } });
    });

    it('should interrupt and queue if no other compatible charger is available', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'CHARGING', vehicleId: 'v1', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValueOnce({ id: 'v1', type: 'CCS', status: 'CHARGING', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.charger.findFirst).mockResolvedValueOnce(null); // No other charger
      
      const res = await handleChargerFault('c1');
      expect(res?.recovered).toBe(false);
      expect(prisma.vehicle.update).toHaveBeenCalledWith({ where: { id: 'v1' }, data: { status: 'QUEUED' } });
    });

    it('should handle case when vehicle attached is not found in db', async () => {
      vi.mocked(prisma.charger.findUnique).mockResolvedValueOnce({ id: 'c1', type: 'CCS', status: 'CHARGING', vehicleId: 'v1', createdAt: new Date(), updatedAt: new Date() });
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValueOnce(null);
      
      const res = await handleChargerFault('c1');
      expect(res?.recovered).toBe(false);
    });
  });
});
