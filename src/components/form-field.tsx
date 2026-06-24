import type { ReactNode } from "react";

export function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border-2 border-transparent bg-secondary/70 px-4 py-3 text-sm font-medium text-foreground shadow-none transition-all placeholder:font-normal placeholder:text-muted-foreground/60 focus:border-gold focus:bg-card focus:outline-none focus:ring-0 focus:shadow-[0_0_0_4px_oklch(0.769_0.188_70/0.15)]";

export function SectionTitle({
  children,
  hint,
  step,
}: {
  children: ReactNode;
  hint?: string;
  step?: number;
}) {
  return (
    <div className="border-b border-border pb-4">
      <div className="flex items-center gap-3">
        {step !== undefined && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground shadow-sm">
            {String(step).padStart(2, "0")}
          </span>
        )}
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          {children}
        </h2>
      </div>
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
