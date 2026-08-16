import { Router } from 'express';
import prisma from '../services/prisma';
import { broadcastStateChange } from '../socket';

export const router = Router();

router.get('/', async (req, res) => {
  const vehicles = await prisma.vehicle.findMany();
  res.json(vehicles);
});

router.post('/', async (req, res) => {
  const vehicle = await prisma.vehicle.create({ data: req.body });
  broadcastStateChange('vehicle_created', vehicle);
  res.json(vehicle);
});
