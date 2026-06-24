import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { login as serverLogin, checkSession, logout as serverLogout } from "./auth-fns";

const SESSION_COOKIE = "myc2026_session";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(`(?:^|;\\s*)${name}=([^;]*)`);
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; username: string }
  | { status: "unauthenticated" };

type AuthContextType = {
  auth: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const token = getCookie(SESSION_COOKIE);
    if (!token) {
      setAuth({ status: "unauthenticated" });
      return;
    }
    checkSession(token).then((session) => {
      setAuth(
        session
          ? { status: "authenticated", username: session.username }
          : { status: "unauthenticated" },
      );
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    let result: Awaited<ReturnType<typeof serverLogin>>;
    try {
      result = await serverLogin({ username, password });
    } catch (err) {
      console.error("[auth] serverLogin threw:", err);
      throw err;
    }
    if (!result) return false;
    setCookie(SESSION_COOKIE, result.token);
    setAuth({ status: "authenticated", username: result.username });
    return true;
  }, []);

  const logout = useCallback(async () => {
    const token = getCookie(SESSION_COOKIE);
    if (token) {
      await serverLogout(token);
      deleteCookie(SESSION_COOKIE);
    }
    setAuth({ status: "unauthenticated" });
  }, []);

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
