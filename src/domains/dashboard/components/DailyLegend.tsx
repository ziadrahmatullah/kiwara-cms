import { DAILY_SERIES } from "./dailySeries";

/** Legend manual (kotak = tanda batang), teks memakai token teks, bukan warna seri. */
export function DailyLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {DAILY_SERIES.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}
