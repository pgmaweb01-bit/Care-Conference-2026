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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
      <div className="relative px-7 pb-10 pt-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow" />
          Care Conference
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold leading-none tracking-tight">
          <span className="text-white">CARE</span>
          <br />
          <span className="text-gold">CONFERENCE</span>
          <br />
          <span className="text-xs tracking-widest text-gold/60">2026</span>
        </h1>
      </div>
      <nav className="relative flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-gold to-gold/90 text-gold-foreground shadow-lg shadow-black/20"
                  : "text-primary-foreground/60 hover:bg-white/5 hover:text-primary-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="relative mt-auto border-t border-white/5 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-gold/20 to-gold/5 font-bold text-gold shadow-inner">
            {auth.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{auth.username}</div>
            <div className="text-xs text-primary-foreground/50">Admin</div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Link
            to="/"
            onClick={onNavClick}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-primary-foreground/50 transition-all hover:bg-white/5 hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
          <button
            onClick={() => {
              logout();
              router.navigate({ to: "/admin/login" });
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-primary-foreground/50 transition-all hover:bg-white/5 hover:text-gold"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}

function AdminLayout() {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/60">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (isLoginPage) {
    return <Outlet />;
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/60">
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
    <div className="flex min-h-screen bg-secondary/60">
      {/* Desktop sidebar */}
      <aside className="relative hidden w-72 shrink-0 flex-col bg-primary text-primary-foreground md:flex">
        <SidebarContent pathname={pathname} auth={auth} logout={logout} router={router} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-primary p-0 text-primary-foreground [&>button]:text-gold">
          <SidebarContent pathname={pathname} auth={auth} logout={logout} router={router} onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur md:px-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 -ml-1.5 md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                Admin Console
              </div>
              <div className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                {nav.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)))?.label ??
                  "Overview"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Signed in as
              </div>
              <div className="text-sm font-bold text-foreground">{auth.username}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-md">
              {auth.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
