import { Columns3, Eye, MessageSquareText, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { formatDateTimeID } from "@/shared/lib/format";
import { getFramedSrc, getOriginals, layoutLabel } from "@/shared/lib/images";
import type { LightboxImage, ViewMode } from "../types";

export interface PhotoCardProps {
  image: LightboxImage;
  mode: ViewMode;
  /** Tampilkan nama tamu di overlay (matikan di halaman detail ucapan). */
  showGuest?: boolean;
  onOpen: () => void;
  onDelete?: () => void;
  onViewMessage?: () => void;
  className?: string;
}

const overlayBtn =
  "h-8 w-8 inline-flex items-center justify-center rounded-md bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors [&_svg]:size-4";

export function PhotoCard({ image, mode, showGuest = true, onOpen, onDelete, onViewMessage, className }: PhotoCardProps) {
  const isStrip = image.layout === "strip";
  const originals = getOriginals(image);
  const src = mode === "framed" ? getFramedSrc(image) : originals[0];
  const guestName = image.guest?.fullname;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group relative w-full h-full rounded-xl overflow-hidden border cursor-pointer hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        mode === "framed" ? "bg-neutral-900" : "bg-muted",
        className,
      )}
    >
      <img
        src={src}
        alt={guestName ? `Foto dari ${guestName}` : "Foto buku tamu"}
        loading="lazy"
        className={cn(
          "w-full h-full transition-transform duration-300 group-hover:scale-[1.03]",
          mode === "framed" ? "object-contain" : "object-cover",
        )}
      />

      {/* Badge layout selalu tampil */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <Badge variant="dark" className="text-[10px]">
          {isStrip ? <Columns3 /> : <Square />}
          {layoutLabel(image.layout)}
        </Badge>
      </div>
      {mode === "original" && originals.length > 1 && (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 backdrop-blur-sm group-hover:opacity-0 transition-opacity">
          +{originals.length - 1}
        </span>
      )}

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
        <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0 text-white drop-shadow-md">
            {showGuest && (
              <p className="text-xs font-medium truncate">{guestName ?? "Belum terhubung"}</p>
            )}
            <p className="text-[10px] text-white/80 truncate">{formatDateTimeID(image.created_at)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button type="button" className={overlayBtn} onClick={onOpen} title="Lihat" aria-label="Lihat foto">
              <Eye />
            </button>
            {onViewMessage && image.guest && (
              <button
                type="button"
                className={overlayBtn}
                onClick={onViewMessage}
                title="Lihat ucapan"
                aria-label="Lihat ucapan"
              >
                <MessageSquareText />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className={cn(overlayBtn, "hover:bg-red-500/60")}
                onClick={onDelete}
                title="Hapus"
                aria-label="Hapus foto"
              >
                <Trash2 />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
