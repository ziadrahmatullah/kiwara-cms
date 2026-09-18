import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatNumberID } from "@/shared/lib/format";

interface StatTileProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  /** Baris kecil di bawah nilai, mis. "12 belum terhubung". */
  hint?: string;
  loading?: boolean;
}

export function StatTile({ label, value, icon: Icon, hint, loading }: StatTileProps) {
  return (
    <Card>
      <CardContent className="pt-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1 rounded-md" />
          ) : (
            <p className="text-2xl font-semibold leading-tight">{formatNumberID(value)}</p>
          )}
          {hint && !loading && <p className="text-xs text-muted-foreground mt-0.5 truncate">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
