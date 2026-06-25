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
    <label className={`block space-y-1.5 ${className}`}>
      <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border-2 border-transparent bg-secondary/60 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all placeholder:font-normal placeholder:text-muted-foreground/50 focus:border-gold focus:bg-card focus:outline-none focus:ring-0 focus:shadow-[0_0_0_4px_oklch(0.769_0.188_70/0.15)] focus:scale-[1.01]";

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
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-[13px] font-extrabold text-primary-foreground shadow-md">
            {String(step).padStart(2, "0")}
          </span>
        )}
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            {children}
          </h2>
        </div>
      </div>
      {hint && <p className="mt-2 text-sm text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
