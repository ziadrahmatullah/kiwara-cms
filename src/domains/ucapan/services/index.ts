import type { ApiEnvelope, GuestbookMessage, GuestbookMessageParams, Paginated } from "@/types/api";
import { apiClient, cleanParams, toPaginated } from "@/shared/lib/apiClient";

const BASE = "/api/guestbook-messages";

export const guestbookMessageService = {
  async getAll(params: GuestbookMessageParams = {}): Promise<Paginated<GuestbookMessage>> {
    const res = await apiClient.get<ApiEnvelope<GuestbookMessage[]>>(BASE, cleanParams(params));
    return toPaginated(res);
  },
  async getById(id: number | string): Promise<GuestbookMessage> {
    const res = await apiClient.get<ApiEnvelope<GuestbookMessage>>(`${BASE}/${id}`);
    return res.data;
  },
  async remove(id: number | string): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
