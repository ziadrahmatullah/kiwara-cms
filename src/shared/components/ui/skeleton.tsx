import type * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-xl bg-muted animate-pulse", className)} {...props} />;
}

export { Skeleton };
