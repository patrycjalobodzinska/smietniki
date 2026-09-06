"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Truck, Gauge, Weight, ImageIcon, Route as RouteIcon } from "lucide-react";
import { DetailHeader } from "@/components/layout/detail-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  DescriptionList,
  Button,
  Badge,
  Spinner,
} from "@/components/ui";
import { FractionBadge, CollectionStatusBadge, DataSourceBadge } from "@/components/domain/badges";
import { useCollection } from "@/lib/api/hooks/use-operations";
import { useStation } from "@/lib/api/hooks/use-infrastructure";
import { formatDateTime } from "@/lib/utils/format";

const StationMap = dynamic(() => import("@/components/domain/station-map").then((m) => m.StationMap), {
  ssr: false,
  loading: () => <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-muted/40"><Spinner /></div>,
});

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: collection, isLoading } = useCollection(id);
  const { data: station } = useStation(collection?.stationId ?? "");

  if (isLoading || !collection) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <DetailHeader
        breadcrumbs={[{ label: "Odbiory", href: "/odbiory" }, { label: collection.stationName }]}
        title={`Odbiór - ${collection.stationName}`}
        subtitle={formatDateTime(collection.collectedAt)}
        badges={
          <>
            <FractionBadge fraction={collection.fraction} />
            <CollectionStatusBadge status={collection.status} />
            <DataSourceBadge source={collection.levelBeforeSource} />
          </>
        }
        actions={collection.routeId && <Button variant="outline" onClick={() => router.push("/trasy")}><RouteIcon /> Powiązana trasa</Button>}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Poziom przed" value={collection.levelBefore === null ? "N/D" : `${collection.levelBefore}%`} icon={Gauge} tone={(collection.levelBefore ?? 0) >= 90 ? "danger" : "default"} />
        <StatCard label="Poziom po" value={collection.levelAfter === null ? "N/D" : `${collection.levelAfter}%`} icon={Gauge} tone="success" />
        <StatCard label="Wkład do śmieciarki" value={`${collection.estimatedVehicleLoadDelta}%`} icon={Weight} />
        <StatCard label="Operator" value={collection.operator} icon={Truck} />
      </div>

      <div className="mt-3 sm:mt-6 grid gap-3 sm:gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-3 sm:space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Lokalizacja</CardTitle></CardHeader>
            <CardContent>{station && <StationMap stations={[station]} height={240} />}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Załącznik</CardTitle></CardHeader>
            <CardContent>
              <div className="flex aspect-[16/7] items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                <div className="flex flex-col items-center gap-2"><ImageIcon className="size-8" /><span className="text-xs">zdjęcie z odbioru (mock)</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-3 sm:space-y-6">
          <Card>
            <CardHeader><CardTitle>Dane odbioru</CardTitle></CardHeader>
            <CardContent>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Altanka", value: station ? <button className="text-primary hover:underline" onClick={() => router.push(`/altanki/${station.id}`)}>{station.name}</button> : collection.stationName },
                  { label: "Frakcja", value: <FractionBadge fraction={collection.fraction} /> },
                  { label: "Operator", value: collection.operator },
                  { label: "Data", value: formatDateTime(collection.collectedAt) },
                  { label: "Źródło poziomu 'przed'", value: <DataSourceBadge source={collection.levelBeforeSource} /> },
                  { label: "Status", value: <CollectionStatusBadge status={collection.status} /> },
                ]}
              />
              {collection.note && <p className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Notatka: {collection.note}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
