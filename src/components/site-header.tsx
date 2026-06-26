import { Link } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

export function SiteHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary to-gold/80 text-primary-foreground font-display text-lg font-bold shadow-md transition-transform group-hover:scale-105">
            C
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold text-foreground">
              Care Conference
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              2026 · Nigeria
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </button>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/register" className="font-medium transition-colors hover:text-foreground">
              Register
            </Link>
          </nav>
          <Link
            to="/register"
            className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
