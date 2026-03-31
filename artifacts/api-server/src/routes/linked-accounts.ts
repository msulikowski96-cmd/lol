import { Router } from "express";
import { db } from "@workspace/db";
import { linkedAccountsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/linked-accounts", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "unauthorized", message: "Musisz być zalogowany." });
    return;
  }
  try {
    const accounts = await db
      .select()
      .from(linkedAccountsTable)
      .where(eq(linkedAccountsTable.userId, req.user.id));
    res.json(accounts);
  } catch {
    res.status(500).json({ error: "db_error", message: "Błąd bazy danych." });
  }
});

router.post("/linked-accounts", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "unauthorized", message: "Musisz być zalogowany." });
    return;
  }
  const { gameName, tagLine, region } = req.body as { gameName?: string; tagLine?: string; region?: string };
  if (!gameName || !tagLine || !region) {
    res.status(400).json({ error: "bad_request", message: "Brak wymaganych pól: gameName, tagLine, region." });
    return;
  }
  try {
    const existing = await db
      .select()
      .from(linkedAccountsTable)
      .where(eq(linkedAccountsTable.userId, req.user.id));
    if (existing.length >= 5) {
      res.status(400).json({ error: "limit_reached", message: "Możesz przypisać maksymalnie 5 kont LoL." });
      return;
    }
    const [account] = await db
      .insert(linkedAccountsTable)
      .values({ userId: req.user.id, gameName, tagLine, region })
      .onConflictDoNothing()
      .returning();
    res.json(account ?? existing.find(a => a.gameName === gameName && a.tagLine === tagLine && a.region === region));
  } catch {
    res.status(500).json({ error: "db_error", message: "Błąd bazy danych." });
  }
});

router.delete("/linked-accounts/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "unauthorized", message: "Musisz być zalogowany." });
    return;
  }
  try {
    await db
      .delete(linkedAccountsTable)
      .where(and(eq(linkedAccountsTable.id, req.params.id), eq(linkedAccountsTable.userId, req.user.id)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "db_error", message: "Błąd bazy danych." });
  }
});

export default router;
