import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Field, SectionTitle, inputCls } from "@/components/form-field";
import { saveRegistration, type AttendeeRecord } from "@/lib/registration";
import { RegistrationSuccess } from "@/components/registration-success";
import { uploadFile } from "@/lib/upload-fns";

export const Route = createFileRoute("/register/speaker")({
  head: () => ({
    meta: [
      { title: "Speaker Registration — Care Conference 2026" },
      {
        name: "description",
        content:
          "Submit your speaker profile, session and travel details for Care Conference 2026.",
      },
    ],
  }),
  component: SpeakerRegister,
});

export function SpeakerRegister() {
  const [record, setRecord] = useState<AttendeeRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    const fileKeys = ["headshot", "photos", "cv"];
    for (const [k, v] of fd.entries()) {
      if (v instanceof File && v.size > 0 && fileKeys.includes(k)) {
        const content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(v);
        });
        try {
          const result = await uploadFile({ data: { filename: v.name, content } });
          data[k] = result.url;
        } catch {
          data[k] = v.name;
        }
      } else if (!(v instanceof File)) {
        data[k] = v;
      }
    }
    const saved = await saveRegistration("speaker", data);
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
              <div className="text-xs uppercase tracking-[0.22em] text-primary">Speaker Portal</div>
              <h1 className="mt-2 font-display text-4xl text-foreground">
                Submit your speaker profile
              </h1>
              <p className="mt-3 text-muted-foreground">
                Includes session details, travel and accommodation logistics. Sensitive information
                is restricted to authorised staff.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="space-y-10 rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="space-y-5">
                <SectionTitle>Personal Details</SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name" required>
                    <input name="fullName" required className={inputCls} />
                  </Field>
                  <Field label="Title" required>
                    <input
                      name="title"
                      required
                      className={inputCls}
                      placeholder="Dr., Prof., Mr., Mrs., Ms."
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
                  <Field label="Nationality">
                    <input name="nationality" className={inputCls} />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" name="email" required className={inputCls} />
                  </Field>
                  <Field label="Phone Number" required>
                    <input type="tel" name="phone" required className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Professional Details</SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Organization" required>
                    <input name="organization" required className={inputCls} />
                  </Field>
                  <Field label="Position" required>
                    <input name="position" required className={inputCls} />
                  </Field>
                  <Field label="Years of Experience">
                    <input type="number" min="0" name="yearsExperience" className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Speaker Profile</SectionTitle>
                <Field label="Biography" required>
                  <textarea name="bio" required rows={4} className={inputCls} />
                </Field>
                <Field label="Professional Profile (LinkedIn or website)">
                  <input
                    type="url"
                    name="profileUrl"
                    className={inputCls}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Areas of Expertise">
                  <input
                    name="expertise"
                    className={inputCls}
                    placeholder="e.g. Health policy, Community care, Digital health"
                  />
                </Field>
              </div>

              <div className="space-y-5">
                <SectionTitle>Media Uploads</SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Professional Headshot">
                    <input type="file" name="headshot" accept="image/*" className={inputCls} />
                  </Field>
                  <Field label="Additional Photos">
                    <input
                      type="file"
                      name="photos"
                      accept="image/*"
                      multiple
                      className={inputCls}
                    />
                  </Field>
                  <Field label="CV / Resume" className="sm:col-span-2">
                    <input type="file" name="cv" accept=".pdf,.doc,.docx" className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Session Details</SectionTitle>
                <Field label="Session Title" required>
                  <input name="sessionTitle" required className={inputCls} />
                </Field>
                <Field label="Session Description" required>
                  <textarea name="sessionDescription" required rows={4} className={inputCls} />
                </Field>
                <Field label="Learning Objectives">
                  <textarea name="learningObjectives" rows={3} className={inputCls} />
                </Field>
                <Field label="Presentation Type">
                  <select name="presentationType" className={inputCls} defaultValue="">
                    <option value="" disabled>
                      Select
                    </option>
                    <option>Keynote</option>
                    <option>Panel</option>
                    <option>Workshop</option>
                    <option>Lightning Talk</option>
                  </select>
                </Field>
              </div>

              <div className="space-y-5">
                <SectionTitle hint="Optional — if you'll be travelling with an assistant.">
                  Personal Assistant
                </SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="PA Full Name">
                    <input name="paName" className={inputCls} />
                  </Field>
                  <Field label="PA Email">
                    <input type="email" name="paEmail" className={inputCls} />
                  </Field>
                  <Field label="PA Phone Number" className="sm:col-span-2">
                    <input type="tel" name="paPhone" className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Travel Information</SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Departure Country">
                    <input name="departureCountry" className={inputCls} />
                  </Field>
                  <Field label="Departure City">
                    <input name="departureCity" className={inputCls} />
                  </Field>
                  <Field label="Preferred Airport">
                    <input name="airport" className={inputCls} />
                  </Field>
                  <Field label="Passport Name">
                    <input name="passportName" className={inputCls} />
                  </Field>
                  <Field label="Passport Number" className="sm:col-span-2">
                    <input
                      name="passportNumber"
                      className={inputCls}
                      placeholder="Restricted — visible only to authorised staff"
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Flight Information</SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Airline">
                    <input name="airline" className={inputCls} />
                  </Field>
                  <Field label="Flight Number">
                    <input name="flightNumber" className={inputCls} />
                  </Field>
                  <Field label="Arrival Date">
                    <input type="date" name="arrivalDate" className={inputCls} />
                  </Field>
                  <Field label="Arrival Time">
                    <input type="time" name="arrivalTime" className={inputCls} />
                  </Field>
                  <Field label="Departure Date">
                    <input type="date" name="departureDate" className={inputCls} />
                  </Field>
                  <Field label="Departure Time">
                    <input type="time" name="departureTime" className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle>Accommodation</SectionTitle>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Hotel Preference">
                    <input name="hotelPreference" className={inputCls} />
                  </Field>
                  <Field label="Room Type">
                    <select name="roomType" className={inputCls} defaultValue="">
                      <option value="" disabled>
                        Select
                      </option>
                      <option>Single</option>
                      <option>Double</option>
                      <option>Suite</option>
                    </select>
                  </Field>
                  <Field label="Dietary Requirements" className="sm:col-span-2">
                    <textarea name="dietary" rows={2} className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <p className="text-xs text-muted-foreground">
                  Our Speaker Coordinator will be in touch within 5 business days.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative z-10">
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting…
                      </span>
                    ) : (
                      "Submit speaker registration"
                    )}
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
