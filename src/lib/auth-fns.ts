import { createServerFn } from "@tanstack/react-start";
import { validateCredentials, getSession, destroySession } from "./server/auth-db";

export const login = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { username: string; password: string })
  .handler(async ({ data }) => {
    const result = validateCredentials(data.username, data.password);
    return result;
  });

export const checkSession = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data: token }) => {
    if (!token) return null;
    return getSession(token);
  });

export const logout = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data: token }) => {
    destroySession(token);
    return { ok: true };
  });
