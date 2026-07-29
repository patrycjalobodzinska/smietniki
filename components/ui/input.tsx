import { cn } from "@/lib/utils/cn";

const base =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Optional leading icon (lucide component or any node). */
  icon?: React.ReactNode;
}

export function Input({ className, invalid, icon, ...props }: InputProps) {
  const field = (
    <input
      className={cn(base, invalid && "border-danger focus-visible:border-danger", icon && "pl-9", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
  if (!icon) return field;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      {field}
    </div>
  );
}
