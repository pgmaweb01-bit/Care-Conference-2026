import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Send, Users } from "lucide-react";
import { useRegistrations } from "@/lib/use-registrations";
import { sendCampaign } from "@/lib/email-fns";

export const Route = createFileRoute("/admin/communications")({
  component: Communications,
});

const audiences = [
  { id: "all", label: "All attendees & speakers" },
  { id: "attendees", label: "Attendees only" },
  { id: "speakers", label: "Speakers only" },
  { id: "checked-in", label: "Checked-in attendees" },
  { id: "pending", label: "Pending check-in" },
] as const;

const templates = [
  { id: "blank", label: "Blank", subject: "", body: "" },
  {
    id: "welcome",
    label: "Welcome",
    subject: "Welcome to Care Conference 2026",
    body: "Dear {{name}},\n\nThank you for registering for Care Conference 2026. Your Registration ID is {{id}}. We look forward to welcoming you in Abuja.\n\nWarm regards,\nCare Conference Team",
  },
  {
    id: "reminder-7",
    label: "7-day reminder",
    subject: "Care Conference 2026 — 7 days to go",
    body: "Hi {{name}},\n\nJust a friendly reminder that Care Conference 2026 opens in 7 days. Please bring your QR pass for fast check-in.\n\nSee you soon!",
  },
  {
    id: "thanks",
    label: "Post-conference thanks",
    subject: "Thank you for joining Care Conference 2026",
    body: "Dear {{name}},\n\nThank you for being part of Care Conference 2026. We've attached the resources and a short feedback form.\n\nWith gratitude,\nCare Conference Team",
  },
];

function Communications() {
  const all = useRegistrations();
  const [audience, setAudience] = useState<(typeof audiences)[number]["id"]>("all");
  const [subject, setSubject] = useState(templates[1].subject);
  const [body, setBody] = useState(templates[1].body);
  const [sent, setSent] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const recipients = useMemo(() => {
    switch (audience) {
      case "attendees":
        return all.filter((r) => r.type === "attendee");
      case "speakers":
        return all.filter((r) => r.type === "speaker");
      case "checked-in":
        return all.filter((r) => r.checkedInAt);
      case "pending":
        return all.filter((r) => !r.checkedInAt);
      default:
        return all;
    }
  }, [all, audience]);

  function applyTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setBody(t.body);
  }

  async function send() {
    setSending(true);
    try {
      await sendCampaign({
        to: recipients
          .map((r) => ({
            name: (r.data as { fullName?: string }).fullName ?? "Attendee",
            email: (r.data as { email?: string }).email ?? "",
          }))
          .filter((r) => r.email),
        subject,
        body,
      });
      setSent(recipients.length);
    } catch (e) {
      alert("Failed to send: " + (e instanceof Error ? e.message : "Unknown error"));
    }
    setSending(false);
    setTimeout(() => setSent(null), 3500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">Email Campaign</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Compose and send updates to a targeted audience. Tokens like{" "}
            <code className="rounded bg-secondary px-1">{"{{name}}"}</code> and{" "}
            <code className="rounded bg-secondary px-1">{"{{id}}"}</code> are personalised per
            recipient.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {audiences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Template
              </label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 font-mono text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-5">
              <div className="text-sm text-muted-foreground">
                Will send to <strong className="text-foreground">{recipients.length}</strong>{" "}
                recipient{recipients.length === 1 ? "" : "s"}.
              </div>
              <button
                onClick={send}
                disabled={sending || !subject || recipients.length === 0}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send campaign"}
              </button>
            </div>

            {sent !== null && (
              <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-foreground">
                ✓ Campaign queued for delivery to {sent} recipient{sent === 1 ? "" : "s"}.
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg">Preview Recipients</h3>
        </div>
        <ul className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {recipients.slice(0, 30).map((r) => {
            const d = r.data as { fullName?: string; email?: string };
            return (
              <li key={r.id} className="rounded-lg border border-border p-3">
                <div className="truncate text-sm font-medium">{d.fullName}</div>
                <div className="truncate text-xs text-muted-foreground">{d.email}</div>
              </li>
            );
          })}
          {recipients.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              No matching recipients.
            </li>
          )}
        </ul>
      </aside>
    </div>
  );
}
