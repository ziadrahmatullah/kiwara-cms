import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EventScope } from "@/types/api";

interface EventScopeState {
  eventId: EventScope;
  setEventId: (v: EventScope) => void;
  reset: () => void;
}

export const useEventScopeStore = create<EventScopeState>()(
  persist(
    (set) => ({
      eventId: "all",
      setEventId: (v) => set({ eventId: v }),
      reset: () => set({ eventId: "all" }),
    }),
    { name: "kiwara-event-scope" },
  ),
);

export function scopeToString(scope: EventScope): string {
  return typeof scope === "number" ? String(scope) : scope;
}

export function stringToScope(value: string): EventScope {
  if (value === "all" || value === "none") return value;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : "all";
}
