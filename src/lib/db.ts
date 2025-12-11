/**
 * Prisma Database Client Singleton
 * 
 * This module provides a singleton instance of the Prisma Client
 * to prevent multiple connections in development with hot-reload.
 * 
 * Note: On Vercel/serverless, SQLite doesn't work. The app will automatically
 * fall back to sample data from JSON files in the API routes.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client - will gracefully fail on Vercel if SQLite is used
// API routes handle this by falling back to sample data
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

