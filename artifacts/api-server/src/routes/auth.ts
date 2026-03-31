import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { hashPassword, verifyPassword, generateToken } from "../lib/auth";

const router: IRouter = Router();

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

ensureUsersTable().catch(console.error);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Adres email i hasło są wymagane" });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: "Nieprawidłowy adres email" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Hasło musi mieć co najmniej 6 znaków" });
    return;
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "Konto z tym adresem email już istnieje" });
      return;
    }

    const hash = hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email.toLowerCase(), hash],
    );
    const user = result.rows[0];
    const token = generateToken(user.id, user.email);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Błąd serwera podczas rejestracji" });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Adres email i hasło są wymagane" });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()],
    );
    if (result.rows.length === 0) {
      res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
      return;
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
      return;
    }

    const token = generateToken(user.id, user.email);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Błąd serwera podczas logowania" });
  }
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Brak tokenu autoryzacji" });
    return;
  }

  const { verifyToken } = await import("../lib/auth");
  const decoded = verifyToken(authHeader.slice(7));
  if (!decoded) {
    res.status(401).json({ error: "Nieprawidłowy lub wygasły token" });
    return;
  }

  try {
    const result = await pool.query("SELECT id, email, created_at FROM users WHERE id = $1", [decoded.sub]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Użytkownik nie istnieje" });
      return;
    }
    res.json({ user: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

export default router;
