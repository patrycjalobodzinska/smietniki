"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { snapshotUrl } from "@/lib/api/services/events";
import { cn } from "@/lib/utils/cn";

/**
 * Camera snapshot with a graceful fallback: the ingest can store a truncated
 * or placeholder JPEG (test devices do), and a broken <img> looks like a bug.
 */
export function SnapshotImage({
  snapshotId,
  alt,
  className,
  fallbackClassName,
}: {
  snapshotId: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted/40 py-8 text-muted-foreground",
          fallbackClassName ?? className,
        )}
      >
        <ImageOff className="size-5" />
        <span className="text-[10px]">obraz niedostępny</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- proxied JPEG, no loader
    <img
      src={snapshotUrl(snapshotId)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
