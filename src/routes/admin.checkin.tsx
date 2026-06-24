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
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <ScanLine className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">Venue Check-in</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan an attendee's QR code or enter their Registration ID manually.
          </p>

          <form onSubmit={search} className="mt-5 flex flex-wrap gap-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MYC2026-00001 or paste QR payload"
              className="flex-1 min-w-[240px] rounded-lg border border-input bg-card px-4 py-3 font-mono text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <UserCheck className="h-4 w-4" /> Look up
            </button>
          </form>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Officer:</span>
            <input
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className="rounded border border-border bg-card px-2 py-0.5 text-xs"
            />
          </div>
        </div>

        <QrScanner onDetected={onScanned} />

        {result === "missing" && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5" />
              <div className="font-medium">No registration found for "{query}"</div>
            </div>
          </div>
        )}

        {result && result !== "missing" && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
            <div className="bg-[image:var(--gradient-band)] px-6 py-4 text-primary-foreground">
              <div className="text-[11px] uppercase tracking-[0.22em] opacity-80">
                {result.type}
              </div>
              <div className="font-display text-2xl">
                {String((result.data as { fullName?: string }).fullName ?? "—")}
              </div>
              <div className="font-mono text-sm opacity-90">{result.id}</div>
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
            <div className="flex gap-3 border-t border-border bg-secondary/40 px-6 py-4">
              {result.checkedInAt ? (
                <button
                  onClick={() => toggle(false)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium hover:bg-secondary"
                >
                  <XCircle className="h-4 w-4" /> Undo Check-in
                </button>
              ) : (
                <button
                  onClick={() => toggle(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <CheckCircle2 className="h-4 w-4" /> Check In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg">Recent Check-ins</h3>
        <ul className="mt-4 divide-y divide-border">
          {recentCheckins.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {String((r.data as { fullName?: string }).fullName ?? "—")}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {new Date(r.checkedInAt!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
          {recentCheckins.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">No check-ins yet.</li>
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
