import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primary/10 text-primary",
        muted: "border-transparent bg-muted text-muted-foreground",
        success: "border-transparent bg-success/12 text-success",
        warning: "border-transparent bg-warning/15 text-warning-foreground",
        danger: "border-transparent bg-danger/12 text-danger",
        info: "border-transparent bg-info/12 text-info",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
