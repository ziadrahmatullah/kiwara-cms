import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Aperture, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PasswordInput } from "@/shared/components/PasswordInput";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/panel" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email.trim(), password);
      navigate("/panel", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Aperture className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kiwara CMS</h1>
            <p className="text-sm text-muted-foreground">Masuk ke panel buku tamu & photobooth</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Memproses…
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">Kiwara Photobooth & Guestbook</p>
      </div>
    </div>
  );
}
