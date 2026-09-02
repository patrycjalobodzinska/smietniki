"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Clock, Timer, Video, ArrowRight, AlertTriangle, Camera } from "lucide-react";
import { DetailHeader } from "@/components/layout/detail-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  DescriptionList,
  Badge,
  Spinner,
} from "@/components/ui";
import { FractionBadge, AnomalyBadge } from "@/components/domain/badges";
import { useAccessSession } from "@/lib/api/hooks/use-operations";
import { SnapshotImage } from "@/components/domain/snapshot-image";
import { useRawEvent } from "@/lib/api/hooks/use-events";
import { useFillMeasurements } from "@/lib/api/hooks/use-fill";
import { useContainers, useStation } from "@/lib/api/hooks/use-infrastructure";
import { KEY_TYPE_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils/format";

function duration(sec: number | null) {
  if (sec === null) return "N/D";
  const m = Math.floor(sec / 60);
  return m ? `${m} min ${sec % 60}s` : `${sec}s`;
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: session, isLoading } = useAccessSession(id);
  const { data: station } = useStation(session?.stationId ?? "");
  const { data: containers } = useContainers({ stationId: session?.stationId });
  // The RFID swipe behind this session, straight from the ingest feed.
  const { data: rawEvent } = useRawEvent(session?.rawEventId ?? "");
  const eventTime = session ? +new Date(session.startedAt) : 0;
  const { data: window6h } = useFillMeasurements(
    {
      from: new Date(eventTime - 6 * 3600_000).toISOString(),
      to: new Date(eventTime + 6 * 3600_000).toISOString(),
    },
    !!session,
  );

  if (isLoading || !session) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  // Real before/after: the last measurement before the swipe and the first
  // after it, per container of this altanka (window: ±6 h around the event).
  const states = (containers ?? []).map((c) => {
    const readings = (window6h ?? []).filter((m) => m.containerCode === c.code);
    const t = +new Date(session.startedAt);
    const before = readings.filter((m) => +new Date(m.measuredAt) <= t).at(0)?.value ?? null;
    const after = readings.filter((m) => +new Date(m.measuredAt) > t).at(-1)?.value ?? null;
    return {
      container: c,
      before,
      after,
      changed: before !== null && after !== null && after !== before,
    };
  });

  return (
    <div>
      <DetailHeader
        breadcrumbs={[{ label: "Sesje dostępu", href: "/sesje" }, { label: session.keyIdentifier }]}
        title={`Sesja ${session.keyIdentifier}`}
        subtitle={station ? `${station.name} · Lokal ${session.unitNumber}` : undefined}
        badges={
          <>
            <Badge variant="outline">{KEY_TYPE_LABEL[session.keyType]}</Badge>
            {session.hasRecording && <Badge variant="info"><Video className="size-3" /> Nagranie</Badge>}
            {session.anomaly && <AnomalyBadge />}
          </>
        }
      />

      {session.anomaly && (
        <div className="mt-4 rounded-lg border border-danger/40 bg-danger/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-danger">Wykryto anomalię</p>
              <p className="text-sm text-muted-foreground">
                Anomalia dotyczy tej sesji dostępu. Backend zgłasza wyłącznie sam fakt
                (bez typu i przyczyny) — poniżej kontekst zdarzenia, którego dotyczy.
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Altanka</dt>
                  <dd className="font-medium">
                    {station ? (
                      <button className="text-primary hover:underline" onClick={() => router.push(`/altanki/${station.id}`)}>
                        {station.name}
                      </button>
                    ) : (
                      session.stationName || "—"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Lokal</dt>
                  <dd className="font-medium">{session.unitNumber ? `#${session.unitNumber}` : "—"}</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Klucz / karta</dt>
                  <dd className="font-medium">{session.keyIdentifier}</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-muted-foreground">Czas zdarzenia</dt>
                  <dd className="font-medium">{formatDateTime(session.startedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Klucz" value={session.keyIdentifier} icon={KeyRound} />
        <StatCard label="Rozpoczęcie" value={formatDateTime(session.startedAt)} icon={Clock} />
        <StatCard label="Zakończenie" value={session.endedAt ? formatDateTime(session.endedAt) : "N/D"} icon={Clock} />
        <StatCard label="Czas trwania" value={duration(session.durationSeconds)} icon={Timer} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Stan pojemników: przed → po wizycie</CardTitle>
              <span className="text-xs text-muted-foreground">pomiary ±6 h od zdarzenia</span>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {states.map(({ container, before, after, changed }) => (
                <div key={container.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <FractionBadge fraction={container.fraction} />
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{container.code}</span>
                  <span className="text-sm tabular-nums">{before === null ? "N/D" : `${before}%`}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold tabular-nums">{after === null ? "N/D" : `${after}%`}</span>
                  {changed && <Badge variant="warning">zmiana</Badge>}
                </div>
              ))}
              {!states.length && (
                <p className="py-4 text-sm text-muted-foreground">
                  Altanka nie ma pojemników z telemetrią zapełnienia.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {session.rawEventId && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Zdarzenie w ingeście</CardTitle>
                <Link
                  href={`/zdarzenia?pid=${encodeURIComponent(rawEvent?.pid ?? "")}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Diagnostyka →
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {rawEvent?.hasSnapshot && rawEvent.snapshotId && (
                  <SnapshotImage
                    snapshotId={rawEvent.snapshotId}
                    alt="Snapshot z chwili otwarcia"
                    className="w-full rounded-xl border border-border"
                  />
                )}
                <DescriptionList
                  columns={1}
                  items={[
                    { label: "Typ zdarzenia", value: rawEvent?.eventType ?? "—" },
                    { label: "Urządzenie", value: rawEvent?.deviceIp ?? "—" },
                    { label: "PID", value: rawEvent?.pid ?? "—" },
                    {
                      label: "Obraz z kamery",
                      value: rawEvent?.hasSnapshot ? (
                        <span className="inline-flex items-center gap-1 text-info">
                          <Camera className="size-3.5" /> tak
                        </span>
                      ) : (
                        "nie"
                      ),
                    },
                    {
                      label: "Retransmisja",
                      value: rawEvent?.isRetransmission
                        ? `tak (×${rawEvent.retransmissionCount})`
                        : "nie",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Dane sesji</CardTitle></CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Altanka", value: station ? <button className="text-primary hover:underline" onClick={() => router.push(`/altanki/${station.id}`)}>{station.name}</button> : "—" },
                  { label: "Lokal", value: session.unitNumber ? `#${session.unitNumber}` : "—" },
                  { label: "Klucz / karta", value: session.keyIdentifier },
                  { label: "Typ klucza", value: KEY_TYPE_LABEL[session.keyType] },
                  { label: "Anomalia", value: session.anomaly ? "Tak — wykryto" : "Nie" },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
