import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Aperture, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { isNavItemActive, visibleNav, type NavItem as NavItemType } from "@/shared/config/navigation";

interface SidebarProps {
  open: boolean;
  isMobile: boolean;
  width: number;
  onToggle: () => void;
}

function NavItem({ item, isActive, collapsed }: { item: NavItemType; isActive: boolean; collapsed: boolean }) {
  return (
    <Link
      to={item.to}
      title={item.label}
      className={cn(
        "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
        collapsed ? "p-2 justify-center" : "px-3 py-2",
        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function Sidebar({ open, isMobile, width, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const sections = visibleNav(user?.role);
  const collapsed = !open && !isMobile;

  return (
    <motion.aside
      animate={{ width, x: isMobile && !open ? -width : 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="border-r bg-card fixed inset-y-0 left-0 z-10 overflow-hidden flex flex-col"
      style={{ width }}
    >
      <div className={cn("h-16 px-4 border-b flex items-center shrink-0", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed ? (
          <>
            <Link to="/panel" className="flex items-center gap-2 overflow-hidden">
              <span className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Aperture className="h-4 w-4" />
              </span>
              <span className="font-bold text-lg whitespace-nowrap">Kiwara CMS</span>
            </Link>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Tutup sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Buka sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-3 space-y-1", collapsed ? "px-2" : "px-3")}>
        {sections.map((section, sIdx) =>
          section.type === "main" ? (
            section.items.map((item) => (
              <NavItem key={item.to} item={item} isActive={isNavItemActive(item, pathname)} collapsed={collapsed} />
            ))
          ) : (
            <div key={section.sectionLabel ?? sIdx} className={cn("mt-4", collapsed && "mt-3")}>
              {!collapsed ? (
                <div className="text-xs font-semibold px-2 mb-2 text-muted-foreground tracking-wider">
                  {section.sectionLabel}
                </div>
              ) : (
                <div className="border-t border-border mx-1 mb-2" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.to} item={item} isActive={isNavItemActive(item, pathname)} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ),
        )}
      </nav>

      <div className={cn("border-t p-3 shrink-0", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="rounded-full bg-accent flex items-center justify-center h-9 w-9 text-xs font-bold uppercase select-none shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">{user?.name ?? "Pengguna"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</span>
            </div>
          </div>
        ) : (
          <div
            className="rounded-full bg-accent flex items-center justify-center h-9 w-9 text-xs font-bold uppercase select-none"
            title={user?.name}
          >
            {getInitials(user?.name)}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
