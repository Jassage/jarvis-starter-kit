"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Heart, Search, Check, CheckCheck, User } from "lucide-react";
import api from "@/lib/api";
import { photoUrl } from "@/lib/photo";
import { useAuthStore } from "@/store/auth.store";

interface Match {
  matchId: string;
  conversationId: string | null;
  matchedAt: string;
  unreadCount: number;
  user: {
    id: string;
    firstName: string;
    age: number | null;
    city: string | null;
    mainPhoto: string | null;
    isOnline: boolean;
    isVerified: boolean;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
    status: string;
  } | null;
}

function Avatar({ user, size = 12 }: { user: Match["user"]; size?: number }) {
  const px = size * 4;
  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center font-bold`}
      style={{ width: px, height: px, background: "#FBEAF0", color: "#993556", fontSize: px * 0.35 }}
    >
      {user.mainPhoto
        ? <img src={photoUrl(user.mainPhoto) ?? ""} alt="" className="w-full h-full object-cover" />
        : user.firstName[0]}
    </div>
  );
}

function StatusIcon({ status, isFromMe }: { status: string; isFromMe: boolean }) {
  if (!isFromMe) return null;
  if (status === "READ") return <CheckCheck size={13} className="text-blue-400 flex-shrink-0" />;
  if (status === "DELIVERED") return <CheckCheck size={13} className="text-gray-300 flex-shrink-0" />;
  return <Check size={13} className="text-gray-300 flex-shrink-0" />;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "maintenant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

export default function MatchesPage() {
  const { user: me } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/swipes/matches")
      .then((r) => setMatches(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return matches;
    const q = search.toLowerCase();
    return matches.filter((m) => m.user.firstName?.toLowerCase().includes(q));
  }, [matches, search]);

  const newMatches = filtered.filter((m) => !m.lastMessage);
  const conversations = filtered.filter((m) => m.lastMessage);

  if (loading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;

  if (matches.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">Pas encore de matchs</p>
        <p className="text-gray-400 text-sm mt-1">Continue à swiper pour trouver des profils compatibles</p>
        <Link href="/discover" className="btn-primary inline-block mt-4">Découvrir des profils</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-4 flex flex-col gap-4">
      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un match..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white shadow-sm text-sm"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-8">Aucun résultat pour &ldquo;{search}&rdquo;</p>
      )}

      {/* Nouveaux matchs */}
      {newMatches.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Nouveaux matchs ({newMatches.length})
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {newMatches.map((m) => (
              <div key={m.matchId} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <Link href={m.conversationId ? `/messages/${m.conversationId}` : "#"} className="relative">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center font-bold text-xl border-[2.5px]"
                    style={{ background: "#FBEAF0", color: "#993556", borderColor: "#D4537E" }}
                  >
                    {m.user.mainPhoto
                      ? <img src={photoUrl(m.user.mainPhoto) ?? ""} alt="" className="w-full h-full object-cover" />
                      : m.user.firstName[0]}
                  </div>
                  {m.user.isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                  )}
                </Link>
                <Link href={`/profile/${m.user.id}`} className="text-xs text-gray-500 hover:text-pink-500 transition-colors font-medium">
                  {m.user.firstName}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Conversations */}
      {conversations.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Conversations ({conversations.length})
          </h2>
          <div className="flex flex-col gap-2">
            {conversations.map((m) => (
              <div key={m.matchId} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                {/* Avatar cliquable → profil */}
                <Link href={`/profile/${m.user.id}`} className="relative flex-shrink-0">
                  <Avatar user={m.user} size={13} />
                  {m.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                  )}
                </Link>

                {/* Corps → conversation */}
                <Link
                  href={m.conversationId ? `/messages/${m.conversationId}` : "#"}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-semibold text-sm ${m.unreadCount > 0 ? "text-gray-900" : "text-gray-700"}`}>
                      {m.user.firstName}{m.user.age ? `, ${m.user.age}` : ""}
                      {m.user.isVerified && <span className="ml-1 text-blue-500 text-xs">✓</span>}
                    </span>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                      {timeAgo(m.lastMessage!.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusIcon status={m.lastMessage!.status} isFromMe={m.lastMessage!.isFromMe} />
                    <p className={`text-xs truncate flex-1 ${m.unreadCount > 0 ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                      {m.lastMessage!.isFromMe ? "Toi : " : ""}{m.lastMessage!.content}
                    </p>
                    {m.unreadCount > 0 && (
                      <span
                        className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1"
                        style={{ background: "#D4537E" }}
                      >
                        {m.unreadCount > 9 ? "9+" : m.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Bouton voir profil */}
                <Link
                  href={`/profile/${m.user.id}`}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-pink-50"
                  title="Voir le profil"
                >
                  <User size={16} className="text-gray-400" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
