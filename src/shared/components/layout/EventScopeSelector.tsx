import { CalendarDays } from "lucide-react";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useActiveEvents } from "@/domains/events/hooks/useEvents";
import { useEffectiveEventScope } from "@/shared/hooks/useEffectiveEventScope";
import { scopeToString, stringToScope } from "@/shared/store/useEventScopeStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function EventScopeSelector() {
  const user = useAuthStore((s) => s.user);
  const { scope, setScope, isForced } = useEffectiveEventScope();
  const { data: events = [] } = useActiveEvents();

  if (isForced) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 sm:px-3 py-1.5 text-xs text-muted-foreground shrink-0"
        title={user?.event?.name ?? "Tanpa event"}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline truncate max-w-40">{user?.event?.name ?? "Tanpa event"}</span>
      </span>
    );
  }

  return (
    <Select value={scopeToString(scope)} onValueChange={(v) => setScope(stringToScope(v))}>
      <SelectTrigger
        className="h-9 w-9 sm:w-56 px-2 sm:px-3 text-xs justify-center sm:justify-between [&>svg:last-child]:hidden sm:[&>svg:last-child]:block"
        aria-label="Pilih event"
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline truncate">
            <SelectValue />
          </span>
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="all">Semua event</SelectItem>
        {events.map((ev) => (
          <SelectItem key={ev.id} value={String(ev.id)}>
            {ev.name}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value="none">Tanpa event</SelectItem>
      </SelectContent>
    </Select>
  );
}
