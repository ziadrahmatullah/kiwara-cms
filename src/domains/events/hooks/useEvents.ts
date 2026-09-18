import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Event, EventListParams, EventPayload } from "@/types/api";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { eventService } from "../services";

export const EVENTS_KEY = "events";

export function useEvents(params: EventListParams = {}) {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: [EVENTS_KEY, params],
    queryFn: () => eventService.getAll(params),
    enabled: role === "admin",
    placeholderData: keepPreviousData,
  });
}

/** Daftar event aktif untuk selector di header (admin saja). */
export function useActiveEvents() {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: [EVENTS_KEY, "active"],
    queryFn: () => eventService.getAll({ is_active: true, limit: 100 }),
    enabled: role === "admin",
    select: (data) => data.items,
    staleTime: 1000 * 60 * 10,
  });
}

export function useEvent(id?: string) {
  return useQuery({
    queryKey: [EVENTS_KEY, "detail", id],
    queryFn: () => eventService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventPayload) => eventService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: EventPayload }) => eventService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}

export type { Event };
