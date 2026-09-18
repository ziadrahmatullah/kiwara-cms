import type { EventRef } from "@/types/api";

export function extFromUrl(url: string, fallback = "jpg"): string {
  try {
    const path = new URL(url, window.location.origin).pathname;
    const base = path.split("/").pop() ?? "";
    const idx = base.lastIndexOf(".");
    if (idx === -1) return fallback;
    const ext = base.slice(idx + 1).toLowerCase();
    return ext.length > 0 && ext.length <= 5 ? ext : fallback;
  } catch {
    return fallback;
  }
}

export function filePrefixFor(event?: EventRef | null): string {
  return `kiwara-${event?.slug ?? "tanpa-event"}`;
}

/** kiwara-zainab-ziad-42-bingkai.png, kiwara-zainab-ziad-42-asli-2.jpg */
export function buildFileName(prefix: string, id: number, kind: string, ext: string): string {
  return `${prefix}-${id}-${kind}.${ext}`;
}
