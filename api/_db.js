import { PrismaClient } from '@prisma/client';

// En serverless, cada invocación puede reusar el contenedor. Guardamos el
// cliente en global para no abrir una conexión nueva en cada request.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}
