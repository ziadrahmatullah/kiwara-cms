import type { ImageLayout, LinkedFilter } from "@/types/api";

export interface GalleryFilterState {
  search: string;
  layout: ImageLayout | "all";
  linked: LinkedFilter;
}

export const DEFAULT_GALLERY_FILTERS: GalleryFilterState = { search: "", layout: "all", linked: "all" };

export function hasActiveGalleryFilter(f: GalleryFilterState): boolean {
  return f.search !== "" || f.layout !== "all" || f.linked !== "all";
}
