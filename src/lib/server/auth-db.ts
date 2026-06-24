import { createHmac, randomBytes } from "node:crypto";

export function getAdminUsername(): string {
  const val = (process.env.ADMIN_USERNAME || "").trim();
  return val || "admin";
}
export function getAdminPassword(): string {
  const val = (process.env.ADMIN_PASSWORD || "").trim();
  return val || "admin123";
}

function getSecret(): string {
  const val = (process.env.AUTH_SECRET || "").trim();
  return val || "dev-secret-do-not-use-in-prod";
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("hex").slice(0, 16);
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
  if (username !== getAdminUsername() || password !== getAdminPassword()) {
    console.log("[auth-db] validateCredentials FAILED", { username, password, expectedUser: getAdminUsername(), expectedPass: getAdminPassword() });
    return null;
  }
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
