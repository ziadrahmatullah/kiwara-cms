import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DailyStat, ScopeParams } from "@/types/api";
import { dashboardService } from "../services";

export const GUESTBOOK_STATS_KEY = "guestbook-stats";

export function useGuestbookStats(params: ScopeParams = {}) {
  return useQuery({
    queryKey: [GUESTBOOK_STATS_KEY, params],
    queryFn: () => dashboardService.getStats(params),
    placeholderData: keepPreviousData,
  });
}

/** Pastikan deret harian berisi tepat `days` hari terakhir (isi 0 bila kosong). */
export function fillDailySeries(daily: DailyStat[] | undefined, days = 14): DailyStat[] {
  const map = new Map((daily ?? []).map((d) => [d.date, d]));
  const out: DailyStat[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const found = map.get(key);
    out.push({ date: key, messages: found?.messages ?? 0, images: found?.images ?? 0 });
  }
  return out;
}
