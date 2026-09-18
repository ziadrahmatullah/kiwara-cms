import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GuestbookMessageParams } from "@/types/api";
import { guestbookMessageService } from "../services";

export const GUESTBOOK_MESSAGES_KEY = "guestbook-messages";

export function useGuestbookMessages(params: GuestbookMessageParams = {}) {
  return useQuery({
    queryKey: [GUESTBOOK_MESSAGES_KEY, params],
    queryFn: () => guestbookMessageService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useGuestbookMessage(id?: string) {
  return useQuery({
    queryKey: [GUESTBOOK_MESSAGES_KEY, "detail", id],
    queryFn: () => guestbookMessageService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useDeleteGuestbookMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => guestbookMessageService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GUESTBOOK_MESSAGES_KEY] });
      qc.invalidateQueries({ queryKey: ["guestbook-images"] });
      qc.invalidateQueries({ queryKey: ["guestbook-stats"] });
    },
  });
}
