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
import { Users, Mic, Globe2, CheckCircle2, Clock, TrendingUp, ArrowUpRight } from "lucide-react";
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <div className={`rounded-lg p-2 ${s.accent === "gold" ? "bg-gold/10 text-gold" : "bg-primary/10 text-primary"}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground">
              {s.value}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  s.accent === "gold" ? "bg-gold/40" : "bg-primary/40"
                }`}
                style={{ width: `${Math.min(100, (s.value / (stats.total || 1)) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Registration Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Cumulative registrations over time</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              {trend.length > 0 ? `${trend[trend.length - 1].total} total` : "No data"}
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.257 0.09 281)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.257 0.09 281)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.769 0.188 70)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.769 0.188 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 257)" strokeOpacity={0.5} />
                <XAxis dataKey="day" stroke="oklch(0.65 0.03 257)" fontSize={12} tickLine={false} />
                <YAxis stroke="oklch(0.65 0.03 257)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid oklch(0.92 0.01 257)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    padding: "8px 12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="oklch(0.769 0.188 70)"
                  fill="url(#gradGold)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="oklch(0.257 0.09 281)"
                  fill="url(#grad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-bold text-foreground">By Country</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Top 6 represented countries</p>
          <div className="mt-2 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byCountry}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {byCountry.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-bold text-foreground">Professional Categories</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Distribution across fields</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={byProfession} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 257)"
                  strokeOpacity={0.5}
                  horizontal={false}
                />
                <XAxis type="number" stroke="oklch(0.65 0.03 257)" fontSize={12} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="oklch(0.65 0.03 257)"
                  fontSize={12}
                  width={120}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid oklch(0.92 0.01 257)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    padding: "8px 12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="oklch(0.769 0.188 70)"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">Recent Registrations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest sign-ups</p>
            </div>
            <Link
              to="/admin/attendees"
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-all hover:bg-primary/20"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {records
              .slice(-6)
              .reverse()
              .map((r) => {
                const d = r.data as { fullName?: string; organization?: string };
                const initial = (d.fullName ?? "A").charAt(0).toUpperCase();
                return (
                  <div key={r.id} className="flex items-center gap-3 py-3 transition-colors hover:bg-secondary/30 -mx-2 px-2 rounded-lg">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${r.type === "speaker" ? "bg-gold/20 text-gold-foreground" : "bg-primary/10 text-primary"}`}>
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {d.fullName ?? "—"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {d.organization ?? "—"}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${r.type === "speaker" ? "bg-gold/15 text-gold-foreground" : "bg-secondary text-secondary-foreground"}`}
                    >
                      {r.type}
                    </span>
                  </div>
                );
              })}
            {records.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No registrations yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
