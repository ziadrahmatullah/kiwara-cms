import type { EventRef, GuestbookImage, GuestbookImageRow, GuestbookMessage } from "@/types/api";

export type ViewMode = "framed" | "original";

/** Gambar + konteks tamu/event, bentuk seragam untuk PhotoCard dan Lightbox. */
export type LightboxImage = GuestbookImage & {
  guest?: { id: number; fullname: string } | null;
  event?: EventRef | null;
};

export function toLightboxImage(row: GuestbookImageRow): LightboxImage {
  return { ...row, guest: row.guestbook_message, event: row.event };
}

export function messageImagesToLightbox(m: GuestbookMessage): LightboxImage[] {
  return m.images.map((img) => ({ ...img, guest: { id: m.id, fullname: m.fullname }, event: m.event }));
}
