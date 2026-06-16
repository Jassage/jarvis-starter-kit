"use client";
import { useEffect, useState } from "react";
import { Heart, Star, Lock } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { photoUrl } from "@/lib/photo";

interface LikeItem {
  swipeId: string;
  action: "LIKE" | "SUPER_LIKE";
  createdAt: string;
  user: { id: string; firstName: string; age: number | null; city: string | null; mainPhoto: string | null };
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return "À l'instant";
  if (d < 3600) return `Il y a ${Math.floor(d / 60)} min`;
  if (d < 86400) return `Il y a ${Math.floor(d / 3600)} h`;
  return `Il y a ${Math.floor(d / 86400)} j`;
}

export default function LikesPage() {
  const { user } = useAuthStore();
  const isPremium = user?.subscriptionPlan !== "FREE";
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/swipes/likes-received")
      .then((r) => setLikes(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Heart size={36} className="animate-pulse" style={{ color: "#D4537E" }} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Qui m&apos;a liké</h2>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: likes.length > 0 ? "#D4537E" : "#e5e7eb", color: likes.length > 0 ? "white" : "#9ca3af" }}
        >
          {likes.length}
        </span>
      </div>

      {!isPremium && likes.length > 0 && (
        <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #FBEAF0, #f3d6e4)" }}>
          <Lock size={24} className="mx-auto mb-2" style={{ color: "#D4537E" }} />
          <p className="font-bold text-sm" style={{ color: "#993556" }}>Passe Premium pour voir qui t&apos;a liké</p>
          <p className="text-xs text-pink-400 mt-1 mb-3">{likes.length} personne(s) t&apos;ont liké</p>
          <button
            className="text-sm font-bold px-5 py-2 rounded-full text-white"
            style={{ background: "#D4537E" }}
          >
            ✨ Débloquer Premium
          </button>
        </div>
      )}

      {likes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <Heart size={48} className="text-gray-200" />
          <p className="text-gray-500 font-semibold">Personne ne t&apos;a encore liké</p>
          <p className="text-gray-400 text-sm">Continue à swiper pour augmenter ta visibilité</p>
          <Link href="/discover" className="btn-primary mt-2">Découvrir des profils</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {likes.map((like) => {
            const photo = photoUrl(like.user.mainPhoto);
            return (
              <div
                key={like.swipeId}
                className="relative rounded-2xl overflow-hidden"
                style={{ height: 200, background: "#FBEAF0" }}
              >
                {isPremium && photo ? (
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : photo ? (
                  <div className="relative w-full h-full">
                    <img src={photo} alt="" className="w-full h-full object-cover" style={{ filter: "blur(18px)", transform: "scale(1.1)" }} />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-black" style={{ color: "#D4537E", opacity: 0.3 }}>
                    {like.user.firstName[0]}
                  </div>
                )}

                {like.action === "SUPER_LIKE" && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <Star size={14} className="text-white" fill="white" />
                  </div>
                )}

                <div
                  className="absolute bottom-0 left-0 right-0 px-3 py-2"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
                >
                  {isPremium ? (
                    <Link href={`/profile/${like.user.id}`}>
                      <p className="text-white text-sm font-bold truncate">{like.user.firstName}{like.user.age ? `, ${like.user.age}` : ""}</p>
                      <p className="text-white/70 text-[10px]">{timeAgo(like.createdAt)}</p>
                    </Link>
                  ) : (
                    <>
                      <p className="text-white text-sm font-bold">••••••</p>
                      <p className="text-white/70 text-[10px]">{timeAgo(like.createdAt)}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
