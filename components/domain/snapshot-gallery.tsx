"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Camera, ExternalLink } from "lucide-react";
import { Badge, Dialog, EmptyState, Skeleton } from "@/components/ui";
import { SnapshotImage } from "@/components/domain/snapshot-image";
import { eventTypeLabel } from "@/lib/labels";
import { useDevices } from "@/lib/api/hooks/use-devices";
import { useRawEvents } from "@/lib/api/hooks/use-events";
import type { RawEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

/**
 * Camera snapshots for one altanka - real JPEGs from GET /v1/snapshots/{id}.
 *
 * The ingest feed identifies a camera by IP, so the station's snapshots are the
 * snapshot-bearing events whose device IP belongs to a camera assigned to that
 * altanka. Without an assignment (PUT /v1/devices/{id}/assignment) there is no
 * way to attribute a frame to a station - hence the hint in the empty state.
 */
export function SnapshotGallery({
  stationCode,
  limit = 4,
}: {
  stationCode: string;
  limit?: number;
}) {
  const { data: devices, isLoading: devicesLoading } = useDevices({
    stationCode,
    source: "camera",
  });
  const cameraIps = useMemo(
    () => new Set((devices ?? []).map((d) => d.ip).filter(Boolean)),
    [devices],
  );
  const { data: events, isLoading: eventsLoading } = useRawEvents({
    source: "camera",
    onlySnapshots: true,
  });
  const [preview, setPreview] = useState<RawEvent | null>(null);

  const shots = useMemo(
    () => (events ?? []).filter((e) => e.deviceIp && cameraIps.has(e.deviceIp)).slice(0, limit),
    [events, cameraIps, limit],
  );

  if (devicesLoading || eventsLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!cameraIps.size) {
    return (
      <EmptyState
        icon={Camera}
        title="Brak przypisanej kamery"
        description="Żadne urządzenie typu kamera nie jest przypisane do tej altanki, więc nie da się powiązać z nią klatek z ingestu."
        action={
          <Link href="/urzadzenia" className="text-sm font-medium text-primary hover:underline">
            Przypisz urządzenie →
          </Link>
        }
        className="border-0 py-8"
      />
    );
  }

  if (!shots.length) {
    return (
      <EmptyState
        icon={Camera}
        title="Brak zdjęć"
        description="Kamera jest przypisana, ale nie ma zdarzeń z obrazem w historii ingestu."
        className="border-0 py-8"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {shots.map((e) => (
          <button
            key={e.id}
            onClick={() => setPreview(e)}
            className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted/40"
            title={`${formatDateTime(e.occurredAt)} · ${eventTypeLabel(e.eventType)}`}
          >
            <SnapshotImage
              snapshotId={e.snapshotId!}
              alt={`Snapshot ${formatDateTime(e.occurredAt)}`}
              className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              fallbackClassName="size-full rounded-none border-0"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1 text-[10px] text-white">
              {formatDateTime(e.occurredAt)}
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Zdjęcie z kamery"
        description={preview ? formatDateTime(preview.occurredAt) : undefined}
        className="max-w-3xl"
      >
        {preview && (
          <div className="space-y-3">
            <SnapshotImage
              snapshotId={preview.snapshotId!}
              alt="Zdjęcie z kamery"
              ratio="video"
              className="w-full rounded-xl border border-border"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="info">{eventTypeLabel(preview.eventType)}</Badge>
              {preview.deviceIp && <Badge variant="muted">{preview.deviceIp}</Badge>}
              {preview.channelId !== null && <Badge variant="muted">kanał {preview.channelId}</Badge>}
              {preview.isRetransmission && (
                <Badge variant="warning">retransmisja ×{preview.retransmissionCount}</Badge>
              )}
              <Link
                href={`/zdarzenia?pid=${encodeURIComponent(preview.pid ?? "")}`}
                className="ml-auto inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Zdarzenie w diagnostyce <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
