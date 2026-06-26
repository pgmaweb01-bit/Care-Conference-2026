import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Login · Care Conference 2026" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { auth, login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.status === "authenticated") {
      router.navigate({ to: "/admin" });
    }
  }, [auth.status, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await login(username, password);
      if (!ok) setError("Invalid username or password");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-gold/5 px-4">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="relative rounded-3xl border border-border/60 bg-card/90 p-8 shadow-[var(--shadow-elegant)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              Care Conference 2026
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Admin sign in</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full rounded-xl border-2 border-transparent bg-secondary/70 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-gold focus:bg-card focus:outline-none focus:shadow-[0_0_0_4px_oklch(0.769_0.188_70/0.15)]"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-transparent bg-secondary/70 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-gold focus:bg-card focus:outline-none focus:shadow-[0_0_0_4px_oklch(0.769_0.188_70/0.15)]"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                <span className="font-medium">Error:</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary to-primary/80 px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
