import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GalleryViewMode = "framed" | "original";

interface UIState {
  sidebarOpen: boolean;
  isDark: boolean;
  galleryViewMode: GalleryViewMode;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDark: () => void;
  initTheme: () => void;
  setGalleryViewMode: (mode: GalleryViewMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      isDark: false,
      galleryViewMode: "framed",
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleDark: () => {
        const next = !get().isDark;
        set({ isDark: next });
        document.documentElement.classList.toggle("dark", next);
      },
      initTheme: () => {
        document.documentElement.classList.toggle("dark", get().isDark);
      },
      setGalleryViewMode: (mode) => set({ galleryViewMode: mode }),
    }),
    { name: "kiwara-ui" },
  ),
);
