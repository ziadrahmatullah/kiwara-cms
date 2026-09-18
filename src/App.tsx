import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "@/shared/lib/queryClient";
import { ErrorBoundary, Layout, NotFound, ProtectedRoute, RequireRole } from "@/shared/components";
import { LoginPage } from "@/domains/auth";
import { Dashboard } from "@/domains/dashboard";
import { GalleryList } from "@/domains/gallery";
import { EventForm, EventList } from "@/domains/events";
import { UserForm, UserList } from "@/domains/users";
import { ChangePasswordPage } from "@/domains/settings";
import { UcapanDetail, UcapanList } from "@/domains/ucapan";

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
                    <Dashboard />
                  </ErrorBoundary>
                }
              />
              <Route path="gallery" element={<GalleryList />} />
              <Route path="ucapan" element={<UcapanList />} />
              <Route path="ucapan/:id" element={<UcapanDetail />} />
              <Route element={<RequireRole roles={["admin"]} />}>
                <Route path="events" element={<EventList />} />
                <Route path="events/new" element={<EventForm />} />
                <Route path="events/:id/edit" element={<EventForm />} />
                <Route path="users" element={<UserList />} />
                <Route path="users/new" element={<UserForm />} />
                <Route path="users/:id/edit" element={<UserForm />} />
              </Route>
              <Route path="settings/change-password" element={<ChangePasswordPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
