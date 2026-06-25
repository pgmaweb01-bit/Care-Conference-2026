import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, XCircle, ScanLine, UserCheck } from "lucide-react";
import { findRegistration, setCheckIn, type AttendeeRecord } from "@/lib/registration";
import { useRegistrations, useInvalidateRegistrations } from "@/lib/use-registrations";
import { QrScanner } from "@/components/qr-scanner";

export const Route = createFileRoute("/admin/checkin")({
  component: CheckIn,
});

function CheckIn() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AttendeeRecord | null | "missing">(null);
  const [officer, setOfficer] = useState("Front Desk #1");
  const all = useRegistrations();
  const invalidate = useInvalidateRegistrations();

  async function lookup(raw: string) {
    let id = raw.trim();
    if (!id) return;
    try {
      const parsed = JSON.parse(id);
      if (parsed && typeof parsed.id === "string") id = parsed.id;
    } catch {
      /* not JSON */
    }
    const found = await findRegistration(id);
    setResult(found ?? "missing");
    return found;
  }

  async function search(e: FormEvent) {
    e.preventDefault();
    await lookup(query);
  }

  async function onScanned(text: string) {
    setQuery(text);
    const found = await lookup(text);
    if (found && !found.checkedInAt) {
      const updated = await setCheckIn(found.id, true);
      if (updated) setResult(updated);
      await invalidate();
    }
  }

  async function toggle(checkedIn: boolean) {
    if (!result || result === "missing") return;
    const updated = await setCheckIn(result.id, checkedIn);
    if (updated) setResult(updated);
    await invalidate();
  }

  const recentCheckins = all
    .filter((r) => r.checkedInAt)
    .sort((a, b) => (b.checkedInAt ?? "").localeCompare(a.checkedInAt ?? ""))
    .slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-foreground">Venue Check-in</h2>
              <p className="text-sm text-muted-foreground">
                Scan an attendee's QR code or enter their Registration ID manually.
              </p>
            </div>
          </div>

          <form onSubmit={search} className="mt-5 flex flex-wrap gap-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MYC2026-00001 or paste QR payload"
              className="flex-1 min-w-[240px] rounded-xl border border-input bg-card px-4 py-3 font-mono text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              <UserCheck className="h-4 w-4" /> Look up
            </button>
          </form>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium">Officer:</span>
            <input
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium transition-all focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
        </div>

        <QrScanner onDetected={onScanned} />

        {result === "missing" && (
          <div className="animate-fade-in rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-5 w-5" />
              </div>
              <div className="font-medium">No registration found for "<span className="font-mono">{query}</span>"</div>
            </div>
          </div>
        )}

        {result && result !== "missing" && (
          <div className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
            <div className="bg-gradient-to-r from-primary via-primary/95 to-gold/80 px-6 py-5 text-primary-foreground">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <span className={`h-1.5 w-1.5 rounded-full ${result.checkedInAt ? "bg-gold" : "bg-white/60"}`} />
                {result.type}
              </div>
              <div className="mt-2 font-display text-2xl font-extrabold">
                {String((result.data as { fullName?: string }).fullName ?? "—")}
              </div>
              <div className="mt-1 font-mono text-sm opacity-80">{result.id}</div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <Detail
                label="Organisation"
                value={String((result.data as { organization?: string }).organization ?? "—")}
              />
              <Detail
                label="Country"
                value={String(
                  (result.data as { country?: string; nationality?: string }).country ??
                    (result.data as { nationality?: string }).nationality ??
                    "—",
                )}
              />
              <Detail
                label="Email"
                value={String((result.data as { email?: string }).email ?? "—")}
              />
              <Detail
                label="Phone"
                value={String((result.data as { phone?: string }).phone ?? "—")}
              />
              <Detail
                label="Attendance Status"
                value={
                  result.checkedInAt
                    ? `Checked in · ${new Date(result.checkedInAt).toLocaleString()}`
                    : "Not yet checked in"
                }
                accent={result.checkedInAt ? "gold" : "muted"}
              />
              <Detail label="By" value={result.checkedInAt ? officer : "—"} />
            </div>
            <div className="flex gap-3 border-t border-border bg-secondary/30 px-6 py-4">
              {result.checkedInAt ? (
                <button
                  onClick={() => toggle(false)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium shadow-sm transition-all hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                >
                  <XCircle className="h-4 w-4" /> Undo Check-in
                </button>
              ) : (
                <button
                  onClick={() => toggle(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
                >
                  <CheckCircle2 className="h-4 w-4" /> Check In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <h3 className="font-display text-lg font-extrabold text-foreground">Recent Check-ins</h3>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {recentCheckins.map((r) => {
            const name = String((r.data as { fullName?: string }).fullName ?? "—");
            const initial = name.charAt(0).toUpperCase();
            return (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold-foreground">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
                </div>
                <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {new Date(r.checkedInAt!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            );
          })}
          {recentCheckins.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">No check-ins yet.</li>
          )}
        </ul>
      </aside>
    </div>
  );
}

function Detail({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold" | "muted";
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-1 text-sm ${accent === "gold" ? "font-medium text-gold-foreground" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
