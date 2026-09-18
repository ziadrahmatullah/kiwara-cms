import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Search, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { visibleNav } from "@/shared/config/navigation";
import { useUIStore } from "@/shared/store/useUIStore";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";

interface PaletteItem {
  id: string;
  label: string;
  section: string;
  icon: LucideIcon;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const isDark = useUIStore((s) => s.isDark);
  const toggleDark = useUIStore((s) => s.toggleDark);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo<PaletteItem[]>(() => {
    const nav = visibleNav(role).flatMap((s) =>
      s.items.map<PaletteItem>((i) => ({
        id: i.to,
        label: i.label,
        section: s.sectionLabel ?? "Menu",
        icon: i.icon,
        run: () => navigate(i.to),
      })),
    );
    nav.push({
      id: "theme",
      label: isDark ? "Mode Terang" : "Mode Gelap",
      section: "Tampilan",
      icon: isDark ? Sun : Moon,
      run: toggleDark,
    });
    return nav;
  }, [role, isDark, navigate, toggleDark]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.label.toLowerCase().includes(q) || i.section.toLowerCase().includes(q)) : items;
  }, [items, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const close = () => {
    setQuery("");
    setActive(0);
    onOpenChange(false);
  };

  const runItem = (item: PaletteItem) => {
    close();
    item.run();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden" hideClose>
        <DialogTitle className="sr-only">Cari halaman</DialogTitle>
        <div className="flex items-center gap-2 px-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(filtered.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter" && filtered[active]) {
                e.preventDefault();
                runItem(filtered[active]);
              }
            }}
            placeholder="Cari halaman…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex font-mono text-[10px] bg-muted border rounded px-1">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada hasil.</p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActive(idx)}
                onClick={() => runItem(item)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-left transition-colors",
                  idx === active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/60",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.section}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
