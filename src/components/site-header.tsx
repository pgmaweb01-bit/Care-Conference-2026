import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[image:var(--gradient-band)] text-primary-foreground font-display text-lg font-bold">
            C
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold text-foreground">
              Care Conference
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              2026 · Nigeria
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/register" className="hover:text-foreground transition-colors">
            Attendee
          </Link>
          <Link to="/register/speaker" className="hover:text-foreground transition-colors">
            Speaker
          </Link>
        </nav>
        <Link
          to="/register"
          className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Register
        </Link>
      </div>
    </header>
  );
}
