import type { ApiEnvelope, Event, EventListParams, EventPayload, Paginated } from "@/types/api";
import { apiClient, cleanParams, toPaginated } from "@/shared/lib/apiClient";

const BASE = "/api/admin/events";

export const eventService = {
  async getAll(params: EventListParams = {}): Promise<Paginated<Event>> {
    const res = await apiClient.get<ApiEnvelope<Event[]>>(BASE, cleanParams(params));
    return toPaginated(res);
  },
  async getById(id: number | string): Promise<Event> {
    const res = await apiClient.get<ApiEnvelope<Event>>(`${BASE}/${id}`);
    return res.data;
  },
  async create(payload: EventPayload): Promise<Event> {
    const res = await apiClient.post<ApiEnvelope<Event>>(BASE, payload);
    return res.data;
  },
  async update(id: number | string, payload: EventPayload): Promise<Event> {
    const res = await apiClient.put<ApiEnvelope<Event>>(`${BASE}/${id}`, payload);
    return res.data;
  },
  async remove(id: number | string): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
