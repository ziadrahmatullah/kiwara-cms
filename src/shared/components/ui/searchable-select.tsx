import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

interface SearchableSelectProps<T> {
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  options: T[];
  getValue: (opt: T) => string | number;
  getLabel: (opt: T) => string;
  renderOption?: (opt: T, selected: boolean) => ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  hideClear?: boolean;
  className?: string;
}

export function SearchableSelect<T>({
  value,
  onChange,
  options,
  getValue,
  getLabel,
  renderOption,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ada hasil",
  disabled = false,
  required = false,
  hideClear = false,
  className,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const current = value === null || value === undefined ? "" : String(value);
  const selected = options.find((opt) => String(getValue(opt)) === current);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => getLabel(opt).toLowerCase().includes(q));
  }, [options, search, getLabel]);

  const handleSelect = (opt: T) => {
    onChange(String(getValue(opt)));
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal h-9",
            !selected && "text-muted-foreground",
            required && !selected && "border-destructive",
            className,
          )}
        >
          <span className="truncate block">{selected ? getLabel(selected) : placeholder}</span>
          <span className="flex items-center gap-1 shrink-0">
            {selected && !disabled && !hideClear && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setSearch("");
                }}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-56 p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
            autoFocus
          />
        </div>
        <div className="max-h-60 overflow-auto">
          {filtered.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((opt) => {
                const isSelected = String(getValue(opt)) === current;
                return (
                  <div
                    key={String(getValue(opt))}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <span className="flex-1 truncate">
                      {renderOption ? renderOption(opt, isSelected) : getLabel(opt)}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
