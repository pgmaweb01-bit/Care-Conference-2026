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
    <div className="min-h-screen bg-secondary/40">
      <div className="bg-gradient-to-br from-primary/5 via-background to-gold/5">
        <div className="relative mx-auto max-w-3xl px-6 pb-10 pt-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Nigeria 2026
            </div>
            <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] tracking-tight text-foreground">
              Register for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Care Conference
              </span>{" "}
              <span className="text-gold">2026</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Care as Infrastructure — Designing Nigeria's Next Decade of Homecare.
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 -mt-6 pb-20">
        <div className="mb-8 flex gap-1 rounded-2xl bg-card p-1.5 shadow-sm border border-border">
          <button
            onClick={() => setTab("attendee")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
              tab === "attendee"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            Attendee
          </button>
          <button
            onClick={() => setTab("speaker")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
              tab === "speaker"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic className="h-4 w-4" />
            Speaker
          </button>
        </div>

        <div className="animate-fade-in-up" key={tab}>
          {tab === "attendee" ? <AttendeeForm /> : <SpeakerRegister />}
        </div>
      </main>
    </div>
  );
}

function AttendeeForm() {
  const [record, setRecord] = useState<AttendeeRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const saved = await saveRegistration("attendee", data);
    setRecord(saved);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (record) return <RegistrationSuccess record={record} />;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-12 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)] md:p-10"
    >
      <div className="space-y-6">
        <SectionTitle step={1} hint="Tell us a little about yourself.">
          Personal Information
        </SectionTitle>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" required className="sm:col-span-2">
            <input
              name="fullName"
              required
              className={inputCls}
              placeholder="Adaeze Okafor"
            />
          </Field>
          <Field label="Gender" required>
            <select name="gender" required className={inputCls} defaultValue="">
              <option value="" disabled>
                Select
              </option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>
          <Field label="Date of Birth">
            <input type="date" name="dob" className={inputCls} />
          </Field>
          <Field label="Email Address" required>
            <input
              type="email"
              name="email"
              required
              className={inputCls}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone Number" required>
            <input
              type="tel"
              name="phone"
              required
              className={inputCls}
              placeholder="+234 ..."
            />
          </Field>
          <Field label="Country" required>
            <input name="country" required className={inputCls} placeholder="Nigeria" />
          </Field>
          <Field label="State / Province">
            <input name="state" className={inputCls} />
          </Field>
          <Field label="City" className="sm:col-span-2">
            <input name="city" className={inputCls} />
          </Field>
        </div>
      </div>

      <div className="space-y-6">
        <SectionTitle step={2} hint="Help us understand your background.">
          Professional Information
        </SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Organization" required>
            <input name="organization" required className={inputCls} />
          </Field>
          <Field label="Profession" required>
            <input
              name="profession"
              required
              className={inputCls}
              placeholder="Clinician, Researcher, Policy maker..."
            />
          </Field>
          <Field label="Specialty">
            <input name="specialty" className={inputCls} />
          </Field>
          <Field label="Position / Role">
            <input name="role" className={inputCls} />
          </Field>
        </div>
      </div>

      <div className="space-y-6">
        <SectionTitle step={3}>Conference Information</SectionTitle>
        <Field label="First-time attendee?">
          <div className="flex gap-6 text-sm text-foreground">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="firstTime" value="yes" defaultChecked /> Yes
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="firstTime" value="no" /> No
            </label>
          </div>
        </Field>
        <Field label="Special needs or accessibility requirements">
          <textarea
            name="specialNeeds"
            rows={3}
            className={inputCls}
            placeholder="Optional"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          By registering you agree to receive event communications.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 px-9 font-display text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative z-10">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating your pass…
              </span>
            ) : (
              "Complete Registration"
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
