import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MessageSquareText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { GuestbookMessage, GuestbookMessageParams } from "@/types/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useEffectiveEventScope } from "@/shared/hooks/useEffectiveEventScope";
import { formatDateTimeID, formatNumberID } from "@/shared/lib/format";
import { getErrorMessage } from "@/shared/lib/apiClient";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { useDeleteGuestbookMessage, useGuestbookMessages } from "../hooks/useGuestbookMessages";
import { MediaBadges } from "./MediaBadges";
import { UcapanFilters } from "./UcapanFilters";
import {
  DEFAULT_UCAPAN_FILTERS,
  hasActiveUcapanFilter,
  triToBool,
  type UcapanFilterState,
} from "./ucapanFilterState";

const LIMIT_OPTIONS = [10, 25, 50, 100];

function EventBadge({ message }: { message: GuestbookMessage }) {
  return (
    <Badge variant="outline" className="max-w-full">
      <span className="truncate">{message.event?.name ?? "Tanpa event"}</span>
    </Badge>
  );
}

export function UcapanList() {
  const navigate = useNavigate();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const scope = useEffectiveEventScope();

  const [filters, setFilters] = useState<UcapanFilterState>(DEFAULT_UCAPAN_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<GuestbookMessage | null>(null);

  const debouncedSearch = useDebouncedValue(filters.search.trim(), 300);

  const params = useMemo<GuestbookMessageParams>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      has_photo: triToBool(filters.hasPhoto),
      has_voice: triToBool(filters.hasVoice),
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
      ...scope.params,
    }),
    [page, limit, debouncedSearch, filters.hasPhoto, filters.hasVoice, filters.dateFrom, filters.dateTo, scope.params],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useGuestbookMessages(params);
  const deleteMutation = useDeleteGuestbookMessage();

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { current_page: 1, total_page: 1, total_item: 0, current_item: 0 };
  const activeFilter = hasActiveUcapanFilter(filters);

  const handleFilterChange = (next: UcapanFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_UCAPAN_FILTERS);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Ucapan dihapus.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghapus ucapan."));
    }
  };

  const openDetail = (m: GuestbookMessage) => navigate(`/panel/ucapan/${m.id}`);

  const renderActions = (m: GuestbookMessage) => (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(m)} title="Lihat detail">
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => setDeleteTarget(m)}
        title="Hapus ucapan"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ucapan Tamu"
        description={
          <>
            Ucapan, foto, dan pesan suara dari buku tamu.
            {!isLoading && !isError && (
              <>
                {" "}
                <span className="text-foreground font-medium">{formatNumberID(pagination.total_item)}</span> ucapan
                {scope.isForced ? "" : ` · ${scope.label}`}
              </>
            )}
          </>
        }
      />

      <UcapanFilters value={filters} onChange={handleFilterChange} onReset={handleReset} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Gagal memuat ucapan" message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title={activeFilter ? "Tidak ada ucapan yang cocok dengan filter" : "Belum ada ucapan"}
          description={
            activeFilter ? "Coba ubah atau reset filter." : "Ucapan dari tamu akan muncul di sini setelah dikirim."
          }
          action={
            activeFilter ? (
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn("space-y-4", isFetching && "opacity-70 transition-opacity")}>
          {/* Tabel desktop */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
              <div className={isAdmin ? "col-span-2" : "col-span-3"}>Nama</div>
              <div className={isAdmin ? "col-span-3" : "col-span-4"}>Pesan</div>
              <div className="col-span-2">Media</div>
              {isAdmin && <div className="col-span-2">Event</div>}
              <div className="col-span-2">Waktu</div>
              <div className="col-span-1 text-right">Aksi</div>
            </div>
            {items.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => openDetail(m)}
                className={cn(
                  "grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-muted/50 transition-colors cursor-pointer",
                  idx !== 0 && "border-t",
                )}
              >
                <div className={cn("min-w-0", isAdmin ? "col-span-2" : "col-span-3")}>
                  <div className="font-medium truncate">{m.fullname}</div>
                  <div className="text-xs text-muted-foreground">#{m.id}</div>
                </div>
                <div className={cn("min-w-0 text-sm", isAdmin ? "col-span-3" : "col-span-4")}>
                  {m.message ? (
                    <span className="block truncate" title={m.message}>
                      {m.message}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground">—</span>
                  )}
                </div>
                <div className="col-span-2 min-w-0">
                  <MediaBadges message={m} />
                </div>
                {isAdmin && (
                  <div className="col-span-2 min-w-0">
                    <EventBadge message={m} />
                  </div>
                )}
                <div className="col-span-2 text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTimeID(m.created_at)}
                </div>
                <div className="col-span-1">{renderActions(m)}</div>
              </div>
            ))}
          </div>

          {/* Kartu mobile */}
          <div className="md:hidden space-y-3">
            {items.map((m) => (
              <div
                key={m.id}
                onClick={() => openDetail(m)}
                className="rounded-xl border bg-card p-4 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.fullname}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTimeID(m.created_at)}</div>
                  </div>
                  {renderActions(m)}
                </div>
                {m.message ? (
                  <p className="text-sm line-clamp-2">{m.message}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Tidak ada pesan tertulis</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <MediaBadges message={m} />
                  {isAdmin && <EventBadge message={m} />}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            limit={limit}
            pagination={pagination}
            limitOptions={LIMIT_OPTIONS}
            unitLabel="ucapan"
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Ucapan"
        description={
          <>
            Ucapan dari <b>{deleteTarget?.fullname}</b> beserta foto &amp; suaranya akan dihapus permanen.
          </>
        }
        confirmLabel="Hapus"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
