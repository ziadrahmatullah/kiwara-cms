import type { GuestbookImage, ImageLayout } from "@/types/api";

/** Daftar foto asli (1 untuk single, 3 untuk strip). Baris lama tanpa image_links -> [image_link]. */
export function getOriginals(img: GuestbookImage): string[] {
  if (img.image_links && img.image_links.length > 0) return img.image_links;
  return [img.image_link];
}

export function getFramedSrc(img: GuestbookImage): string {
  return img.framed_image_link ?? img.image_link;
}

/** Data lama: bug nama file membuat foto asli dan bingkai menunjuk file yang sama. */
export function isLegacyIdentical(img: GuestbookImage): boolean {
  return img.framed_image_link !== null && img.framed_image_link === img.image_link;
}

export function layoutLabel(layout: ImageLayout | undefined): string {
  return layout === "strip" ? "3 Foto" : "1 Foto";
}

export function photoCount(img: GuestbookImage): number {
  return getOriginals(img).length;
}
