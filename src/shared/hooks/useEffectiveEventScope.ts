import { useCallback } from "react";
import type { EventScope, ScopeParams } from "@/types/api";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useEventScopeStore } from "@/shared/store/useEventScopeStore";

export interface EffectiveEventScope {
  scope: EventScope;
  /** Parameter query yang di-spread ke semua request gallery/ucapan/dashboard. */
  params: ScopeParams;
  /** true untuk role user: scope dikunci ke event miliknya. */
  isForced: boolean;
  setScope: (v: EventScope) => void;
  /** Label scope aktif, mis. "Semua event" / nama event / "Tanpa event". */
  label: string;
}

export function scopeToParams(scope: EventScope): ScopeParams {
  if (scope === "all") return {};
  if (scope === "none") return { event_id: "none" };
  return { event_id: scope };
}

/**
 * Satu-satunya tempat pemaksaan peran terjadi: role user selalu memakai event
 * miliknya, admin memakai pilihan dari header. Server tetap memaksa role user,
 * tapi mengirim id-nya membuat query key per event dan menghindari `none`.
 */
export function useEffectiveEventScope(): EffectiveEventScope {
  const user = useAuthStore((s) => s.user);
  const storeScope = useEventScopeStore((s) => s.eventId);
  const setEventId = useEventScopeStore((s) => s.setEventId);

  const isForced = user?.role !== "admin";
  const scope: EventScope = isForced ? (user?.event_id ?? "none") : storeScope;

  const setScope = useCallback(
    (v: EventScope) => {
      if (!isForced) setEventId(v);
    },
    [isForced, setEventId],
  );

  let label = "Semua event";
  if (isForced) label = user?.event?.name ?? "Tanpa event";
  else if (scope === "none") label = "Tanpa event";

  return { scope, params: scopeToParams(scope), isForced, setScope, label };
}
