import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let poolInstance: any = null;
let dbInstance: any = null;

try {
  if (process.env.DATABASE_URL) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    dbInstance = drizzle(poolInstance, { schema });
  } else {
    throw new Error("DATABASE_URL must be set");
  }
} catch {
  console.warn("[AI Studio] Database not connected — using mock database layer");
  const createChain = () => {
    const chain: any = {
      from: () => chain,
      where: () => chain,
      limit: () => chain,
      offset: () => chain,
      orderBy: () => chain,
      values: () => chain,
      set: () => chain,
      returning: async () => [],
      onConflictDoUpdate: () => chain,
      onConflictDoNothing: () => chain,
      then: (resolve: any) => resolve([]),
      catch: () => Promise.resolve([]),
      [Symbol.asyncIterator]: async function* () {
        yield* [];
      },
    };
    return chain;
  };
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  dbInstance = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "query") return new Proxy({}, { get: () => noOp });
        if (
          prop === "select" ||
          prop === "insert" ||
          prop === "update" ||
          prop === "delete"
        ) {
          return createChain;
        }
        return async () => [];
      },
    },
  );
}

export const pool = poolInstance;
export const db = dbInstance;

export * from "./schema";

