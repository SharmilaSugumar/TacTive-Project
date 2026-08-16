import { Router } from 'express';
import prisma from '../services/prisma';
import { broadcastStateChange } from '../socket';

export const router = Router();

router.get('/', async (req, res) => {
  const chargers = await prisma.charger.findMany();
  res.json(chargers);
});

router.post('/', async (req, res) => {
  const charger = await prisma.charger.create({ data: req.body });
  broadcastStateChange('charger_created', charger);
  res.json(charger);
});

router.patch('/:id', async (req, res) => {
  const charger = await prisma.charger.update({
    where: { id: req.params.id },
    data: req.body
  });
  broadcastStateChange('charger_updated', charger);
  res.json(charger);
});
