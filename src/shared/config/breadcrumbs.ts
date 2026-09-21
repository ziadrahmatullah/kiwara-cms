import { matchPath } from "react-router-dom";
import { sideNavData } from "./navigation";

export interface Crumb {
  label: string;
  to?: string;
}

/** Turunkan breadcrumb dari konfigurasi navigasi, tanpa daftar rute manual. */
export function buildBreadcrumbs(pathname: string): Crumb[] {
  for (const section of sideNavData) {
    for (const item of section.items) {
      const base: Crumb[] = section.sectionLabel ? [{ label: section.sectionLabel }] : [];
      if (matchPath({ path: item.to, end: true }, pathname)) return [...base, { label: item.label }];
      if (item.end) continue; // Dashboard: jangan tangkap /panel/<halaman-lain>
      if (matchPath(`${item.to}/new`, pathname)) {
        return [...base, { label: item.label, to: item.to }, { label: `Tambah ${item.label}` }];
      }
      if (matchPath(`${item.to}/:id/edit`, pathname)) {
        return [...base, { label: item.label, to: item.to }, { label: `Edit ${item.label}` }];
      }
      if (matchPath(`${item.to}/:id`, pathname)) {
        return [...base, { label: item.label, to: item.to }, { label: "Detail" }];
      }
    }
  }
  return [{ label: "Dashboard" }];
}
