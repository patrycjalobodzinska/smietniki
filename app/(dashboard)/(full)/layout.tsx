"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isFullMode } from "@/lib/full-mode";

/**
 * Gate for the hidden "full mode" modules. Renders children only when the
 * full-mode flag is set; otherwise redirects to the dashboard. Checks once on
 * mount so a legitimately-unlocked user isn't bounced on first paint.
 */
export default function FullModeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (isFullMode()) {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace("/");
    }
  }, [router]);

  if (!allowed) return null;
  return <>{children}</>;
}
