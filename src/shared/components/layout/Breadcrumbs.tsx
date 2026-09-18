import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbs } from "@/shared/config/breadcrumbs";

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = buildBreadcrumbs(pathname);
  return (
    <nav className="flex items-center gap-1 text-sm flex-1 min-w-0" aria-label="Breadcrumb">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${idx}`} className="flex items-center gap-1 min-w-0">
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            {isLast ? (
              <span className="font-semibold text-foreground truncate">{crumb.label}</span>
            ) : crumb.to ? (
              <Link to={crumb.to} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-muted-foreground truncate hidden sm:inline">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
