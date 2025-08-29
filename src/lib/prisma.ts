// This file exports a single, shared instance of the Prisma client.
// This is a best practice to avoid creating too many database connections.
import { PrismaClient } from '@prisma/client';

// The singleton pattern ensures that only one PrismaClient instance is created.
// In development, Next.js hot-reloading can create multiple instances, so we
// store the instance on the global object to persist it across reloads.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
