import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Filter, KeyRound, Pencil, Plus, Trash2, Users } from "lucide-react";
import type { Role, User } from "@/types/api";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useActiveEvents } from "@/domains/events/hooks/useEvents";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { PageHeader } from "@/shared/components/PageHeader";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { useDeleteUser, useUsers } from "../hooks/useUsers";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

type RoleFilter = "all" | Role;

function RoleBadge({ role }: { role: Role }) {
  return role === "admin" ? <Badge variant="default">Admin</Badge> : <Badge variant="outline">User</Badge>;
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? <Badge variant="success">Aktif</Badge> : <Badge variant="secondary">Nonaktif</Badge>;
}

export function UserList() {
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [eventId, setEventId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const hasActiveFilter = debouncedSearch !== "" || role !== "all" || eventId !== "";

  const params = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(role !== "all" && { role }),
    ...(eventId && { event_id: Number(eventId) }),
  };

  const { data, isLoading, isError, refetch } = useUsers(params);
  const { data: events = [] } = useActiveEvents();
  const deleteMut = useDeleteUser();

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { current_page: 1, total_page: 1, total_item: 0, current_item: 0 };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success("Pengguna dihapus.");
      setDeleteTarget(null);
    } catch {
      /* error sudah ditampilkan oleh apiClient */
    }
  };

  const resetFilter = () => {
    setSearch("");
    setRole("all");
    setEventId("");
    setPage(1);
  };

  const Actions = ({ row }: { row: User }) => {
    const isSelf = me?.id === row.id;
    return (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setResetTarget(row)}
          aria-label="Reset password"
          title="Reset password"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(`/panel/users/${row.id}/edit`)}
          aria-label="Edit pengguna"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => setDeleteTarget(row)}
          disabled={isSelf}
          aria-label="Hapus pengguna"
          title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengguna"
        description={
          <>
            Akun admin Kiwara dan akun pasangan.
            {!isLoading && !isError && <span className="ml-1">({pagination.total_item} pengguna)</span>}
          </>
        }
        actions={
          <Button onClick={() => navigate("/panel/users/new")}>
            <Plus className="h-4 w-4" />
            Tambah Pengguna
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="user-search" className="text-xs">
              Cari
            </Label>
            <Input
              id="user-search"
              placeholder="Cari nama atau email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v as RoleFilter);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Event</Label>
            <SearchableSelect
              value={eventId}
              onChange={(v) => {
                setEventId(v);
                setPage(1);
              }}
              options={events}
              getValue={(e) => e.id}
              getLabel={(e) => e.name}
              placeholder="Semua event"
              searchPlaceholder="Cari event…"
              emptyMessage="Event tidak ditemukan"
            />
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
        <ErrorState title="Gagal memuat pengguna" onRetry={() => void refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasActiveFilter ? "Tidak ada pengguna yang cocok" : "Belum ada pengguna"}
          description={hasActiveFilter ? "Coba ubah kata kunci atau filter." : "Tambahkan akun pasangan atau admin."}
          action={
            !hasActiveFilter ? (
              <Button variant="outline" onClick={() => navigate("/panel/users/new")}>
                <Plus className="h-4 w-4" />
                Tambah Pengguna
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
              <div className="col-span-2">Role</div>
              <div className="col-span-3">Event</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Aksi</div>
            </div>
            {items.map((row, idx) => (
              <div
                key={row.id}
                onClick={() => navigate(`/panel/users/${row.id}/edit`)}
                className={cn(
                  "grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-muted/50 transition-colors cursor-pointer",
                  idx !== 0 && "border-t",
                )}
              >
                <div className="col-span-4 min-w-0">
                  <div className="font-medium truncate">
                    {row.name}
                    {me?.id === row.id && <span className="ml-1.5 text-xs text-muted-foreground">(kamu)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{row.email}</div>
                </div>
                <div className="col-span-2">
                  <RoleBadge role={row.role} />
                </div>
                <div className="col-span-3 text-sm truncate">{row.event?.name ?? "—"}</div>
                <div className="col-span-2">
                  <StatusBadge active={row.is_active} />
                </div>
                <div className="col-span-1">
                  <Actions row={row} />
                </div>
              </div>
            ))}
          </div>

          {/* Kartu mobile */}
          <div className="md:hidden space-y-3">
            {items.map((row) => (
              <div
                key={row.id}
                onClick={() => navigate(`/panel/users/${row.id}/edit`)}
                className="rounded-xl border bg-card p-4 space-y-2 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{row.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{row.email}</div>
                  </div>
                  <StatusBadge active={row.is_active} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RoleBadge role={row.role} />
                  <span className="text-muted-foreground truncate">{row.event?.name ?? "—"}</span>
                </div>
                <div className="flex justify-end">
                  <Actions row={row} />
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            limit={limit}
            pagination={pagination}
            unitLabel="pengguna"
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      )}

      <ResetPasswordDialog user={resetTarget} onOpenChange={(open) => !open && setResetTarget(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Pengguna"
        description={
          <>
            Pengguna <b>{deleteTarget?.name}</b> tidak akan bisa masuk lagi.
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
