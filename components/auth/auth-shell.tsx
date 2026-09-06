import Link from "next/link";
import { Leaf } from "lucide-react";

/**
 * Shared frame for the unauthenticated screens (login, registration, e-mail
 * confirmation): technical grid, green glow, centered card.
 */
export function AuthShell({
  title,
  subtitle,
  heading,
  children,
  footer,
}: {
  title?: string;
  subtitle?: string;
  heading: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/login"
            className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Leaf className="size-7" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title ?? "SmartWaste"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle ?? "Centrum zarządzania infrastrukturą odpadową"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold">{heading}</h2>
          {children}
        </div>
        {footer}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          SmartWaste Platform v1.0 · Smart Utility Solutions
        </p>
      </div>
    </div>
  );
}
