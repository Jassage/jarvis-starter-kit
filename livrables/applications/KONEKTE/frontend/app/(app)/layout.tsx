import BottomNav from "@/components/layout/BottomNav";
import AuthGuard from "@/components/layout/AuthGuard";
import NotificationBell from "@/components/layout/NotificationBell";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="fixed inset-0 flex flex-col bg-gray-50">
        {/* Header fixe */}
        <header className="flex-none z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: "#D4537E" }}>❤ Konekte</span>
          <div className="flex items-center gap-1">
            <Link href="/premium" className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full mr-1" style={{ background: "#FBEAF0", color: "#D4537E" }}>
              ✨ Premium
            </Link>
            <NotificationBell />
          </div>
        </header>

        {/* Zone de contenu scrollable */}
        <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {children}
        </main>

        {/* BottomNav fixe */}
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
