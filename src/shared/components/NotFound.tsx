import { useNavigate } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface NotFoundProps {
  title?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
}

export function NotFound({
  title = "Halaman tidak ditemukan",
  description = "Alamat yang kamu buka tidak tersedia.",
  backTo = "/panel",
  backLabel = "Kembali ke Dashboard",
}: NotFoundProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <SearchX className="h-10 w-10 text-muted-foreground/50" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" onClick={() => navigate(backTo)}>
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Button>
    </div>
  );
}
