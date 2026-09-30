import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const createPrismaClient = (): PrismaClient => {
    const adapter = new PrismaMariaDb(env.DATABASE_URL);
    return new PrismaClient({
        adapter,
        log: env.NODE_ENV === "development" ? [ "error", "warn" ] : [ "error" ],
    });
};

export const prisma: PrismaClient = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());
