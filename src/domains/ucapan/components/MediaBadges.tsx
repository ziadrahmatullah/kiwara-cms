import { Images, Mic } from "lucide-react";
import type { GuestbookMessage } from "@/types/api";
import { Badge } from "@/shared/components/ui/badge";
import { photoCount as countPhotos } from "@/shared/lib/images";

export function MediaBadges({ message }: { message: GuestbookMessage }) {
  // Jumlah foto asli: bingkai strip dihitung 3, bukan 1.
  const photoCount = (message.images ?? []).reduce((sum, img) => sum + countPhotos(img), 0);
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
