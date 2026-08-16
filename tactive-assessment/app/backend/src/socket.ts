import { Server, Socket } from 'socket.io';
import prisma from './services/prisma';
import { allocateCharger, handleChargerFault } from './services/allocationEngine';

let ioInstance: Server;

export const setupSocket = (io: Server) => {
  ioInstance = io;
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Provide initial state
    socket.on('getInitialState', async () => {
      const chargers = await prisma.charger.findMany();
      const queue = await prisma.chargingRequest.findMany({ where: { status: 'PENDING' } });
      socket.emit('initialState', { chargers, queue });
    });

    // Handle incoming charging request
    socket.on('requestCharger', async (data, callback) => {
      try {
        // Ensure vehicle exists
        let vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!vehicle) {
          vehicle = await prisma.vehicle.create({
            data: { id: data.vehicleId, license: data.vehicleId, type: data.requestedType }
          });
        }
        
        const result = await allocateCharger(vehicle.id, vehicle.type);
        
        // Broadcast new state
        const chargers = await prisma.charger.findMany();
        const queue = await prisma.chargingRequest.findMany({ where: { status: 'PENDING' } });
        io.emit('initialState', { chargers, queue });
        
        if (callback) callback({ success: true, result });
      } catch (e: any) {
        if (callback) callback({ success: false, error: e.message });
      }
    });

    const verifyToken = (token: string, callback: any) => {
      try {
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        return true;
      } catch (e) {
        if (callback) callback({ error: 'Unauthorized operation' });
        return false;
      }
    };

    // Handle fault simulation
    socket.on('simulateFault', async (data: { chargerId: string, token: string }, callback) => {
      if (!verifyToken(data.token, callback)) return;
      await handleChargerFault(data.chargerId);
      // Broadcast new state
      const chargers = await prisma.charger.findMany();
      const queue = await prisma.chargingRequest.findMany({ where: { status: 'PENDING' } });
      io.emit('initialState', { chargers, queue });
      if (callback) callback({ success: true });
    });

    // Handle complete session
    socket.on('completeSession', async (data: { chargerId: string, token: string }, callback) => {
      if (!verifyToken(data.token, callback)) return;
      const charger = await prisma.charger.findUnique({ where: { id: data.chargerId } });
      if (charger && charger.vehicleId) {
        // Mark vehicle IDLE
        await prisma.vehicle.update({ where: { id: charger.vehicleId }, data: { status: 'IDLE' } });
        // Mark request COMPLETED
        await prisma.chargingRequest.updateMany({ 
          where: { vehicleId: charger.vehicleId, status: 'ALLOCATED' }, 
          data: { status: 'COMPLETED' } 
        });
        // Mark charger AVAILABLE
        await prisma.charger.update({ where: { id: data.chargerId }, data: { status: 'AVAILABLE', vehicleId: null } });
        
        // Let the engine process the queue for this freed charger
        const { processQueueForCharger } = require('./services/allocationEngine');
        await processQueueForCharger(data.chargerId);
      }
      
      // Broadcast new state
      const chargers = await prisma.charger.findMany();
      const queue = await prisma.chargingRequest.findMany({ where: { status: 'PENDING' } });
      io.emit('initialState', { chargers, queue });
      if (callback) callback({ success: true });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export const broadcastStateChange = (event: string, data: any) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};
