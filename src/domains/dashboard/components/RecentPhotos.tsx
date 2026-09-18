import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Images } from "lucide-react";
import type { ScopeParams } from "@/types/api";
import { Lightbox, PhotoGrid, PhotoGridSkeleton, toLightboxImage, useGuestbookImages } from "@/domains/gallery";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const COLS = "grid-cols-2 sm:grid-cols-4 lg:grid-cols-4";

export function RecentPhotos({ scopeParams }: { scopeParams: ScopeParams }) {
  const navigate = useNavigate();
  const { data, isLoading } = useGuestbookImages({ page: 1, limit: 8, ...scopeParams });
  const images = useMemo(() => (data?.items ?? []).map(toLightboxImage), [data]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Foto terbaru</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/panel/gallery">
            Buka galeri <ArrowRight />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {isLoading ? (
          <PhotoGridSkeleton count={8} className={COLS} />
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 text-center">
            <Images className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm">Belum ada foto.</p>
          </div>
        ) : (
          <PhotoGrid
            images={images}
            mode="framed"
            className={COLS}
            onOpen={setOpenIndex}
            onViewMessage={(img) => img.guest && navigate(`/panel/ucapan/${img.guest.id}`)}
          />
        )}
        <Lightbox
          images={images}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          initialTab="framed"
          getMessageLink={(img) => (img.guest ? `/panel/ucapan/${img.guest.id}` : null)}
        />
      </CardContent>
    </Card>
  );
}
