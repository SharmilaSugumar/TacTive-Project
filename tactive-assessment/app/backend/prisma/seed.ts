import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing
  await prisma.charger.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.chargingRequest.deleteMany();

  // Create Chargers
  const chargers = [
    { type: 'CCS', status: 'AVAILABLE' },
    { type: 'CCS', status: 'AVAILABLE' },
    { type: 'CCS', status: 'AVAILABLE' },
    { type: 'Type 2', status: 'AVAILABLE' },
    { type: 'Type 2', status: 'AVAILABLE' },
  ];

  for (const c of chargers) {
    await prisma.charger.create({ data: c });
  }

  console.log('Database seeded with 5 available chargers (3x CCS, 2x Type 2)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
