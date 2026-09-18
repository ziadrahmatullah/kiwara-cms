import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GuestbookImageParams } from "@/types/api";
import { guestbookImageService } from "../services";

export const GUESTBOOK_IMAGES_KEY = "guestbook-images";

export function useGuestbookImages(params: GuestbookImageParams = {}) {
  return useQuery({
    queryKey: [GUESTBOOK_IMAGES_KEY, params],
    queryFn: () => guestbookImageService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteGuestbookImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => guestbookImageService.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GUESTBOOK_IMAGES_KEY] });
      void qc.invalidateQueries({ queryKey: ["guestbook-messages"] });
      void qc.invalidateQueries({ queryKey: ["guestbook-stats"] });
    },
  });
}
