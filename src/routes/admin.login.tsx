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
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) setError("Invalid username or password");
  }

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Checking session…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
          <div className="mb-8 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              Care Conference
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground">
              PURPLE
              <br />
              GLOBAL
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Admin sign in</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full rounded-xl border-2 border-transparent bg-secondary/70 px-4 py-3 text-sm focus:border-gold focus:bg-card focus:outline-none focus:shadow-[0_0_0_4px_oklch(0.769_0.188_70/0.15)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-transparent bg-secondary/70 px-4 py-3 text-sm focus:border-gold focus:bg-card focus:outline-none focus:shadow-[0_0_0_4px_oklch(0.769_0.188_70/0.15)]"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
