import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Pagination as PaginationInfo } from "@/types/api";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { formatNumberID } from "@/shared/lib/format";

interface PaginationProps {
  page: number;
  limit: number;
  pagination: PaginationInfo;
  limitOptions?: number[];
  unitLabel?: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  page,
  limit,
  pagination,
  limitOptions = [10, 25, 50, 100],
  unitLabel = "data",
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPage = Math.max(1, pagination.total_page);
  const total = pagination.total_item;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(total, (page - 1) * limit + pagination.current_item);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Menampilkan {formatNumberID(start)}–{formatNumberID(end)} dari {formatNumberID(total)} {unitLabel}
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={String(limit)}
          onValueChange={(v) => {
            onLimitChange(Number(v));
            onPageChange(1);
          }}
        >
          <SelectTrigger className="w-20 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-2 whitespace-nowrap">
          Halaman {page} dari {totalPage}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(Math.min(totalPage, page + 1))}
          disabled={page >= totalPage}
          aria-label="Halaman berikutnya"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
