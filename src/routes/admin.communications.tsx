import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Send, Users, Eye, EyeOff } from "lucide-react";
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

function personalize(text: string, name: string, id: string, email: string) {
  return text
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{id\}\}/g, id)
    .replace(/\{\{email\}\}/g, email);
}

function buildEmailHtml(body: string, name: string, id: string, email: string) {
  const content = personalize(body, name, id, email).replace(/\n/g, "<br>");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
<span style="display:inline-block;background:rgba(212,175,55,0.15);border-radius:20px;padding:4px 12px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d4af37;">Care Conference 2026</span>
<h1 style="margin:16px 0 0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-.5px;"><span style="color:#fff;">CARE</span><br><span style="color:#d4af37;">CONFERENCE</span></h1>
</td></tr>
<tr><td style="background:#fff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 12px rgba(0,0,0,.05);">
<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#333;">${content}</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
<p style="margin:0;font-size:12px;line-height:1.6;color:#999;">Care Conference 2026 · Abuja, Nigeria</p>
<p style="margin:12px 0 0;font-size:11px;color:#bbb;"><a href="https://careconference-2026.vercel.app/unsubscribe" style="color:#d4af37;">Unsubscribe</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function EmailPreview({ subject, body, name, id, email }: { subject: string; body: string; name: string; id: string; email: string }) {
  const html = useMemo(
    () => buildEmailHtml(body, name, id, email),
    [body, name, id, email],
  );

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">To:</span> {name} &lt;{email}&gt;
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Subject:</span> {personalize(subject, name, id, email)}
        </div>
      </div>
      <iframe
        title="Email preview"
        srcDoc={html}
        className="w-full"
        style={{ height: 420, border: "none" }}
        sandbox=""
      />
    </div>
  );
}

function Communications() {
  const all = useRegistrations();
  const [audience, setAudience] = useState<(typeof audiences)[number]["id"]>("all");
  const [subject, setSubject] = useState(templates[1].subject);
  const [body, setBody] = useState(templates[1].body);
  const [sent, setSent] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

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

  const previewRecipient = useMemo(() => {
    const r = recipients[0];
    if (!r) return null;
    return {
      name: (r.data as { fullName?: string }).fullName ?? "Attendee",
      email: (r.data as { email?: string }).email ?? "attendee@example.com",
      id: r.id,
    };
  }, [recipients]);

  function applyTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setBody(t.body);
  }

  async function send() {
    setSending(true);
    try {
      const enriched = recipients
        .map((r) => ({
          name: (r.data as { fullName?: string }).fullName ?? "Attendee",
          email: (r.data as { email?: string }).email ?? "",
          id: r.id,
        }))
        .filter((r) => r.email);

      await sendCampaign({
        data: {
          to: enriched.map((r) => ({ name: r.name, email: r.email })),
          subject,
          body,
          html: buildEmailHtml(body, "{{name}}", "", "{{email}}"),
        },
      });
      setSent(enriched.length);
    } catch (e) {
      alert("Failed to send: " + (e instanceof Error ? e.message : "Unknown error"));
    }
    setSending(false);
    setTimeout(() => setSent(null), 3500);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-foreground">Email Campaign</h2>
              <p className="text-sm text-muted-foreground">
                Tokens like <code className="rounded bg-secondary px-1 text-[11px]">{"{{name}}"}</code>,{" "}
                <code className="rounded bg-secondary px-1 text-[11px]">{"{{id}}"}</code> and{" "}
                <code className="rounded bg-secondary px-1 text-[11px]">{"{{email}}"}</code> are personalised per recipient.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm shadow-sm transition-all focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              >
                {audiences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Template
              </label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:border-gold/30 hover:bg-gold/5 hover:text-gold-foreground"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/80">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono text-sm shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Write your message here…"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <div className="text-sm text-muted-foreground">
                Will send to <strong className="text-foreground">{recipients.length}</strong>{" "}
                recipient{recipients.length === 1 ? "" : "s"}.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview((p) => !p)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium shadow-sm transition-all hover:bg-secondary"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? "Hide preview" : "Preview"}
                </button>
                <button
                  onClick={send}
                  disabled={sending || !subject || recipients.length === 0}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60 disabled:hover:shadow-none"
                >
                  <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send campaign"}
                </button>
              </div>
            </div>

            {sent !== null && (
              <div className="animate-fade-in rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm font-medium text-foreground">
                <span className="text-gold">✓</span> Campaign queued for delivery to{" "}
                <strong>{sent}</strong> recipient{sent === 1 ? "" : "s"}.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Live email preview */}
        {showPreview && previewRecipient && (
          <div>
            <h3 className="mb-3 font-display text-lg font-extrabold text-foreground">Email Preview</h3>
            <EmailPreview
              subject={subject}
              body={body}
              name={previewRecipient.name}
              id={previewRecipient.id}
              email={previewRecipient.email}
            />
          </div>
        )}

        {/* Recipient list */}
        <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg font-extrabold text-foreground">Recipients</h3>
            <span className="ml-auto text-xs text-muted-foreground">{recipients.length}</span>
          </div>
          <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {recipients.slice(0, 30).map((r) => {
              const d = r.data as { fullName?: string; email?: string };
              const initial = (d.fullName ?? "?").charAt(0).toUpperCase();
              return (
                <li key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{d.fullName ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{d.email ?? "—"}</div>
                  </div>
                </li>
              );
            })}
            {recipients.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">No matching recipients.</li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
