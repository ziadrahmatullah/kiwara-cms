import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { User } from "@/types/api";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { useResetUserPassword } from "../hooks/useUsers";

interface ResetPasswordDialogProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ user, onOpenChange }: ResetPasswordDialogProps) {
  const mut = useResetUserPassword();
  return (
    <Dialog open={Boolean(user)} onOpenChange={(v) => !mut.isPending && onOpenChange(v)}>
      <DialogContent className="max-w-sm">
        {/* key per pengguna: field kosong lagi setiap dialog dibuka untuk orang lain. */}
        {user && <ResetPasswordForm key={user.id} user={user} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordForm({ user, onOpenChange }: { user: User; onOpenChange: (open: boolean) => void }) {
  const mut = useResetUserPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    setError(null);
    try {
      await mut.mutateAsync({ id: user.id, payload: { new_password: password } });
      toast.success("Password direset.");
      onOpenChange(false);
    } catch {
      /* error sudah ditampilkan oleh apiClient */
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>Atur password baru untuk {user.name}.</DialogDescription>
      </DialogHeader>

      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="space-y-1.5">
        <Label htmlFor="reset-password">Password baru</Label>
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reset-confirm">Konfirmasi password</Label>
        <PasswordInput
          id="reset-confirm"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mut.isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={mut.isPending}>
          {mut.isPending && <Loader2 className="animate-spin" />}
          Simpan Password
        </Button>
      </DialogFooter>
    </form>
  );
}
