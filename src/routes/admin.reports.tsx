import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { useRegistrations } from "@/lib/use-registrations";
import { downloadCSV } from "@/lib/registration";

export const Route = createFileRoute("/admin/reports")({
  component: Reports,
});

function Reports() {
  const all = useRegistrations();

  const reports = useMemo(() => {
    const attendees = all.filter((r) => r.type === "attendee");
    const speakers = all.filter((r) => r.type === "speaker");

    const countByKey = (records: typeof all, key: string) => {
      const map = new Map<string, number>();
      records.forEach((r) => {
        const v = String((r.data as Record<string, unknown>)[key] ?? "Unknown");
        map.set(v, (map.get(v) ?? 0) + 1);
      });
      return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    };

    return [
      {
        id: "attendees",
        title: "Attendee List",
        description: "Complete list of all attendee registrations with full details.",
        count: attendees.length,
        rows: () =>
          attendees.map((r) => ({
            id: r.id,
            created_at: r.createdAt,
            checked_in_at: r.checkedInAt ?? "",
            ...r.data,
          })),
      },
      {
        id: "speakers",
        title: "Speaker List",
        description: "All confirmed speakers with session and travel information.",
        count: speakers.length,
        rows: () => speakers.map((r) => ({ id: r.id, created_at: r.createdAt, ...r.data })),
      },
      {
        id: "countries",
        title: "Country Analysis",
        description: "Registration counts grouped by country of residence.",
        count: countByKey(all, "country").length,
        rows: () => countByKey(all, "country"),
      },
      {
        id: "professions",
        title: "Professional Category Analysis",
        description: "Distribution of attendees across professional categories.",
        count: countByKey(all, "profession").length,
        rows: () => countByKey(all, "profession"),
      },
      {
        id: "attendance",
        title: "Attendance Report",
        description: "Snapshot of confirmed vs pending registrations.",
        count: all.length,
        rows: () =>
          all.map((r) => ({
            id: r.id,
            name: String((r.data as { fullName?: string }).fullName ?? ""),
            type: r.type,
            status: r.checkedInAt ? "checked-in" : "pending",
            created_at: r.createdAt,
          })),
      },
      {
        id: "checkins",
        title: "Check-in Report",
        description: "All recorded venue check-ins with timestamps.",
        count: all.filter((r) => r.checkedInAt).length,
        rows: () =>
          all
            .filter((r) => r.checkedInAt)
            .map((r) => ({
              id: r.id,
              name: String((r.data as { fullName?: string }).fullName ?? ""),
              checked_in_at: r.checkedInAt,
            })),
      },
    ];
  }, [all]);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((r) => {
        const icons = [
          { bg: "bg-primary/10", text: "text-primary" },
          { bg: "bg-gold/10", text: "text-gold" },
          { bg: "bg-emerald-500/10", text: "text-emerald-600" },
          { bg: "bg-sky-500/10", text: "text-sky-600" },
          { bg: "bg-violet-500/10", text: "text-violet-600" },
          { bg: "bg-rose-500/10", text: "text-rose-600" },
        ];
        const c = icons[reports.indexOf(r) % icons.length];
        return (
          <div key={r.id} className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/10">
            <div className="flex items-start justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.text} transition-transform group-hover:scale-110`}>
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {r.count} {r.count === 1 ? "row" : "rows"}
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => downloadCSV(`${r.id}.csv`, r.rows())}
                disabled={r.count === 0}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.97] disabled:opacity-50 disabled:hover:shadow-none"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
              <button
                onClick={() => downloadCSV(`${r.id}.xls`, r.rows())}
                disabled={r.count === 0}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-medium shadow-sm transition-all hover:border-gold/30 hover:bg-gold/5 hover:text-gold-foreground active:scale-[0.97] disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" /> Excel
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
