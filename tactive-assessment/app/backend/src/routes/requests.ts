import { Router } from 'express';
import prisma from '../services/prisma';
import { allocateCharger } from '../services/allocationEngine';
import { broadcastStateChange } from '../socket';

export const router = Router();

router.get('/', async (req, res) => {
  const requests = await prisma.chargingRequest.findMany();
  res.json(requests);
});

router.post('/', async (req, res) => {
  const { vehicleId, vehicleType } = req.body;
  try {
    const result = await allocateCharger(vehicleId, vehicleType);
    broadcastStateChange('request_processed', result);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
