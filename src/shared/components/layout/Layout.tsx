import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";
import { useMe } from "@/domains/auth/hooks/useMe";
import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { useUIStore } from "@/shared/store/useUIStore";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { CommandPalette } from "./CommandPalette";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, setSidebarOpen, toggleSidebar, initTheme } = useUIStore();
  const [showLogout, setShowLogout] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useMe();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Di layar kecil sidebar selalu mulai tertutup dan ditutup saat pindah halaman.
  const closeOnMobile = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, setSidebarOpen]);

  useEffect(() => {
    closeOnMobile();
  }, [location.pathname, closeOnMobile]);

  const sidebarWidth = isMobile ? 256 : sidebarOpen ? 256 : 64;
  const mainMarginLeft = isMobile ? 0 : sidebarOpen ? 256 : 64;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9] bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={showLogout}
        onOpenChange={setShowLogout}
        title="Konfirmasi Logout"
        description="Apakah kamu yakin ingin keluar?"
        confirmLabel="Ya, Logout"
        destructive
        onConfirm={handleLogout}
      />

      <Sidebar open={sidebarOpen} isMobile={isMobile} width={sidebarWidth} onToggle={toggleSidebar} />

      <motion.div
        animate={{ marginLeft: mainMarginLeft }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginLeft: mainMarginLeft }}
      >
        <Header
          onToggleSidebar={toggleSidebar}
          onOpenPalette={() => setPaletteOpen(true)}
          onLogout={() => setShowLogout(true)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div key={location.pathname} className="animate-in fade-in">
            <Outlet />
          </div>
        </main>
      </motion.div>
    </div>
  );
}
