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
      <span className="block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:shadow-[0_0_0_3px_oklch(0.769_0.188_70/0.1)]";

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
    <div>
      <div className="flex items-center gap-3">
        {step !== undefined && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {step}
          </span>
        )}
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            {children}
          </h2>
        </div>
      </div>
      {hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
