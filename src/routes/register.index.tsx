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
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground">
            Register for The Care Conference 2026
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
            <SectionTitle>Personal Information</SectionTitle>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" required className="sm:col-span-2">
                <input name="fullName" required className={inputCls} placeholder="Adaeze Okafor" />
              </Field>
              <Field label="Gender" required>
                <select name="gender" required className={inputCls} defaultValue="">
                  <option value="" disabled>Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input type="date" name="dob" className={inputCls} />
              </Field>
              <Field label="Email Address" required>
                <input type="email" name="email" required className={inputCls} placeholder="you@example.com" />
              </Field>
              <Field label="Phone Number" required>
                <input type="tel" name="phone" required className={inputCls} placeholder="+234 ..." />
              </Field>
              <Field label="Country of Residence" required>
                <input name="country" required className={inputCls} placeholder="Nigeria" />
              </Field>
              <Field label="State / Province">
                <input name="state" className={inputCls} />
              </Field>
              <Field label="City">
                <input name="city" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <SectionTitle>Professional Information</SectionTitle>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Organization" required>
                <input name="organization" required className={inputCls} />
              </Field>
              <Field label="Profession" required>
                <input name="profession" required className={inputCls} placeholder="Clinician, Researcher, Policy maker..." />
              </Field>
              <Field label="Specialty">
                <input name="specialty" className={inputCls} />
              </Field>
              <Field label="Position / Role">
                <input name="position" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <SectionTitle>Conference Information</SectionTitle>
            <div className="mt-5 space-y-5">
              <fieldset>
                <legend className="text-sm font-medium text-foreground mb-2">First-time attendee?</legend>
                <div className="flex gap-6 text-sm text-foreground">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="firstTime" value="yes" defaultChecked /> Yes
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="firstTime" value="no" /> No
                  </label>
                </div>
              </fieldset>
              <Field label="Special needs or accessibility requirements">
                <textarea name="specialNeeds" rows={3} className={inputCls} placeholder="Optional" />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              By registering you agree to receive event communications.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 px-7 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">
                {submitting ? "Registering\u2026" : "Complete Registration"}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
