import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? randomBytes(32).toString("hex");
const JWT_EXPIRES_IN = "30d";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const hashBuf = Buffer.from(hash, "hex");
    const derivedBuf = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuf, derivedBuf);
  } catch {
    return false;
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export function getUserFromRequest(req: { headers: { authorization?: string } }): { userId: string; email: string } | null {
  const token = extractToken(req.headers.authorization);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return { userId: decoded.sub, email: decoded.email };
}
