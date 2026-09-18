import { Frame, Image as ImageIcon } from "lucide-react";
import { SegmentedControl } from "@/shared/components/ui/segmented";
import type { ViewMode } from "../types";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  size?: "sm" | "default";
}

export function ViewModeToggle({ value, onChange, size = "default" }: ViewModeToggleProps) {
  return (
    <SegmentedControl<ViewMode>
      value={value}
      onChange={onChange}
      size={size}
      options={[
        { value: "framed", label: "Bingkai", icon: <Frame /> },
        { value: "original", label: "Foto asli", icon: <ImageIcon /> },
      ]}
    />
  );
}
