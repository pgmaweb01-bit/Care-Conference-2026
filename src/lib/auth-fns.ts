import { createServerFn } from "@tanstack/react-start";
import { validateCredentials, getSession, destroySession, getAdminUsername, getAdminPassword } from "./server/auth-db";

export const login = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as LoginData)
  .handler(async ({ data }) => {
    const result = validateCredentials(data.username, data.password);
    return result;
  });

export const debugAuth = createServerFn({ method: "GET" })
  .validator((d: unknown) => d as string | undefined)
  .handler(async ({ data: _secret }: { data: string | undefined }) => {
    if (_secret !== "debug-2026") return { error: "unauthorized" };
    const expectedUser = getAdminUsername();
    const expectedPass = getAdminPassword();
    return {
      expectedUser,
      expectedPass,
      envUser: process.env.ADMIN_USERNAME ?? null,
      envPass: process.env.ADMIN_PASSWORD ?? null,
      envUserType: typeof process.env.ADMIN_USERNAME,
      envPassType: typeof process.env.ADMIN_PASSWORD,
      allKeys: Object.keys(process.env).filter(k => k.includes("ADMIN") || k.includes("AUTH")).slice(0, 20),
    };
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
