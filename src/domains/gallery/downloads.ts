import type { DownloadItem } from "@/shared/lib/download";
import { buildFileName, extFromUrl, filePrefixFor } from "@/shared/lib/files";
import { getFramedSrc, getOriginals, isLegacyIdentical } from "@/shared/lib/images";
import type { LightboxImage } from "./types";

/** Daftar file unduhan (bingkai + semua foto asli) untuk satu gambar. */
export function buildDownloadItems(img: LightboxImage): DownloadItem[] {
  const prefix = filePrefixFor(img.event);
  const items: DownloadItem[] = [];
  const framed = getFramedSrc(img);
  items.push({ url: framed, filename: buildFileName(prefix, img.id, "bingkai", extFromUrl(framed, "png")) });
  if (!isLegacyIdentical(img)) {
    getOriginals(img).forEach((url, i) => {
      items.push({ url, filename: buildFileName(prefix, img.id, `asli-${i + 1}`, extFromUrl(url)) });
    });
  }
  return items;
}
