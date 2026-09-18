import type { ApiEnvelope, GuestbookImageParams, GuestbookImageRow, Paginated } from "@/types/api";
import { apiClient, cleanParams, toPaginated } from "@/shared/lib/apiClient";

const BASE = "/api/guestbook-images";

export const guestbookImageService = {
  async getAll(params: GuestbookImageParams = {}): Promise<Paginated<GuestbookImageRow>> {
    const res = await apiClient.get<ApiEnvelope<GuestbookImageRow[]>>(BASE, cleanParams(params));
    return toPaginated(res);
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
