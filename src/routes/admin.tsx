import { useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Mic,
  ScanLine,
  Mail,
  FileBarChart,
  ArrowLeft,
  LogOut,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/use-theme";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Care Conference 2026" },
      { name: "description", content: "Conference administration dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/attendees", label: "Attendees", icon: Users, exact: false },
  { to: "/admin/speakers", label: "Speakers", icon: Mic, exact: false },
  { to: "/admin/checkin", label: "Check-in", icon: ScanLine, exact: false },
  { to: "/admin/communications", label: "Communications", icon: Mail, exact: false },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart, exact: false },
] as const;

function SidebarContent({ pathname, auth, logout, router, onNavClick }: {
  pathname: string;
  auth: ReturnType<typeof useAuth>["auth"];
  logout: ReturnType<typeof useAuth>["logout"];
  router: ReturnType<typeof useRouter>;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-8 pt-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Care Conference
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold leading-none tracking-tight text-white">
          CARE
          <br />
          <span className="text-gold">CONFERENCE</span>
          <br />
          <span className="text-[10px] tracking-widest text-white/40">2026</span>
        </h1>
      </div>
      <nav className="flex-1 space-y-0.5 px-4">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={`group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "" : "group-hover:scale-110 transition-transform"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-6 py-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-bold text-white text-sm">
            {auth.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{auth.username}</div>
            <div className="text-xs text-white/40">Admin</div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            to="/"
            onClick={onNavClick}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-medium text-white/40 transition-all hover:bg-white/5 hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
          <button
            onClick={() => {
              logout();
              router.navigate({ to: "/admin/login" });
            }}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-medium text-white/40 transition-all hover:bg-white/5 hover:text-white/70"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminLayout() {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const isLoginPage = pathname === "/admin/login";

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (isLoginPage) {
    return <Outlet />;
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-sm px-4">
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Access restricted
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to access the admin console.</p>
          <Link
            to="/admin/login"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="relative hidden w-64 shrink-0 flex-col bg-[oklch(0.18_0.04_270)] md:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" />
        <SidebarContent pathname={pathname} auth={auth} logout={logout} router={router} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-[oklch(0.18_0.04_270)] p-0 text-white [&>button]:text-gold">
          <SidebarContent pathname={pathname} auth={auth} logout={logout} router={router} onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/90 px-6 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 -ml-2 md:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                Admin Console
              </div>
              <div className="font-display text-xl font-bold tracking-tight text-foreground">
                {nav.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)))?.label ??
                  "Overview"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border">
              <div className="text-right">
                <div className="text-xs font-medium text-foreground">{auth.username}</div>
                <div className="text-[10px] text-muted-foreground">Admin</div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
                {auth.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
