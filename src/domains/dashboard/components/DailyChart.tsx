import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyStat } from "@/types/api";
import { formatDateID, formatDayShortID, formatNumberID } from "@/shared/lib/format";
import { DAILY_SERIES as SERIES } from "./dailySeries";

interface DailyChartProps {
  data: DailyStat[];
}

interface TooltipRow {
  dataKey?: unknown;
  value?: unknown;
  name?: unknown;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: ReadonlyArray<TooltipRow>; label?: unknown }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-popover text-popover-foreground shadow-md px-3 py-2 text-xs min-w-36">
      <p className="text-muted-foreground mb-1.5">{formatDateID(String(label))}</p>
      <div className="space-y-1">
        {SERIES.map((s) => {
          const row = payload.find((p) => p.dataKey === s.key);
          const value = Number(row?.value ?? 0);
          return (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold tabular-nums text-foreground">{formatNumberID(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Grafik batang harian 14 hari: ucapan vs foto. */
export default function DailyChart({ data }: DailyChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="30%" barGap={2} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayShortID}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            width={40}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) => formatNumberID(v)}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", fillOpacity: 0.6 }}
            content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={label} />}
          />
          {SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
              activeBar={{ fillOpacity: 0.75 }}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
