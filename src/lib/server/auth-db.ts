import { createHmac, randomBytes } from "node:crypto";

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "").trim() || "admin";
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim() || "admin123";

// Used to sign session tokens so they can't be forged
const SECRET = (process.env.AUTH_SECRET || "").trim() || "dev-secret-do-not-use-in-prod";

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("hex").slice(0, 16);
}

function encodeSession(username: string): string {
  const id = randomBytes(16).toString("hex");
  const payload = `${id}:${username}:${Date.now()}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

function decodeSession(
  token: string,
): { username: string; createdAt: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 4) return null;
    const sig = parts.pop()!;
    const payload = parts.join(":");
    if (sign(payload) !== sig) return null;
    const [id, username, createdAtStr] = parts;
    const createdAt = Number(createdAtStr);
    if (!id || !username || isNaN(createdAt)) return null;
    return { username, createdAt };
  } catch {
    return null;
  }
}

export function validateCredentials(
  username: string,
  password: string,
): { token: string; username: string } | null {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return null;
  const token = encodeSession(username);
  return { token, username };
}

export function getSession(
  token: string,
): { username: string } | null {
  const session = decodeSession(token);
  if (!session) return null;
  return { username: session.username };
}

export function destroySession(_token: string): void {
  // Nothing to clean up — sessions are self-contained
}
