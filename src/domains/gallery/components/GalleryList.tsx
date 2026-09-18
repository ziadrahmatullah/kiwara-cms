import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Images } from "lucide-react";
import { toast } from "sonner";
import type { GuestbookImageParams } from "@/types/api";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useEffectiveEventScope } from "@/shared/hooks/useEffectiveEventScope";
import { formatNumberID } from "@/shared/lib/format";
import { useUIStore } from "@/shared/store/useUIStore";
import { useDeleteGuestbookImage, useGuestbookImages } from "../hooks/useGuestbookImages";
import { toLightboxImage, type LightboxImage } from "../types";
import { GalleryFilters } from "./GalleryFilters";
import { DEFAULT_GALLERY_FILTERS, hasActiveGalleryFilter, type GalleryFilterState } from "./galleryFilterState";
import { Lightbox } from "./Lightbox";
import { PhotoGrid, PhotoGridSkeleton } from "./PhotoGrid";
import { ViewModeToggle } from "./ViewModeToggle";

export function GalleryList() {
  const navigate = useNavigate();
  const scope = useEffectiveEventScope();
  const mode = useUIStore((s) => s.galleryViewMode);
  const setMode = useUIStore((s) => s.setGalleryViewMode);

  const [filters, setFilters] = useState<GalleryFilterState>(DEFAULT_GALLERY_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LightboxImage | null>(null);

  const search = useDebouncedValue(filters.search.trim(), 300);

  const params = useMemo<GuestbookImageParams>(
    () => ({
      page,
      limit,
      search: search || undefined,
      layout: filters.layout === "all" ? undefined : filters.layout,
      linked: filters.linked === "all" ? undefined : filters.linked,
      ...scope.params,
    }),
    [page, limit, search, filters.layout, filters.linked, scope.params],
  );

  const { data, isLoading, isError, refetch, isFetching } = useGuestbookImages(params);
  const deleteMutation = useDeleteGuestbookImage();

  const images = useMemo(() => (data?.items ?? []).map(toLightboxImage), [data]);
  const total = data?.pagination.total_item ?? 0;
  const hasActiveFilter = hasActiveGalleryFilter(filters);

  const updateFilters = (next: GalleryFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Foto dihapus.");
      if (openIndex !== null && images[openIndex]?.id === deleteTarget.id) setOpenIndex(null);
      setDeleteTarget(null);
    } catch {
      /* error sudah ditampilkan apiClient */
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeri Foto"
        description={
          <>
            Foto photobooth dari buku tamu.{" "}
            {!isLoading && <span className="text-foreground font-medium">{formatNumberID(total)} foto</span>}
          </>
        }
        actions={<ViewModeToggle value={mode} onChange={setMode} />}
      />

      <GalleryFilters value={filters} onChange={updateFilters} onReset={() => updateFilters(DEFAULT_GALLERY_FILTERS)} />

      {isLoading ? (
        <PhotoGridSkeleton count={limit > 24 ? 24 : limit} />
      ) : isError ? (
        <ErrorState title="Gagal memuat foto" onRetry={() => void refetch()} />
      ) : images.length === 0 ? (
        <EmptyState
          icon={Images}
          title={hasActiveFilter ? "Tidak ada foto yang cocok" : "Belum ada foto"}
          description={
            hasActiveFilter
              ? "Coba ubah atau reset filter."
              : "Foto akan muncul setelah tamu mengunggah dari halaman ucapan atau photobooth."
          }
        />
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
          <PhotoGrid
            images={images}
            mode={mode}
            onOpen={setOpenIndex}
            onDelete={setDeleteTarget}
            onViewMessage={(img) => img.guest && navigate(`/panel/ucapan/${img.guest.id}`)}
          />
        </div>
      )}

      {data && data.pagination.total_item > 0 && (
        <Pagination
          page={page}
          limit={limit}
          pagination={data.pagination}
          limitOptions={[12, 24, 48]}
          unitLabel="foto"
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      <Lightbox
        images={images}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        onDelete={setDeleteTarget}
        getMessageLink={(img) => (img.guest ? `/panel/ucapan/${img.guest.id}` : null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Foto"
        description="Foto asli dan bingkainya akan dihapus permanen dari server."
        confirmLabel="Ya, hapus"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
