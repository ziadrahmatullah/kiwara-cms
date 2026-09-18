import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { PageHeader } from "@/shared/components/PageHeader";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { useChangePassword } from "../hooks/useChangePassword";

export function ChangePasswordPage() {
  const user = useAuthStore((s) => s.user);
  const mut = useChangePassword();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirm("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setError("Masukkan password saat ini.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword === oldPassword) {
      setError("Password baru harus berbeda dari password saat ini.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    setError(null);
    try {
      await mut.mutateAsync({ old_password: oldPassword, new_password: newPassword });
      toast.success("Password berhasil diubah.");
      reset();
    } catch {
      /* error sudah ditampilkan oleh apiClient */
    }
  };

  const eventLabel = user?.role === "admin" ? "Semua event" : (user?.event?.name ?? "Tanpa event");

  return (
    <div className="space-y-6">
      <PageHeader title="Ganti Password" description="Perbarui password akun yang sedang kamu pakai." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Akun yang sedang masuk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent flex items-center justify-center h-12 w-12 text-sm font-bold uppercase select-none shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{user?.name ?? "Pengguna"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</div>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Role</dt>
                <dd>
                  {user?.role === "admin" ? <Badge variant="default">Admin</Badge> : <Badge variant="outline">User</Badge>}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Event</dt>
                <dd className="truncate text-right">{eventLabel}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Password Baru
            </CardTitle>
            <CardDescription>Minimal 8 karakter dan berbeda dari password saat ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
              <div className="space-y-1.5">
                <Label htmlFor="old-password">Password saat ini</Label>
                <PasswordInput
                  id="old-password"
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">Password baru</Label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Konfirmasi password baru</Label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" disabled={mut.isPending}>
                  {mut.isPending && <Loader2 className="animate-spin" />}
                  Simpan
                </Button>
                <Button type="button" variant="ghost" onClick={reset} disabled={mut.isPending}>
                  Kosongkan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
