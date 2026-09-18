import {
  CalendarDays,
  Images,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/api";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  /** Cocok hanya bila path sama persis (dipakai Dashboard). */
  end?: boolean;
}

export interface NavSection {
  type: "main" | "section";
  sectionLabel?: string;
  items: NavItem[];
}

export const sideNavData: NavSection[] = [
  {
    type: "main",
    items: [{ to: "/panel", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    type: "section",
    sectionLabel: "Buku Tamu",
    items: [
      { to: "/panel/gallery", label: "Galeri Foto", icon: Images },
      { to: "/panel/ucapan", label: "Ucapan", icon: MessageSquareText },
    ],
  },
  {
    type: "section",
    sectionLabel: "Administrasi",
    items: [
      { to: "/panel/events", label: "Event", icon: CalendarDays, adminOnly: true },
      { to: "/panel/users", label: "Pengguna", icon: Users, adminOnly: true },
    ],
  },
  {
    type: "section",
    sectionLabel: "Akun",
    items: [{ to: "/panel/settings/change-password", label: "Ganti Password", icon: KeyRound }],
  },
];

export function visibleNav(role: Role | undefined): NavSection[] {
  return sideNavData
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.adminOnly || role === "admin") }))
    .filter((s) => s.items.length > 0);
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
}
