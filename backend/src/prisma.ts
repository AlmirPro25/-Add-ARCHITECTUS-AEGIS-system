
import { PrismaClient } from '@prisma/client';
import { Logger } from './utils/logger';

// Singleton pattern for Prisma Client to prevent connection exhaustion
const prisma = new PrismaClient({
  log: ['error', 'warn'], // Log only errors and warnings to avoid verbosity
});

prisma.$connect()
  .then(() => {
    Logger.info('Prisma connected to database.');
  })
  .catch((e) => {
    Logger.error('Prisma connection failed!', e);
    process.exit(1);
  });

export default prisma;
