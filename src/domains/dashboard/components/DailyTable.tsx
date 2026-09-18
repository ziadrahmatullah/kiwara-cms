import type { DailyStat } from "@/types/api";
import { formatDateID, formatNumberID } from "@/shared/lib/format";

/** Tampilan tabel untuk data grafik harian (aksesibilitas & angka pasti). */
export function DailyTable({ data }: { data: DailyStat[] }) {
  const rows = [...data].reverse();
  return (
    <div className="max-h-64 overflow-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/70 backdrop-blur text-xs text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-3 py-2">Tanggal</th>
            <th className="text-right font-medium px-3 py-2">Ucapan</th>
            <th className="text-right font-medium px-3 py-2">Foto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.date} className="border-t">
              <td className="px-3 py-1.5">{formatDateID(d.date)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{formatNumberID(d.messages)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{formatNumberID(d.images)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
