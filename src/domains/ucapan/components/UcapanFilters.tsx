import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { hasActiveUcapanFilter, type TriState, type UcapanFilterState } from "./ucapanFilterState";

interface UcapanFiltersProps {
  value: UcapanFilterState;
  onChange: (next: UcapanFilterState) => void;
  onReset: () => void;
}

export function UcapanFilters({ value, onChange, onReset }: UcapanFiltersProps) {
  const set = <K extends keyof UcapanFilterState>(key: K, v: UcapanFilterState[K]) => onChange({ ...value, [key]: v });
  const active = hasActiveUcapanFilter(value);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filter
        </div>
        {active && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ucapan-search" className="text-xs">
            Cari
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="ucapan-search"
              placeholder="Cari nama atau pesan…"
              value={value.search}
              onChange={(e) => set("search", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Foto</Label>
          <Select value={value.hasPhoto} onValueChange={(v) => set("hasPhoto", v as TriState)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="true">Dengan foto</SelectItem>
              <SelectItem value="false">Tanpa foto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Suara</Label>
          <Select value={value.hasVoice} onValueChange={(v) => set("hasVoice", v as TriState)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="true">Dengan suara</SelectItem>
              <SelectItem value="false">Tanpa suara</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ucapan-from" className="text-xs">
            Dari
          </Label>
          <Input
            id="ucapan-from"
            type="date"
            value={value.dateFrom}
            max={value.dateTo || undefined}
            onChange={(e) => set("dateFrom", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ucapan-to" className="text-xs">
            Sampai
          </Label>
          <Input
            id="ucapan-to"
            type="date"
            value={value.dateTo}
            min={value.dateFrom || undefined}
            onChange={(e) => set("dateTo", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
