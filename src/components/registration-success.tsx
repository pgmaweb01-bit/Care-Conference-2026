import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Link } from "@tanstack/react-router";
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
    }).then(setQr);
  }, [record]);

  const name = (record.data as { fullName?: string }).fullName ?? "Attendee";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="bg-[image:var(--gradient-band)] px-8 py-6 text-primary-foreground">
          <div className="text-[11px] uppercase tracking-[0.22em] opacity-80">
            Registration confirmed
          </div>
          <h1 className="mt-1 font-display text-2xl">Welcome to Care Conference 2026</h1>
        </div>
        <div className="grid gap-8 p-8 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="rounded-2xl bg-secondary p-4">
            {qr ? (
              <img src={qr} alt="Registration QR code" className="h-44 w-44" />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-lg bg-muted" />
            )}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Name</div>
              <div className="font-display text-xl text-foreground">{name}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Registration ID
              </div>
              <div className="font-mono text-lg font-semibold text-primary">{record.id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Category</div>
              <div className="capitalize text-foreground">{record.type}</div>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email with your QR pass and venue details has been sent. Please present
              this QR code at check-in.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-border bg-secondary/40 px-8 py-5">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            Back to home
          </Link>
          <span className="text-muted-foreground/50">·</span>
          <button
            onClick={() => window.print()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Print pass
          </button>
        </div>
      </div>
    </div>
  );
}
