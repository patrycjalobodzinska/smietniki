import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-danger focus-visible:border-danger",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
