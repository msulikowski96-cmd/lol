import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { usersTable, usageTable, conversations, messages } from "./schema";

const { Pool } = pg;

// In-memory data store fallback
interface MemoryUser {
  id: number;
  email: string;
  passwordHash: string;
  displayName: string | null;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface MemoryUsage {
  id: number;
  userId: number;
  feature: string;
  day: string;
  count: number;
}

interface MemoryConversation {
  id: number;
  title: string;
  createdAt: Date;
}

interface MemoryMessage {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: Date;
}

const memoryStore = {
  users: [] as MemoryUser[],
  usage: [] as MemoryUsage[],
  conversations: [] as MemoryConversation[],
  messages: [] as MemoryMessage[],
  nextUserId: 1,
  nextUsageId: 1,
  nextConvId: 1,
  nextMsgId: 1,
};

// Seed default admin user in memory
const ADMIN_EMAIL = "msulikowski96@gmail.com";

let poolInstance: any = null;
let realDrizzleDb: any = null;
let isConnectedToPostgres = false;

// Determine if DATABASE_URL is an internal-only Render host
const rawUrl = process.env.DATABASE_URL?.trim();
const isInternalRenderHost = rawUrl ? /@dpg-[a-z0-9]+(?::\d+)?\//.test(rawUrl) : false;

if (isInternalRenderHost) {
  console.warn(
    "[AI Studio] DATABASE_URL appears to be an internal Render hostname (e.g. dpg-xxx). " +
    "Internal Render hostnames only resolve inside Render's internal network. " +
    "Nexus Sight will use resilient in-memory storage. " +
    "To connect directly to Render PostgreSQL, use the 'External Database URL' from your Render dashboard."
  );
} else if (rawUrl) {
  try {
    poolInstance = new Pool({
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000,
    });
    realDrizzleDb = drizzle(poolInstance, { schema });
  } catch (err) {
    console.warn("[AI Studio] Failed to construct PostgreSQL Pool:", err);
  }
}

// Memory query runner
function getStoreForTable(table: any): any[] {
  if (table === usersTable || table?._?.name === "users") return memoryStore.users;
  if (table === usageTable || table?._?.name === "usage") return memoryStore.usage;
  if (table === conversations || table?._?.name === "conversations") return memoryStore.conversations;
  if (table === messages || table?._?.name === "messages") return memoryStore.messages;
  return [];
}

function matchCondition(item: any, whereClause: any): boolean {
  if (!whereClause) return true;

  // Handle drizzle eq, and, gte, etc. expressions
  if (whereClause.operator === "=" || whereClause.name === "eq") {
    const fieldName = whereClause.left?.name || whereClause.column?.name;
    const value = whereClause.right?.value !== undefined ? whereClause.right.value : whereClause.value;
    if (fieldName) {
      const key = fieldName === "password_hash" ? "passwordHash" :
                  fieldName === "display_name" ? "displayName" :
                  fieldName === "is_admin" ? "isAdmin" :
                  fieldName === "is_active" ? "isActive" :
                  fieldName === "created_at" ? "createdAt" :
                  fieldName === "last_login_at" ? "lastLoginAt" :
                  fieldName === "user_id" ? "userId" :
                  fieldName === "conversation_id" ? "conversationId" : fieldName;
      return item[key] == value;
    }
  }

  if (whereClause.operator === "and" || (whereClause.conditions && Array.isArray(whereClause.conditions))) {
    const conditions = whereClause.conditions || whereClause.children || [];
    return conditions.every((c: any) => matchCondition(item, c));
  }

  if (whereClause.operator === ">=" || whereClause.name === "gte") {
    const fieldName = whereClause.left?.name || whereClause.column?.name;
    const value = whereClause.right?.value !== undefined ? whereClause.right.value : whereClause.value;
    if (fieldName) {
      return (item[fieldName] ?? "") >= (value ?? "");
    }
  }

  // Fallback: search values inside object
  try {
    const str = JSON.stringify(whereClause);
    if (item.email && str.includes(JSON.stringify(item.email))) return true;
    if (item.id && str.includes(`"value":${item.id}`)) return true;
  } catch {}

  return true;
}

const memoryDb: any = {
  select: () => {
    let targetTable: any = null;
    let whereCondition: any = null;
    let limitVal: number | null = null;
    let orderDesc = false;

    const queryBuilder: any = {
      from: (table: any) => {
        targetTable = table;
        return queryBuilder;
      },
      where: (condition: any) => {
        whereCondition = condition;
        return queryBuilder;
      },
      limit: (n: number) => {
        limitVal = n;
        return queryBuilder;
      },
      orderBy: (order: any) => {
        orderDesc = !!order;
        return queryBuilder;
      },
      then: (resolve: any, reject?: any) => {
        try {
          const store = getStoreForTable(targetTable);
          let filtered = store.filter((item) => matchCondition(item, whereCondition));
          if (orderDesc) {
            filtered = [...filtered].reverse();
          }
          if (limitVal !== null) {
            filtered = filtered.slice(0, limitVal);
          }
          return resolve(filtered);
        } catch (e) {
          if (reject) reject(e);
          else throw e;
        }
      },
      catch: (reject: any) => queryBuilder.then((res: any) => res, reject),
    };
    return queryBuilder;
  },

  insert: (table: any) => {
    let insertValues: any = null;
    let onConflictAction: any = null;

    const insertBuilder: any = {
      values: (val: any) => {
        insertValues = val;
        return insertBuilder;
      },
      onConflictDoUpdate: (config: any) => {
        onConflictAction = config;
        return insertBuilder;
      },
      onConflictDoNothing: () => insertBuilder,
      returning: () => insertBuilder,
      then: (resolve: any, reject?: any) => {
        try {
          const store = getStoreForTable(table);
          if (table === usersTable || table?._?.name === "users") {
            const id = memoryStore.nextUserId++;
            const user: MemoryUser = {
              id,
              email: insertValues.email,
              passwordHash: insertValues.passwordHash,
              displayName: insertValues.displayName ?? null,
              isAdmin: insertValues.isAdmin ?? (insertValues.email === ADMIN_EMAIL),
              isActive: insertValues.isActive ?? true,
              createdAt: new Date(),
              lastLoginAt: null,
            };
            store.push(user);
            return resolve([user]);
          }

          if (table === usageTable || table?._?.name === "usage") {
            const existing = memoryStore.usage.find(
              (u) => u.userId === insertValues.userId && u.feature === insertValues.feature && u.day === insertValues.day
            );
            if (existing && onConflictAction) {
              existing.count += 1;
              return resolve([existing]);
            }
            const id = memoryStore.nextUsageId++;
            const row: MemoryUsage = {
              id,
              userId: insertValues.userId,
              feature: insertValues.feature,
              day: insertValues.day,
              count: insertValues.count ?? 1,
            };
            store.push(row);
            return resolve([row]);
          }

          const id = Date.now();
          const item = { id, ...insertValues, createdAt: new Date() };
          store.push(item);
          return resolve([item]);
        } catch (e) {
          if (reject) reject(e);
          else throw e;
        }
      },
      catch: (reject: any) => insertBuilder.then((res: any) => res, reject),
    };
    return insertBuilder;
  },

  update: (table: any) => {
    let updateSet: any = null;
    let whereCondition: any = null;

    const updateBuilder: any = {
      set: (val: any) => {
        updateSet = val;
        return updateBuilder;
      },
      where: (condition: any) => {
        whereCondition = condition;
        return updateBuilder;
      },
      returning: () => updateBuilder,
      then: (resolve: any, reject?: any) => {
        try {
          const store = getStoreForTable(table);
          const updatedItems: any[] = [];
          for (let i = 0; i < store.length; i++) {
            if (matchCondition(store[i], whereCondition)) {
              store[i] = { ...store[i], ...updateSet };
              updatedItems.push(store[i]);
            }
          }
          return resolve(updatedItems);
        } catch (e) {
          if (reject) reject(e);
          else throw e;
        }
      },
      catch: (reject: any) => updateBuilder.then((res: any) => res, reject),
    };
    return updateBuilder;
  },

  delete: (table: any) => {
    let whereCondition: any = null;
    const deleteBuilder: any = {
      where: (condition: any) => {
        whereCondition = condition;
        return deleteBuilder;
      },
      then: (resolve: any, reject?: any) => {
        try {
          const store = getStoreForTable(table);
          for (let i = store.length - 1; i >= 0; i--) {
            if (matchCondition(store[i], whereCondition)) {
              store.splice(i, 1);
            }
          }
          return resolve([]);
        } catch (e) {
          if (reject) reject(e);
          else throw e;
        }
      },
      catch: (reject: any) => deleteBuilder.then((res: any) => res, reject),
    };
    return deleteBuilder;
  },
};

// Resilient DB wrapper that delegates to real PostgreSQL if available and healthy,
// or gracefully falls back to the in-memory database if connection fails or drops.
export const db = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (isConnectedToPostgres && realDrizzleDb && realDrizzleDb[prop]) {
        const realFn = realDrizzleDb[prop];
        if (typeof realFn === "function") {
          return (...args: any[]) => {
            try {
              const result = realFn.apply(realDrizzleDb, args);
              // If returned object is a promise or thenable, catch network errors and fallback
              if (result && typeof result.then === "function") {
                return result.catch((err: any) => {
                  console.warn(`[AI Studio] PostgreSQL query failed (${err?.message}). Falling back to memory store.`);
                  isConnectedToPostgres = false;
                  return (memoryDb as any)[prop](...args);
                });
              }
              return result;
            } catch (err: any) {
              console.warn(`[AI Studio] PostgreSQL call error (${err?.message}). Falling back to memory store.`);
              isConnectedToPostgres = false;
              return (memoryDb as any)[prop](...args);
            }
          };
        }
      }
      return (memoryDb as any)[prop];
    },
  }
);

export async function initDatabase() {
  if (!poolInstance || isInternalRenderHost) {
    console.log("[AI Studio] Using memory database store for session & user persistence");
    return;
  }
  try {
    const client = await poolInstance.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL PRIMARY KEY,
          "email" TEXT NOT NULL,
          "password_hash" TEXT NOT NULL,
          "display_name" TEXT,
          "is_admin" BOOLEAN NOT NULL DEFAULT false,
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "last_login_at" TIMESTAMP WITH TIME ZONE
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");

        CREATE TABLE IF NOT EXISTS "usage" (
          "id" SERIAL PRIMARY KEY,
          "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "feature" TEXT NOT NULL,
          "day" TEXT NOT NULL,
          "count" INTEGER NOT NULL DEFAULT 0
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "usage_user_feature_day_unique" ON "usage" ("user_id", "feature", "day");
        CREATE INDEX IF NOT EXISTS "usage_user_day_idx" ON "usage" ("user_id", "day");

        CREATE TABLE IF NOT EXISTS "conversations" (
          "id" SERIAL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS "messages" (
          "id" SERIAL PRIMARY KEY,
          "conversation_id" INTEGER NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
          "role" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      isConnectedToPostgres = true;
      console.log("[AI Studio] PostgreSQL database schema verified and ready");
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnectedToPostgres = false;
    console.warn("[AI Studio] Database connection check failed (" + err?.message + "). Using in-memory fallback.");
  }
}

export const pool = poolInstance;
export * from "./schema";
