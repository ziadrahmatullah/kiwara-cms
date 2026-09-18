import { lazy, Suspense, useMemo, useState } from "react";
import { Columns3, Images, MessageSquareText, Mic } from "lucide-react";
import { useActiveEvents } from "@/domains/events/hooks/useEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { SegmentedControl } from "@/shared/components/ui/segmented";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ErrorState } from "@/shared/components/ErrorState";
import { useEffectiveEventScope } from "@/shared/hooks/useEffectiveEventScope";
import { formatNumberID } from "@/shared/lib/format";
import { fillDailySeries, useGuestbookStats } from "../hooks/useDashboard";
import { DailyLegend } from "./DailyLegend";
import { DailyTable } from "./DailyTable";
import { RecentMessages } from "./RecentMessages";
import { RecentPhotos } from "./RecentPhotos";
import { StatTile } from "./StatTile";

const DailyChart = lazy(() => import("./DailyChart"));

type ChartView = "chart" | "table";

export function Dashboard() {
  const scope = useEffectiveEventScope();
  const { data: events = [] } = useActiveEvents();
  const { data: stats, isLoading, isError, isFetching, refetch } = useGuestbookStats(scope.params);
  const [view, setView] = useState<ChartView>("chart");

  const daily = useMemo(() => fillDailySeries(stats?.daily, 14), [stats]);
  const hasActivity = daily.some((d) => d.messages > 0 || d.images > 0);

  const scopeLabel = scope.isForced
    ? scope.label
    : scope.scope === "all"
      ? "Semua event"
      : scope.scope === "none"
        ? "Tanpa event"
        : events.find((e) => e.id === scope.scope)?.name ?? "Event";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ringkasan buku tamu · <span className="text-foreground font-medium">{scopeLabel}</span>
        </p>
      </div>

      {isError ? (
        <ErrorState title="Gagal memuat statistik" onRetry={() => void refetch()} />
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isFetching && !isLoading ? "opacity-70" : ""} transition-opacity`}>
            <StatTile label="Total ucapan" value={stats?.total_messages} icon={MessageSquareText} loading={isLoading} />
            <StatTile
              label="Total foto"
              value={stats?.total_images}
              icon={Images}
              loading={isLoading}
              hint={stats ? `${formatNumberID(stats.total_orphan_images)} belum terhubung ucapan` : undefined}
            />
            <StatTile
              label="Bingkai 3 foto"
              value={stats?.total_strip}
              icon={Columns3}
              loading={isLoading}
              hint={stats ? `${formatNumberID(stats.total_single)} bingkai 1 foto` : undefined}
            />
            <StatTile label="Dengan pesan suara" value={stats?.total_with_voice} icon={Mic} loading={isLoading} />
          </div>

          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base">14 hari terakhir</CardTitle>
                <DailyLegend />
              </div>
              <SegmentedControl<ChartView>
                value={view}
                onChange={setView}
                size="sm"
                options={[
                  { value: "chart", label: "Grafik" },
                  { value: "table", label: "Tabel" },
                ]}
              />
            </CardHeader>
            <CardContent className={`pt-0 ${isFetching && !isLoading ? "opacity-70" : ""} transition-opacity`}>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : view === "table" ? (
                <DailyTable data={daily} />
              ) : !hasActivity ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  Belum ada aktivitas 14 hari terakhir.
                </div>
              ) : (
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <DailyChart data={daily} />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <RecentMessages scopeParams={scope.params} />
        </div>
        <div className="lg:col-span-3">
          <RecentPhotos scopeParams={scope.params} />
        </div>
      </div>
    </div>
  );
}
