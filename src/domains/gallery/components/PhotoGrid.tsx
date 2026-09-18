import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { LightboxImage, ViewMode } from "../types";
import { PhotoCard } from "./PhotoCard";

const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 grid-flow-dense";

interface PhotoGridProps {
  images: LightboxImage[];
  mode: ViewMode;
  onOpen: (index: number) => void;
  onDelete?: (img: LightboxImage) => void;
  onViewMessage?: (img: LightboxImage) => void;
  showGuest?: boolean;
  className?: string;
}

/**
 * Grid foto. Mode bingkai: kartu single persegi, kartu strip 3 foto memanjang
 * (row-span-2) agar komposit terlihat utuh. Mode asli: semua persegi.
 */
export function PhotoGrid({ images, mode, onOpen, onDelete, onViewMessage, showGuest = true, className }: PhotoGridProps) {
  return (
    <div className={cn(GRID, className)}>
      {images.map((img, idx) => {
        const tall = mode === "framed" && img.layout === "strip";
        return (
          <div key={img.id} className={cn(tall ? "row-span-2 aspect-[1/2] self-stretch min-h-0" : "aspect-square")}>
            <PhotoCard
              image={img}
              mode={mode}
              showGuest={showGuest}
              onOpen={() => onOpen(idx)}
              onDelete={onDelete ? () => onDelete(img) : undefined}
              onViewMessage={onViewMessage ? () => onViewMessage(img) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

export function PhotoGridSkeleton({ count = 12, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(GRID, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  );
}
