import { Outlet, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import type { Role } from "@/types/api";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { Button } from "@/shared/components/ui/button";

export function RequireRole({ roles }: { roles: Role[] }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  if (user && roles.includes(user.role)) return <Outlet />;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Akses ditolak</h2>
        <p className="text-sm text-muted-foreground">Halaman ini hanya untuk admin Kiwara.</p>
      </div>
      <Button variant="outline" onClick={() => navigate("/panel")}>
        Ke Dashboard
      </Button>
    </div>
  );
}
