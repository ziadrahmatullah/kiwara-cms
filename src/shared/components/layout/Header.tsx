import { useEffect, useState } from "react";
import { Calendar, Clock, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useUIStore } from "@/shared/store/useUIStore";
import { Breadcrumbs } from "./Breadcrumbs";
import { EventScopeSelector } from "./EventScopeSelector";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenPalette: () => void;
  onLogout: () => void;
}

export function Header({ onToggleSidebar, onOpenPalette, onLogout }: HeaderProps) {
  const isDark = useUIStore((s) => s.isDark);
  const toggleDark = useUIStore((s) => s.toggleDark);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const iconBtn =
    "p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0";

  return (
    <header className="h-16 border-b bg-card shrink-0 flex items-center px-4 md:px-6 gap-2 md:gap-4">
      <button onClick={onToggleSidebar} className={`md:hidden ${iconBtn}`} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </button>

      <Breadcrumbs />

      <EventScopeSelector />

      <div className="hidden md:block h-5 w-px bg-border shrink-0" />

      <div className="hidden md:flex items-center gap-4 text-muted-foreground shrink-0">
        <div className="hidden xl:flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">{dateStr}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{timeStr}</span>
        </div>
      </div>

      <div className="hidden md:block h-5 w-px bg-border shrink-0" />

      <button
        onClick={onOpenPalette}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        aria-label="Cari halaman"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden lg:inline">Cari…</span>
        <kbd className="hidden lg:inline-flex font-mono text-[10px] bg-background border rounded px-1">⌘K</kbd>
      </button>

      <button onClick={toggleDark} className={iconBtn} aria-label="Ganti tema">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <button onClick={onLogout} className={iconBtn} aria-label="Keluar" title="Keluar">
        <LogOut className="h-4 w-4" />
      </button>
    </header>
  );
}
