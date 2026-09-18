import { Images, Mic } from "lucide-react";
import type { GuestbookMessage } from "@/types/api";
import { Badge } from "@/shared/components/ui/badge";

export function MediaBadges({ message }: { message: GuestbookMessage }) {
  const photoCount = message.images?.length ?? 0;
  if (photoCount === 0 && !message.voice_link) {
    return <span className="text-xs text-muted-foreground italic">Teks saja</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {photoCount > 0 && (
        <Badge variant="muted">
          <Images />
          {photoCount} foto
        </Badge>
      )}
      {message.voice_link && (
        <Badge variant="muted">
          <Mic />
          Suara
        </Badge>
      )}
    </div>
  );
}
