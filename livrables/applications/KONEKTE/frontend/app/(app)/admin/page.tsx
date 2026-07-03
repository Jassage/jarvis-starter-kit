"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, Heart, Flag, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  isReviewed: boolean;
  createdAt: string;
  reporter: { profile: { firstName: string } | null };
  reported: { id: string; profile: { firstName: string } | null };
}

interface Stats {
  totalUsers: number;
  totalMatches: number;
  totalMessages: number;
  pendingReports: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<"stats" | "reports">("stats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      if (!data.data?.isAdmin) {
        router.replace("/discover");
        return;
      }
      Promise.all([
        api.get("/admin/stats").catch(() => ({ data: { data: null } })),
        api.get("/admin/reports").catch(() => ({ data: { data: [] } })),
      ]).then(([statsRes, reportsRes]) => {
        setStats(statsRes.data.data);
        setReports(reportsRes.data.data ?? []);
      }).finally(() => setLoading(false));
    }).catch(() => router.replace("/discover"));
  }, [router]);

  const banUser = async (userId: string, name: string) => {
    if (!confirm(`Bannir ${name} ?`)) return;
    try {
      await api.post(`/admin/ban/${userId}`);
      toast.success(`${name} a été banni`);
    } catch {
      toast.error("Erreur lors du bannissement");
    }
  };

  const markReviewed = async (reportId: string) => {
    try {
      await api.patch(`/admin/reports/${reportId}/review`);
      setReports((r) => r.map((rep) => rep.id === reportId ? { ...rep, isReviewed: true } : rep));
      toast.success("Signalement marqué comme traité");
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center gap-2 py-1">
        <Shield size={20} style={{ color: "#D4537E" }} />
        <h1 className="text-lg font-bold text-gray-800">Administration</h1>
      </div>

      <div className="flex bg-white rounded-2xl p-1 shadow-sm gap-1">
        {(["stats", "reports"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: tab === t ? "#D4537E" : "transparent", color: tab === t ? "white" : "#9ca3af" }}>
            {t === "stats" ? "📊 Statistiques" : "🚨 Signalements"}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "Utilisateurs", value: stats?.totalUsers ?? "—", color: "#3b82f6" },
            { icon: Heart, label: "Matchs", value: stats?.totalMatches ?? "—", color: "#D4537E" },
            { icon: Flag, label: "Signalements", value: stats?.pendingReports ?? "—", color: "#f59e0b" },
            { icon: Shield, label: "En sécurité", value: "✓", color: "#22c55e" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <Icon size={28} className="mx-auto mb-2" style={{ color }} />
              <div className="text-2xl font-bold text-gray-800">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="flex flex-col gap-3">
          {reports.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Flag size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucun signalement en attente</p>
            </div>
          )}
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FBEAF0", color: "#993556" }}>
                    {r.reason.replace(/_/g, " ")}
                  </span>
                  <p className="text-sm text-gray-700 mt-2 font-medium">
                    Signalé : <strong>{r.reported.profile?.firstName ?? "Inconnu"}</strong>
                  </p>
                  <p className="text-xs text-gray-400">Par : {r.reporter.profile?.firstName ?? "Inconnu"}</p>
                  {r.description && <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{r.description}&rdquo;</p>}
                </div>
                {r.isReviewed && <CheckCircle size={18} className="text-green-400 flex-shrink-0" />}
              </div>
              {!r.isReviewed && (
                <div className="flex gap-2">
                  <button onClick={() => markReviewed(r.id)}
                    className="flex-1 text-sm py-1.5 rounded-xl border font-medium transition-colors hover:bg-gray-50"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                    Ignorer
                  </button>
                  <button onClick={() => banUser(r.reported.id, r.reported.profile?.firstName ?? "cet utilisateur")}
                    className="flex-1 text-sm py-1.5 rounded-xl font-medium flex items-center justify-center gap-1"
                    style={{ background: "#fee2e2", color: "#dc2626" }}>
                    <Ban size={14} /> Bannir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
