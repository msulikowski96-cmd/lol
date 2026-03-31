import { sql } from "drizzle-orm";
import { pgTable, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const linkedAccountsTable = pgTable(
  "linked_accounts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    gameName: varchar("game_name", { length: 64 }).notNull(),
    tagLine: varchar("tag_line", { length: 16 }).notNull(),
    region: varchar("region", { length: 8 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("linked_accounts_user_game_idx").on(table.userId, table.gameName, table.tagLine, table.region),
  ],
);

export type LinkedAccount = typeof linkedAccountsTable.$inferSelect;
export type InsertLinkedAccount = typeof linkedAccountsTable.$inferInsert;
