import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { User, Mic } from "lucide-react";

import { Field, SectionTitle, inputCls } from "@/components/form-field";
import { saveRegistration, type AttendeeRecord } from "@/lib/registration";
import { RegistrationSuccess } from "@/components/registration-success";
import { SpeakerRegister } from "./register.speaker";

export const Route = createFileRoute("/register/")({
  head: () => ({
    meta: [
      { title: "Registration — Care Conference 2026" },
      {
        name: "description",
        content: "Register for Care Conference 2026 as an attendee or speaker.",
      },
    ],
  }),
  component: RegisterPage,
});

type Tab = "attendee" | "speaker";

function RegisterPage() {
  const [tab, setTab] = useState<Tab>("attendee");

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gold/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-20 sm:pb-16 sm:pt-24">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-gold/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Nigeria 2026
          </div>
          <h1 className="mt-5 font-display text-3xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground">
            Register for{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Care Conference
            </span>{" "}
            <span className="text-gold">2026</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Care as Infrastructure — Designing Nigeria's Next Decade of Homecare.
          </p>

          <div className="mt-8 flex gap-2 rounded-xl border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => setTab("attendee")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                tab === "attendee"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Attendee
            </button>
            <button
              onClick={() => setTab("speaker")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                tab === "speaker"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="h-4 w-4" />
              Speaker
            </button>
          </div>
        </div>
      </div>

      {tab === "attendee" ? <AttendeeForm /> : <SpeakerRegister />}
    </div>
  );
}

function AttendeeForm() {
  const [record, setRecord] = useState<AttendeeRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (!(v instanceof File)) data[k] = v;
    }
    try {
      const saved = await saveRegistration("attendee", data);
      setRecord(saved);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {record ? (
        <RegistrationSuccess record={record} />
      ) : (
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <SectionTitle>Personal Details</SectionTitle>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input name="fullName" required className={inputCls} />
              </Field>
              <Field label="Email" required>
                <input type="email" name="email" required className={inputCls} />
              </Field>
              <Field label="Phone Number" required>
                <input type="tel" name="phone" required className={inputCls} />
              </Field>
              <Field label="Country of Residence" required>
                <input name="country" required className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <SectionTitle>Organization</SectionTitle>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Organization Name">
                <input name="organization" className={inputCls} />
              </Field>
              <Field label="Job Title / Role">
                <input name="position" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              Your data is handled in accordance with our privacy policy.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary h-11"
            >
              {submitting ? "Registering…" : "Register"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
