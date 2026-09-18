import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "@/shared/lib/queryClient";
import { ErrorBoundary, Layout, NotFound, ProtectedRoute, RequireRole } from "@/shared/components";
import { LoginPage } from "@/domains/auth";

function Placeholder({ name }: { name: string }) {
  return <div className="text-sm text-muted-foreground">{name} — segera hadir.</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/panel" element={<Layout />}>
              <Route
                index
                element={
                  <ErrorBoundary>
                    <Placeholder name="Dashboard" />
                  </ErrorBoundary>
                }
              />
              <Route path="gallery" element={<Placeholder name="Galeri" />} />
              <Route path="ucapan" element={<Placeholder name="Ucapan" />} />
              <Route path="ucapan/:id" element={<Placeholder name="Detail ucapan" />} />
              <Route element={<RequireRole roles={["admin"]} />}>
                <Route path="events" element={<Placeholder name="Event" />} />
                <Route path="events/new" element={<Placeholder name="Tambah event" />} />
                <Route path="events/:id/edit" element={<Placeholder name="Edit event" />} />
                <Route path="users" element={<Placeholder name="Pengguna" />} />
                <Route path="users/new" element={<Placeholder name="Tambah pengguna" />} />
                <Route path="users/:id/edit" element={<Placeholder name="Edit pengguna" />} />
              </Route>
              <Route path="settings/change-password" element={<Placeholder name="Ganti password" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
