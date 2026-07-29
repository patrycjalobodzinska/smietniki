"use client";

import { useParams, useRouter } from "next/navigation";
import { KeyRound, Clock, Timer, Video, ArrowRight } from "lucide-react";
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

  if (isLoading || !session) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  // Simulated before/after: a visit slightly raises fill on the mixed/paper container.
  const states = (containers ?? []).slice(0, 4).map((c, i) => {
    const after = c.fillLevel;
    const before = after === null ? null : Math.max(0, after - (i === 0 ? 6 : i === 1 ? 3 : 0));
    return { container: c, before, after, changed: before !== null && after !== null && after !== before };
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Klucz" value={session.keyIdentifier} icon={KeyRound} />
        <StatCard label="Rozpoczęcie" value={formatDateTime(session.startedAt)} icon={Clock} />
        <StatCard label="Zakończenie" value={session.endedAt ? formatDateTime(session.endedAt) : "N/D"} icon={Clock} />
        <StatCard label="Czas trwania" value={duration(session.durationSeconds)} icon={Timer} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Stan pojemników: przed → po wizycie</CardTitle></CardHeader>
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
            </CardContent>
          </Card>

          {session.hasRecording && (
            <Card>
              <CardHeader><CardTitle>Nagranie z wizyty</CardTitle></CardHeader>
              <CardContent>
                <div className="flex aspect-video items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2"><Video className="size-8" /><span className="text-xs">podgląd nagrania (mock)</span></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Dane sesji</CardTitle></CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Altanka", value: station ? <button className="text-primary hover:underline" onClick={() => router.push(`/altanki/${station.id}`)}>{station.name}</button> : "—" },
                  { label: "Lokal", value: `#${session.unitNumber}` },
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
