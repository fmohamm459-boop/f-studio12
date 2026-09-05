import { PrismaClient } from "@prisma/client";
import { createInMemoryPrismaClient } from "./in-memory-db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};


function getPrismaInstance() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[AI Studio] DATABASE_URL not set — using in-memory database");
    }
    return createInMemoryPrismaClient();
  }

  try {
    const realPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

    const inMem = createInMemoryPrismaClient();

    // Wrap realPrisma in a Proxy to catch connection/runtime failures gracefully
    return new Proxy(realPrisma, {
      get(target, prop, receiver) {
        const orig = Reflect.get(target, prop, receiver);
        if (typeof orig === "object" && orig !== null && prop in inMem) {
          const inMemModel = (inMem as any)[prop];
          return new Proxy(orig, {
            get(mTarget, mProp, mReceiver) {
              const method = Reflect.get(mTarget, mProp, mReceiver);
              if (typeof method === "function") {
                return async (...args: any[]) => {
                  try {
                    return await method.apply(mTarget, args);
                  } catch (err) {
                    console.warn(
                      `[AI Studio] Database operation failed on ${String(prop)}.${String(mProp)}, falling back to in-memory store`,
                    );
                    if (typeof inMemModel?.[mProp] === "function") {
                      return await inMemModel[mProp](...args);
                    }
                    throw err;
                  }
                };
              }
              return method;
            },
          });
        }
        return orig;
      },
    });
  } catch (e) {
    console.warn("[AI Studio] Failed to initialize PrismaClient — using in-memory database");
    return createInMemoryPrismaClient();
  }
}

export const prisma: PrismaClient = (globalForPrisma.prisma ?? getPrismaInstance()) as unknown as PrismaClient;


if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

