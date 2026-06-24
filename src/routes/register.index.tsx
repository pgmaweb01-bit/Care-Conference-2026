import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Field, SectionTitle, inputCls } from "@/components/form-field";
import { saveRegistration, type AttendeeRecord } from "@/lib/registration";
import { RegistrationSuccess } from "@/components/registration-success";

export const Route = createFileRoute("/register/")({
  head: () => ({
    meta: [
      { title: "Attendee Registration — Care Conference 2026" },
      {
        name: "description",
        content: "Complete your attendee registration for Care Conference 2026.",
      },
    ],
  }),
  component: AttendeeRegister,
});

function AttendeeRegister() {
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

  return (
    <div className="min-h-screen bg-secondary/40">
      <main className="mx-auto max-w-3xl px-6 py-14">
        {record ? (
          <RegistrationSuccess record={record} />
        ) : (
          <>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Attendee Registration
              </div>
              <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] tracking-tight text-foreground">
                Reserve your seat at <span className="text-primary">Care Conference</span>{" "}
                <span className="text-gold">2026</span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Fields marked with * are required. You'll receive a unique Registration ID and QR
                pass on completion.
              </p>
            </div>

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
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
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
                  className="group inline-flex h-14 items-center gap-2 rounded-full bg-primary px-9 font-display text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? "Generating your pass…" : "Complete Registration"}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
