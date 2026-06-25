import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Home, Printer, Mail } from "lucide-react";
import type { AttendeeRecord } from "@/lib/registration";

export function RegistrationSuccess({ record }: { record: AttendeeRecord }) {
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    const payload = JSON.stringify({
      id: record.id,
      type: record.type,
      name: (record.data as { fullName?: string }).fullName ?? "",
    });
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1,
      color: { dark: "#1e1b4b", light: "#ffffff" },
    }).then(setQr).catch((err) => {
      console.error("QR generation on success page failed:", err);
    });
  }, [record]);

  const name = (record.data as { fullName?: string }).fullName ?? "Attendee";

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up pass-print-area">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="relative bg-gradient-to-r from-primary via-primary/95 to-gold/80 px-8 py-7 text-primary-foreground">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Registration confirmed
              </div>
              <h1 className="font-display text-2xl font-extrabold">Welcome to Care Conference 2026</h1>
            </div>
          </div>
        </div>
        <div className="grid gap-8 p-8 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 p-4 shadow-inner">
            {qr ? (
              <img
                src={qr}
                alt="Registration QR code"
                className="h-44 w-44 rounded-xl bg-white"
              />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-xl bg-muted" />
            )}
          </div>
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</div>
              <div className="font-display text-xl font-extrabold text-foreground">{name}</div>
            </div>
            <div className="rounded-xl bg-primary/5 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registration ID</div>
              <div className="font-mono text-lg font-bold text-primary">{record.id}</div>
            </div>
            <div className="rounded-xl bg-primary/5 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</div>
              <div className="font-semibold capitalize text-foreground">{record.type}</div>
            </div>
            <div className="rounded-xl bg-gold/5 border border-gold/20 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gold-foreground">
                <Mail className="h-3.5 w-3.5 text-gold" />
                Confirmation email on its way to your inbox
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Please present this QR code at check-in for a smooth entry. You can also print your
              pass below.
            </p>
          </div>
        </div>
        <div className="no-print flex flex-wrap items-center gap-3 border-t border-border bg-gradient-to-r from-secondary/30 to-secondary/10 px-8 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20"
          >
            <Home className="h-3.5 w-3.5" /> Back to home
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-all hover:border-gold/30 hover:bg-gold/5 hover:text-gold-foreground"
          >
            <Printer className="h-3.5 w-3.5" /> Print pass
          </button>
        </div>
      </div>
    </div>
  );
}
