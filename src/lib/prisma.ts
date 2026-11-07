import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// On Vercel / serverless runtimes, ensure /tmp/dev.db exists and has the seeded data
if (process.env.NODE_ENV === 'production') {
  try {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      // Look for the seeded database in the deployed project root
      const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      }
    }
  } catch (err) {
    console.error('Error preparing database in /tmp:', err);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

