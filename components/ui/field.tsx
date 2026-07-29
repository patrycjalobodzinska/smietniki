import { useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render-prop receives the id to wire the control's `id`/`aria-describedby`. */
  children: (props: { id: string; invalid: boolean }) => React.ReactNode;
}

/**
 * Standard form field wrapper: label, optional hint, error message, and
 * accessible wiring. Every form control in the app should sit inside a Field.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const invalid = Boolean(error);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children({ id, invalid })}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}
