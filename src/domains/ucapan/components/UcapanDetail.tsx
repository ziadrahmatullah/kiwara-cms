import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { GuestbookMessage } from "@/types/api";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import {
  Lightbox,
  messageImagesToLightbox,
  PhotoGrid,
  PhotoGridSkeleton,
  useDeleteGuestbookImage,
  ViewModeToggle,
  type LightboxImage,
} from "@/domains/gallery";
import { ApiError, getErrorMessage } from "@/shared/lib/apiClient";
import { downloadBlob, downloadManyWithToast, type DownloadItem } from "@/shared/lib/download";
import { buildFileName, extFromUrl, filePrefixFor } from "@/shared/lib/files";
import { formatDateTimeID } from "@/shared/lib/format";
import { getFramedSrc, getOriginals } from "@/shared/lib/images";
import { useUIStore } from "@/shared/store/useUIStore";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { ErrorState } from "@/shared/components/ErrorState";
import { NotFound } from "@/shared/components/NotFound";
import { useDeleteGuestbookMessage, useGuestbookMessage } from "../hooks/useGuestbookMessages";
import { MediaBadges } from "./MediaBadges";

function buildDownloadItems(message: GuestbookMessage): DownloadItem[] {
  const prefix = filePrefixFor(message.event);
  const files: DownloadItem[] = [];
  for (const img of message.images) {
    const framed = getFramedSrc(img);
    files.push({ url: framed, filename: buildFileName(prefix, img.id, "bingkai", extFromUrl(framed, "png")) });
    getOriginals(img).forEach((url, i) => {
      files.push({ url, filename: buildFileName(prefix, img.id, `asli-${i + 1}`, extFromUrl(url)) });
    });
  }
  return files;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-28" />
      <PhotoGridSkeleton count={4} />
    </div>
  );
}

export function UcapanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const { galleryViewMode, setGalleryViewMode } = useUIStore();

  const { data: message, isLoading, isError, error, refetch } = useGuestbookMessage(id);
  const deleteMessage = useDeleteGuestbookMessage();
  const deleteImage = useDeleteGuestbookImage();

  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState(false);
  const [imageDeleteTarget, setImageDeleteTarget] = useState<LightboxImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const lightboxImages = useMemo(() => (message ? messageImagesToLightbox(message) : []), [message]);

  const notFound = isError && error instanceof ApiError && error.status === 404;

  if (isLoading) return <DetailSkeleton />;
  if (notFound || (!isLoading && !isError && !message)) {
    return <NotFound title="Ucapan tidak ditemukan" description="Ucapan ini mungkin sudah dihapus." backTo="/panel/ucapan" backLabel="Kembali ke daftar" />;
  }
  if (isError || !message) {
    return <ErrorState title="Gagal memuat ucapan" message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const prefix = filePrefixFor(message.event);
  const imageCount = message.images.length;

  const handleDownloadAll = () => {
    const files = buildDownloadItems(message);
    void downloadManyWithToast(files, "file");
  };

  const handleDownloadVoice = () => {
    if (!message.voice_link) return;
    void downloadBlob(
      message.voice_link,
      buildFileName(prefix, message.id, "suara", extFromUrl(message.voice_link, "webm")),
    );
  };

  const handleDeleteMessage = async () => {
    try {
      await deleteMessage.mutateAsync(message.id);
      toast.success("Ucapan dihapus.");
      setConfirmDeleteMessage(false);
      navigate("/panel/ucapan", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghapus ucapan."));
    }
  };

  const handleDeleteImage = async () => {
    if (!imageDeleteTarget) return;
    try {
      await deleteImage.mutateAsync(imageDeleteTarget.id);
      toast.success("Foto dihapus.");
      if (lightboxIndex !== null) setLightboxIndex(null);
      setImageDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghapus foto."));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/panel/ucapan")} aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight truncate">{message.fullname}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDateTimeID(message.created_at)}</span>
              {isAdmin && (
                <Badge variant="outline">{message.event?.name ?? "Tanpa event"}</Badge>
              )}
              <MediaBadges message={message} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 sm:pl-12">
          <Button variant="outline" onClick={handleDownloadAll} disabled={imageCount === 0}>
            <Download className="h-4 w-4" />
            Unduh semua
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDeleteMessage(true)}>
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Pesan */}
      <Card>
        <CardHeader>
          <CardTitle>Pesan</CardTitle>
        </CardHeader>
        <CardContent>
          {message.message ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">Tidak ada pesan tertulis.</p>
          )}
        </CardContent>
      </Card>

      {/* Pesan suara */}
      {message.voice_link && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Pesan suara</CardTitle>
            <Button variant="outline" size="sm" onClick={handleDownloadVoice}>
              <Download className="h-3.5 w-3.5" />
              Unduh suara
            </Button>
          </CardHeader>
          <CardContent>
            <audio controls preload="none" src={message.voice_link} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Foto */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Foto ({imageCount})</h2>
          {imageCount > 0 && <ViewModeToggle value={galleryViewMode} onChange={setGalleryViewMode} size="sm" />}
        </div>
        {imageCount === 0 ? (
          <p className="text-sm text-muted-foreground">Ucapan ini tidak memiliki foto.</p>
        ) : (
          <PhotoGrid
            images={lightboxImages}
            mode={galleryViewMode}
            showGuest={false}
            onOpen={setLightboxIndex}
            onDelete={setImageDeleteTarget}
          />
        )}
      </section>

      <Lightbox
        images={lightboxImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
        initialTab={galleryViewMode}
        onDelete={setImageDeleteTarget}
      />

      <ConfirmDialog
        open={confirmDeleteMessage}
        onOpenChange={setConfirmDeleteMessage}
        title="Hapus Ucapan"
        description={
          <>
            Ucapan dari <b>{message.fullname}</b> beserta foto &amp; suaranya akan dihapus permanen.
          </>
        }
        confirmLabel="Hapus"
        destructive
        loading={deleteMessage.isPending}
        onConfirm={handleDeleteMessage}
      />

      <ConfirmDialog
        open={imageDeleteTarget !== null}
        onOpenChange={(open) => !open && setImageDeleteTarget(null)}
        title="Hapus Foto"
        description="Foto asli dan bingkainya akan dihapus permanen."
        confirmLabel="Hapus"
        destructive
        loading={deleteImage.isPending}
        onConfirm={handleDeleteImage}
      />
    </div>
  );
}
