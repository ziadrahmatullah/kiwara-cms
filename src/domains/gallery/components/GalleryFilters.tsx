import { Filter, RotateCcw, Search } from "lucide-react";
import type { LinkedFilter } from "@/types/api";
import { hasActiveGalleryFilter, type GalleryFilterState } from "./galleryFilterState";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface GalleryFiltersProps {
  value: GalleryFilterState;
  onChange: (next: GalleryFilterState) => void;
  onReset: () => void;
}

export function GalleryFilters({ value, onChange, onReset }: GalleryFiltersProps) {
  const hasActive = hasActiveGalleryFilter(value);
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filter
        </div>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw /> Reset
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="gallery-search" className="text-xs">
            Nama tamu
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="gallery-search"
              placeholder="Cari nama tamu…"
              className="pl-8"
              value={value.search}
              onChange={(e) => onChange({ ...value, search: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tata letak</Label>
          <Select
            value={value.layout}
            onValueChange={(v) => onChange({ ...value, layout: v as GalleryFilterState["layout"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="single">1 Foto</SelectItem>
              <SelectItem value="strip">3 Foto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Keterhubungan</Label>
          <Select value={value.linked} onValueChange={(v) => onChange({ ...value, linked: v as LinkedFilter })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="linked">Terhubung ucapan</SelectItem>
              <SelectItem value="orphan">Belum terhubung</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
