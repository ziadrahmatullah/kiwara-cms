import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarDays, Filter, Pencil, Plus, Trash2 } from "lucide-react";
import type { Event } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatDateID } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { useDeleteEvent, useEvents } from "../hooks/useEvents";

type StatusFilter = "all" | "true" | "false";

function coupleLabel(ev: Event): string {
  const parts = [ev.bride_name, ev.groom_name].filter((v): v is string => Boolean(v && v.trim()));
  return parts.length ? parts.join(" & ") : "—";
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? <Badge variant="success">Aktif</Badge> : <Badge variant="secondary">Nonaktif</Badge>;
}

export function EventList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const hasActiveFilter = debouncedSearch !== "" || status !== "all";

  const params = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(status !== "all" && { is_active: status === "true" }),
  };

  const { data, isLoading, isError, refetch } = useEvents(params);
  const deleteMut = useDeleteEvent();

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { current_page: 1, total_page: 1, total_item: 0, current_item: 0 };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success("Event dihapus.");
      setDeleteTarget(null);
    } catch {
      /* error sudah ditampilkan oleh apiClient */
    }
  };

  const resetFilter = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const Actions = ({ ev }: { ev: Event }) => (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => navigate(`/panel/events/${ev.id}/edit`)}
        aria-label="Edit event"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => setDeleteTarget(ev)}
        aria-label="Hapus event"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event"
        description={
          <>
            Kelola event pernikahan yang memakai Kiwara.
            {!isLoading && !isError && <span className="ml-1">({pagination.total_item} event)</span>}
          </>
        }
        actions={
          <Button onClick={() => navigate("/panel/events/new")}>
            <Plus className="h-4 w-4" />
            Tambah Event
          </Button>
        }
      />

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filter
          </div>
          {hasActiveFilter && (
            <Button variant="ghost" size="sm" onClick={resetFilter}>
              Reset
            </Button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="event-search" className="text-xs">
              Cari
            </Label>
            <Input
              id="event-search"
              placeholder="Cari nama, slug, atau pasangan…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Gagal memuat event" onRetry={() => void refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={hasActiveFilter ? "Tidak ada event yang cocok" : "Belum ada event"}
          description={hasActiveFilter ? "Coba ubah kata kunci atau filter." : "Tambahkan event pernikahan pertama."}
          action={
            !hasActiveFilter ? (
              <Button variant="outline" onClick={() => navigate("/panel/events/new")}>
                <Plus className="h-4 w-4" />
                Tambah Event
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Tabel desktop */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Nama</div>
              <div className="col-span-3">Pasangan</div>
              <div className="col-span-2">Tanggal</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Aksi</div>
            </div>
            {items.map((ev, idx) => (
              <div
                key={ev.id}
                onClick={() => navigate(`/panel/events/${ev.id}/edit`)}
                className={cn(
                  "grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-muted/50 transition-colors cursor-pointer",
                  idx !== 0 && "border-t",
                )}
              >
                <div className="col-span-4 min-w-0">
                  <div className="font-medium truncate">{ev.name}</div>
                  <div className="font-mono text-xs text-muted-foreground truncate">{ev.slug}</div>
                </div>
                <div className="col-span-3 text-sm truncate">{coupleLabel(ev)}</div>
                <div className="col-span-2 text-sm text-muted-foreground">{formatDateID(ev.event_date)}</div>
                <div className="col-span-2">
                  <StatusBadge active={ev.is_active} />
                </div>
                <div className="col-span-1">
                  <Actions ev={ev} />
                </div>
              </div>
            ))}
          </div>

          {/* Kartu mobile */}
          <div className="md:hidden space-y-3">
            {items.map((ev) => (
              <div
                key={ev.id}
                onClick={() => navigate(`/panel/events/${ev.id}/edit`)}
                className="rounded-xl border bg-card p-4 space-y-2 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{ev.name}</div>
                    <div className="font-mono text-xs text-muted-foreground truncate">{ev.slug}</div>
                  </div>
                  <StatusBadge active={ev.is_active} />
                </div>
                <div className="text-sm">{coupleLabel(ev)}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatDateID(ev.event_date)}</span>
                  <Actions ev={ev} />
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            limit={limit}
            pagination={pagination}
            unitLabel="event"
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Event"
        description={
          <>
            Event <b>{deleteTarget?.name}</b> akan dihapus. Event yang masih punya pengguna, ucapan, atau foto tidak
            bisa dihapus.
          </>
        }
        confirmLabel="Hapus"
        destructive
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
