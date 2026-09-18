import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldCheck, UserRound } from "lucide-react";
import type { Role, User, UserCreatePayload, UserUpdatePayload } from "@/types/api";
import { useActiveEvents } from "@/domains/events/hooks/useEvents";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { NotFound } from "@/shared/components/NotFound";
import { useCreateUser, useUpdateUser, useUser } from "../hooks/useUsers";

interface FormState {
  name: string;
  email: string;
  password: string;
  role: Role;
  event_id: number | null;
  is_active: boolean;
}

const EMPTY: FormState = { name: "", email: "", password: "", role: "user", event_id: null, is_active: true };

function toFormState(u: User | undefined): FormState {
  if (!u) return EMPTY;
  return {
    name: u.name ?? "",
    email: u.email ?? "",
    password: "",
    role: u.role,
    event_id: u.event_id ?? null,
    is_active: u.is_active,
  };
}

export function UserForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { data: existing, isLoading, isError } = useUser(id);

  if (isEdit && isError) {
    return (
      <NotFound
        title="Pengguna tidak ditemukan"
        description="Pengguna yang kamu buka tidak ada."
        backTo="/panel/users"
        backLabel="Kembali ke Pengguna"
      />
    );
  }

  // key memaksa remount saat data pengguna tiba, sehingga state awal diambil dari props tanpa effect.
  return (
    <UserFormBody
      key={existing ? `user-${existing.id}` : isEdit ? "loading" : "new"}
      id={id}
      isEdit={isEdit}
      loading={isEdit && isLoading}
      initial={toFormState(existing)}
    />
  );
}

interface UserFormBodyProps {
  id?: string;
  isEdit: boolean;
  loading: boolean;
  initial: FormState;
}

function UserFormBody({ id, isEdit, loading, initial }: UserFormBodyProps) {
  const navigate = useNavigate();
  const { data: events = [], isLoading: eventsLoading } = useActiveEvents();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const pending = createMut.isPending || updateMut.isPending;

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleRoleChange = (role: Role) => {
    setForm((f) => ({ ...f, role, event_id: role === "admin" ? null : f.event_id }));
    setErrors((e) => ({ ...e, role: undefined, event_id: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Nama wajib diisi.";
    if (!form.email.trim()) next.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Format email tidak valid.";
    if (!isEdit && form.password.length < 8) next.password = "Password minimal 8 karakter.";
    if (form.role === "user" && !form.event_id) next.event_id = "Pilih event untuk akun pasangan.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const base: UserUpdatePayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      event_id: form.role === "user" ? form.event_id : null,
      is_active: form.is_active,
    };
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload: base });
        toast.success("Pengguna diperbarui.");
      } else {
        const payload: UserCreatePayload = { ...base, password: form.password };
        await createMut.mutateAsync(payload);
        toast.success("Pengguna dibuat.");
      }
      navigate("/panel/users");
    } catch {
      /* error sudah ditampilkan oleh apiClient */
    }
  };

  const showSkeleton = loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/panel/users")} aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Pengguna" : "Tambah Pengguna"}</h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Perbarui akun dan hak aksesnya." : "Buat akun admin Kiwara atau akun pasangan."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/panel/users")} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" disabled={pending || showSkeleton}>
            {pending && <Loader2 className="animate-spin" />}
            Simpan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {showSkeleton ? (
            <div className="space-y-4">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus={!isEdit} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              {!isEdit && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Minimal 8 karakter.</p>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Akses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {showSkeleton ? (
            <div className="space-y-4">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => handleRoleChange(v as Role)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {form.role === "admin"
                      ? "Admin melihat semua event dan mengelola pengguna."
                      : "User hanya melihat ucapan & foto event miliknya."}
                  </p>
                </div>
                {form.role === "user" && (
                  <div className="space-y-1.5">
                    <Label>
                      Event <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelect
                      value={form.event_id}
                      onChange={(v) => set("event_id", v ? Number(v) : null)}
                      options={events}
                      getValue={(e) => e.id}
                      getLabel={(e) => e.name}
                      placeholder={eventsLoading ? "Memuat event…" : "Pilih event"}
                      searchPlaceholder="Cari event…"
                      emptyMessage="Event tidak ditemukan"
                      disabled={eventsLoading}
                      required
                      hideClear
                    />
                    {errors.event_id && <p className="text-xs text-destructive">{errors.event_id}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Switch id="is_active" checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Akun aktif</Label>
                  <p className="text-xs text-muted-foreground">Akun nonaktif tidak bisa masuk ke panel.</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
