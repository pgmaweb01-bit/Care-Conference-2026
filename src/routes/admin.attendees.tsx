import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, Trash2, CheckCircle2 } from "lucide-react";
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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${kind}s by name, ID, organisation…`}
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium hover:bg-secondary"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Registration ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
              return (
                <tr key={r.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{d.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.organization ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.country ?? d.nationality ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.checkedInAt ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-medium text-gold-foreground">
                        <CheckCircle2 className="h-3 w-3" /> Checked-in
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(r)}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-primary hover:bg-secondary"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
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
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No {kind}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <DetailDrawer record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DetailDrawer({ record, onClose }: { record: AttendeeRecord; onClose: () => void }) {
  const d = record.data as Record<string, unknown>;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-border bg-card/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {record.type}
            </div>
            <h3 className="font-display text-xl">{String(d.fullName ?? "—")}</h3>
            <div className="mt-1 font-mono text-xs text-primary">{record.id}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
          >
            ✕
          </button>
        </div>
        <dl className="divide-y divide-border">
          {Object.entries(d).map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-4 px-6 py-3 text-sm">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="col-span-2 break-words text-foreground">{String(v) || "—"}</dd>
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
