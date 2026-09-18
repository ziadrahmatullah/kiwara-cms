import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Columns3, Download, MessageSquareText, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { SegmentedControl } from "@/shared/components/ui/segmented";
import { downloadBlob, downloadManyWithToast } from "@/shared/lib/download";
import { buildFileName, extFromUrl, filePrefixFor } from "@/shared/lib/files";
import { formatDateTimeID } from "@/shared/lib/format";
import { getFramedSrc, getOriginals, isLegacyIdentical, layoutLabel } from "@/shared/lib/images";
import { buildDownloadItems } from "../downloads";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useUIStore } from "@/shared/store/useUIStore";
import type { LightboxImage, ViewMode } from "../types";

export interface LightboxProps {
  images: LightboxImage[];
  /** Indeks gambar yang dibuka; null = tertutup. */
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  initialTab?: ViewMode;
  onDelete?: (img: LightboxImage) => void;
  getMessageLink?: (img: LightboxImage) => string | null;
}

export function Lightbox({ images, index, onIndexChange, onClose, initialTab, onDelete, getMessageLink }: LightboxProps) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const defaultMode = useUIStore((s) => s.galleryViewMode);
  const [tab, setTab] = useState<ViewMode>(initialTab ?? defaultMode);
  const [originalIdx, setOriginalIdx] = useState(0);

  const open = index !== null;
  const current = index !== null ? images[index] : undefined;
  const originals = useMemo(() => (current ? getOriginals(current) : []), [current]);
  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < images.length - 1;

  // Reset tab & foto asli aktif saat gambar berganti (pola "state dari render sebelumnya").
  const [prevIndex, setPrevIndex] = useState(index);
  if (index !== prevIndex) {
    setPrevIndex(index);
    setTab(initialTab ?? defaultMode);
    setOriginalIdx(0);
  }

  // Navigasi keyboard; Esc ditangani Radix Dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onIndexChange((index as number) - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onIndexChange((index as number) + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasPrev, hasNext, index, onIndexChange]);

  // Pramuat gambar tetangga supaya navigasi terasa instan.
  useEffect(() => {
    if (index === null) return;
    [index - 1, index + 1].forEach((i) => {
      const img = images[i];
      if (img) {
        const pre = new Image();
        pre.src = getFramedSrc(img);
      }
    });
  }, [index, images]);

  if (!current) {
    return <Dialog open={false} onOpenChange={() => onClose()} />;
  }

  const src = tab === "framed" ? getFramedSrc(current) : originals[originalIdx] ?? originals[0];
  const messageLink = getMessageLink?.(current) ?? null;
  const isStrip = current.layout === "strip";

  const handleDownloadCurrent = () => {
    const prefix = filePrefixFor(current.event);
    const kind = tab === "framed" ? "bingkai" : `asli-${originalIdx + 1}`;
    void downloadBlob(src, buildFileName(prefix, current.id, kind, extFromUrl(src, tab === "framed" ? "png" : "jpg")));
  };

  const handleDownloadAll = () => {
    void downloadManyWithToast(buildDownloadItems(current), "file");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-5xl w-[calc(100vw-2rem)] p-0 gap-0 bg-black/95 border-0 text-white overflow-hidden rounded-xl"
        closeClassName="text-white opacity-80 hover:opacity-100 z-10"
      >
        <DialogTitle className="sr-only">Pratinjau foto</DialogTitle>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 pr-12 text-sm">
          <span className="font-medium truncate max-w-[50vw]">{current.guest?.fullname ?? "Belum terhubung"}</span>
          <span className="text-white/50">·</span>
          <span className="text-white/70 text-xs">{formatDateTimeID(current.created_at)}</span>
          <Badge variant="dark" className="bg-white/15 text-[10px]">
            {isStrip ? <Columns3 /> : <Square />}
            {layoutLabel(current.layout)}
          </Badge>
          {isAdmin && current.event && (
            <Badge variant="dark" className="bg-white/15 text-[10px]">
              {current.event.name}
            </Badge>
          )}
          <span className="ml-auto text-xs text-white/60 tabular-nums">
            {(index as number) + 1} / {images.length}
          </span>
        </div>

        {/* Tab */}
        <div className="px-4 pb-2">
          <SegmentedControl<ViewMode>
            value={tab}
            onChange={setTab}
            size="sm"
            tone="dark"
            options={[
              { value: "framed", label: "Bingkai" },
              { value: "original", label: `Foto asli (${originals.length})` },
            ]}
          />
        </div>

        {/* Gambar */}
        <div className="relative flex items-center justify-center min-h-[40vh] px-12">
          <img
            key={src}
            src={src}
            alt={current.guest?.fullname ?? "Foto buku tamu"}
            className="max-h-[68vh] max-w-full w-auto object-contain animate-in fade-in"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white hover:text-white disabled:opacity-20"
            onClick={() => onIndexChange((index as number) - 1)}
            disabled={!hasPrev}
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white hover:text-white disabled:opacity-20"
            onClick={() => onIndexChange((index as number) + 1)}
            disabled={!hasNext}
            aria-label="Foto berikutnya"
          >
            <ChevronRight />
          </Button>
        </div>

        {/* Thumbnail foto asli (strip) */}
        {tab === "original" && originals.length > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 pt-3">
            {originals.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => setOriginalIdx(i)}
                className={cn(
                  "h-14 w-14 rounded-md overflow-hidden ring-2 transition",
                  i === originalIdx ? "ring-white" : "ring-transparent opacity-70 hover:opacity-100",
                )}
                aria-label={`Foto asli ${i + 1}`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {isLegacyIdentical(current) && (
          <p className="px-4 pt-3 text-center text-xs text-white/60">
            Foto asli & bingkai identik (data lama sebelum perbaikan penamaan file).
          </p>
        )}

        {/* Aksi */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 mt-2 border-t border-white/10">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/15 text-white hover:bg-white/25"
            onClick={handleDownloadCurrent}
          >
            <Download /> Unduh file ini
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/15 text-white hover:bg-white/25"
            onClick={handleDownloadAll}
          >
            <Download /> Unduh semua ({buildDownloadItems(current).length})
          </Button>
          {messageLink && (
            <Button asChild variant="secondary" size="sm" className="bg-white/15 text-white hover:bg-white/25">
              <Link to={messageLink} onClick={onClose}>
                <MessageSquareText /> Lihat ucapan
              </Link>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="ml-auto"
              onClick={() => onDelete(current)}
            >
              <Trash2 /> Hapus
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
