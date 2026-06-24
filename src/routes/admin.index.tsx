import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Users, Mic, Globe2, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useRegistrations } from "@/lib/use-registrations";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const PIE_COLORS = [
  "oklch(0.257 0.09 281)",
  "oklch(0.769 0.188 70)",
  "oklch(0.40 0.12 281)",
  "oklch(0.65 0.13 200)",
  "oklch(0.60 0.18 25)",
];

function AdminOverview() {
  const records = useRegistrations();

  const stats = useMemo(() => {
    const attendees = records.filter((r) => r.type === "attendee");
    const speakers = records.filter((r) => r.type === "speaker");
    const countries = new Set(
      records.map((r) =>
        String(
          (r.data as { country?: string; nationality?: string }).country ??
            (r.data as { nationality?: string }).nationality ??
            "Unknown",
        ),
      ),
    );
    const checkedIn = records.filter((r) => r.checkedInAt).length;
    const pending = records.length - checkedIn;
    return {
      total: records.length,
      attendees: attendees.length,
      speakers: speakers.length,
      countries: countries.size,
      checkedIn,
      pending,
    };
  }, [records]);

  const byCountry = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      const c = String(
        (r.data as { country?: string; nationality?: string }).country ??
          (r.data as { nationality?: string }).nationality ??
          "Unknown",
      );
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [records]);

  const byProfession = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      const p = String(
        (r.data as { profession?: string; position?: string }).profession ??
          (r.data as { position?: string }).position ??
          "Other",
      );
      map.set(p, (map.get(p) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [records]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    let acc = 0;
    return Array.from(map.entries())
      .sort()
      .map(([day, count]) => {
        acc += count;
        return { day, registrations: count, total: acc };
      });
  }, [records]);

  const statCards = [
    { label: "Total Registrations", value: stats.total, icon: TrendingUp, accent: "gold" },
    { label: "Attendees", value: stats.attendees, icon: Users, accent: "primary" },
    { label: "Speakers", value: stats.speakers, icon: Mic, accent: "gold" },
    { label: "Countries", value: stats.countries, icon: Globe2, accent: "primary" },
    { label: "Checked-In", value: stats.checkedIn, icon: CheckCircle2, accent: "gold" },
    { label: "Pending Check-in", value: stats.pending, icon: Clock, accent: "primary" },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md border-t-4 ${
              s.accent === "gold" ? "border-t-gold" : "border-t-primary"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
              <s.icon className={`h-4 w-4 ${s.accent === "gold" ? "text-gold" : "text-primary"}`} />
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold tracking-tight text-foreground">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground">Registration Trend</h3>
            <span className="text-xs text-muted-foreground">Cumulative & daily</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.257 0.09 281)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.257 0.09 281)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 257)" />
                <XAxis dataKey="day" stroke="oklch(0.55 0.03 257)" fontSize={12} />
                <YAxis stroke="oklch(0.55 0.03 257)" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 257)" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="oklch(0.257 0.09 281)"
                  fill="url(#grad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg text-foreground">By Country</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byCountry}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {byCountry.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg text-foreground">Professional Categories</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byProfession} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 257)"
                  horizontal={false}
                />
                <XAxis type="number" stroke="oklch(0.55 0.03 257)" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="oklch(0.55 0.03 257)"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 257)" }}
                />
                <Bar dataKey="value" fill="oklch(0.769 0.188 70)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground">Recent Registrations</h3>
            <Link
              to="/admin/attendees"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {records
              .slice(-6)
              .reverse()
              .map((r) => {
                const d = r.data as { fullName?: string; organization?: string };
                return (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {d.fullName ?? "—"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {d.organization ?? "—"} · <span className="font-mono">{r.id}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${r.type === "speaker" ? "bg-gold/20 text-gold-foreground" : "bg-secondary text-secondary-foreground"}`}
                    >
                      {r.type}
                    </span>
                  </div>
                );
              })}
            {records.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No registrations yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
