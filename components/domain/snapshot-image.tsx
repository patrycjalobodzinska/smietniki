"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { snapshotUrl } from "@/lib/api/services/events";
import { cn } from "@/lib/utils/cn";

/**
 * Camera snapshot with a graceful fallback: the ingest can store a truncated
 * or placeholder JPEG (test devices do), and a broken <img> looks like a bug.
 *
 * `ratio` rezerwuje miejsce na obraz przed jego pobraniem. Bez tego kontener
 * ma zerową wysokość, a modal podskakuje w momencie, w którym JPEG dociera -
 * dlatego podgląd zawsze podaje proporcje, a miniatury (własna ramka) nie.
 */

const RATIO_CLASS = {
  video: "aspect-video",
  square: "aspect-square",
} as const;

export function SnapshotImage({
  snapshotId,
  alt,
  className,
  fallbackClassName,
  ratio,
}: {
  snapshotId: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  ratio?: keyof typeof RATIO_CLASS;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted/40 text-muted-foreground",
          ratio ? RATIO_CLASS[ratio] : "py-8",
          fallbackClassName ?? className,
        )}
      >
        <ImageOff className="size-5" />
        <span className="text-[10px]">obraz niedostępny</span>
      </div>
    );
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- proxied JPEG, no loader
    <img
      src={snapshotUrl(snapshotId)}
      alt={alt}
      className={ratio ? cn("size-full object-contain", !loaded && "opacity-0") : className}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );

  if (!ratio) return img;

  return (
    <div className={cn("relative overflow-hidden bg-muted/40", RATIO_CLASS[ratio], className)}>
      {img}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
