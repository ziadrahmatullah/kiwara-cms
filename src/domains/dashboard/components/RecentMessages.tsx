import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareText } from "lucide-react";
import type { ScopeParams } from "@/types/api";
import { MediaBadges, useGuestbookMessages } from "@/domains/ucapan";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatDateTimeID } from "@/shared/lib/format";

export function RecentMessages({ scopeParams }: { scopeParams: ScopeParams }) {
  const { data, isLoading } = useGuestbookMessages({ page: 1, limit: 5, ...scopeParams });
  const items = data?.items ?? [];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Ucapan terbaru</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/panel/ucapan">
            Lihat semua <ArrowRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 text-center">
            <MessageSquareText className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm">Belum ada ucapan.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/panel/ucapan/${m.id}`}
                  className="flex items-start gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{m.fullname}</p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDateTimeID(m.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {m.message ? m.message : <span className="italic">Tanpa pesan tertulis</span>}
                    </p>
                    <div className="mt-1.5">
                      <MediaBadges message={m} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
