import type { ApiEnvelope, GuestbookStats, ScopeParams } from "@/types/api";
import { apiClient, cleanParams } from "@/shared/lib/apiClient";

export const dashboardService = {
  async getStats(params: ScopeParams = {}): Promise<GuestbookStats> {
    const res = await apiClient.get<ApiEnvelope<GuestbookStats>>("/api/guestbook-stats", cleanParams(params));
    return res.data;
  },
};
