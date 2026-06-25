import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, Trash2, CheckCircle2, X, Eye, ChevronRight } from "lucide-react";
import { useRegistrations, useInvalidateRegistrations } from "@/lib/use-registrations";
import { deleteRegistration, downloadCSV, type AttendeeRecord } from "@/lib/registration";

export function RegistrationsTable({ kind }: { kind: "attendee" | "speaker" }) {
  const all = useRegistrations();
  const invalidate = useInvalidateRegistrations();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<AttendeeRecord | null>(null);

  const rows = useMemo(() => {
    return all
      .filter((r) => r.type === kind)
      .filter((r) => {
        if (!q) return true;
        const blob = `${r.id} ${JSON.stringify(r.data)}`.toLowerCase();
        return blob.includes(q.toLowerCase());
      })
      .reverse();
  }, [all, kind, q]);

  function exportCSV() {
    downloadCSV(
      `${kind}s.csv`,
      rows.map((r) => ({
        registration_id: r.id,
        created_at: r.createdAt,
        checked_in_at: r.checkedInAt ?? "",
        ...r.data,
      })),
    );
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete ${id}?`)) return;
    await deleteRegistration(id);
    await invalidate();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${kind}s by name, ID, organisation…`}
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-3 text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium shadow-sm transition-all hover:border-gold/30 hover:bg-gold/5 hover:text-gold-foreground"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Registration ID</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Organisation</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Country</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const d = r.data as {
                  fullName?: string;
                  organization?: string;
                  country?: string;
                  nationality?: string;
                };
                const initial = (d.fullName ?? "?").charAt(0).toUpperCase();
                return (
                  <tr key={r.id} className="group transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-medium text-primary">{r.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initial}
                        </div>
                        <span className="font-medium text-foreground">{d.fullName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{d.organization ?? "—"}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {d.country ?? d.nationality ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {r.checkedInAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
                          <CheckCircle2 className="h-3 w-3" /> Checked-in
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelected(r)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/10"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="rounded-lg p-1.5 text-destructive/60 transition-all hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-6 w-6 text-muted-foreground/40" />
                      <span>No {kind}s found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <DetailDrawer record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DetailDrawer({ record, onClose }: { record: AttendeeRecord; onClose: () => void }) {
  const d = record.data as Record<string, unknown>;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-lg animate-slide-right overflow-y-auto border-l border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-6 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {record.type}
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold">{String(d.fullName ?? "—")}</h3>
              <div className="mt-1 font-mono text-sm opacity-80">{record.id}</div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {record.checkedInAt && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold text-gold">
              <CheckCircle2 className="h-3 w-3" />
              Checked in · {new Date(record.checkedInAt).toLocaleString()}
            </div>
          )}
        </div>
        <dl className="divide-y divide-border">
          {Object.entries(d).map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-4 px-6 py-3.5 text-sm transition-colors hover:bg-secondary/20">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
              </dt>
              <dd className="col-span-2 break-words font-medium text-foreground">
                {typeof v === "string" && (v.startsWith("http://") || v.startsWith("https://")) ? (
                  <a href={v} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-gold-foreground">
                    {v}
                  </a>
                ) : (
                  String(v) || <span className="text-muted-foreground/60">—</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/attendees")({
  component: () => <RegistrationsTable kind="attendee" />,
});
