// In production, replace with database-backed sessions
// For now, uses a simple admin password from environment or default

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `sess_${result}`;
}

// In-memory session store (resets on server restart)
const sessions = new Map<string, { username: string; createdAt: number }>();

export function validateCredentials(
  username: string,
  password: string,
): { token: string; username: string } | null {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return null;
  const token = generateToken();
  sessions.set(token, { username, createdAt: Date.now() });
  return { token, username };
}

export function getSession(token: string): { username: string } | null {
  const session = sessions.get(token);
  if (!session) return null;
  return { username: session.username };
}

export function destroySession(token: string): void {
  sessions.delete(token);
}
