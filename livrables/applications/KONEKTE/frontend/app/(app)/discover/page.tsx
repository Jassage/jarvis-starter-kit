"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Heart, MapPin, RotateCcw, SlidersHorizontal, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";
import SwipeCard from "@/components/cards/SwipeCard";

interface Profile {
  userId: string;
  firstName: string;
  age: number;
  city: string;
  bio: string | null;
  occupation: string | null;
  mainPhoto: string | null;
  isVerified: boolean;
  isOnline: boolean;
  compatibility: number;
  commonInterests: string[];
  prompt1: { q: string; a: string } | null;
  interests: string[];
  distanceKm?: number | null;
}

interface Filters {
  minAge: number;
  maxAge: number;
  gender: string;
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchName, setMatchName] = useState("");
  const [locating, setLocating] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({ minAge: 18, maxAge: 50, gender: "" });
  const [pendingFilters, setPendingFilters] = useState<Filters>({ minAge: 18, maxAge: 50, gender: "" });
  const [profileComplete, setProfileComplete] = useState<number | null>(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [superLikesLeft, setSuperLikesLeft] = useState<number>(3);
  const currentRef = useRef(current);
  currentRef.current = current;

  const buildQuery = useCallback((f: Filters, p: number) => {
    const params = new URLSearchParams({
      page: String(p),
      limit: "10",
      minAge: String(f.minAge),
      maxAge: String(f.maxAge),
    });
    if (f.gender) params.set("gender", f.gender);
    return `/discover?${params}`;
  }, []);

  const fetchProfiles = useCallback(async (p: number, append = false, f = filters) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await api.get(buildQuery(f, p));
      const newProfiles: Profile[] = data.data;
      if (append) setProfiles((prev) => [...prev, ...newProfiles]);
      else { setProfiles(newProfiles); setCurrent(0); }
      setHasMore(newProfiles.length === 10);
    } catch {
      toast.error("Impossible de charger les profils");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQuery, filters]);

  useEffect(() => {
    fetchProfiles(1);
    api.get("/profiles/me").then((r) => setProfileComplete(r.data.data?.profileComplete ?? 100)).catch(() => {});
    api.get("/swipes/super-likes-remaining").then((r) => setSuperLikesLeft(r.data.data?.remaining ?? 3)).catch(() => {});
  }, []);

  useEffect(() => {
    if (hasMore && !loadingMore && profiles.length - current <= 3) {
      const next = page + 1;
      setPage(next);
      fetchProfiles(next, true);
    }
  }, [current, profiles.length, hasMore, loadingMore, page, fetchProfiles]);

  const applyFilters = () => {
    setFilters(pendingFilters);
    setShowFilters(false);
    setPage(1);
    setHasMore(true);
    fetchProfiles(1, false, pendingFilters);
  };

  const shareLocation = () => {
    if (!navigator.geolocation) { toast.error("Géolocalisation non supportée"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.put("/profiles/me", { latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          toast.success("Position mise à jour !");
        } catch {
          toast.error("Erreur de mise à jour");
        } finally { setLocating(false); }
      },
      () => { toast.error("Permission refusée"); setLocating(false); }
    );
  };

  const handleSwipe = async (action: "LIKE" | "PASS" | "SUPER_LIKE") => {
    const profile = profiles[current];
    if (!profile) return;
    try {
      const res = await api.post("/swipes", { receiverId: profile.userId, action });
      if (res.data.data.isMatch) { setMatchName(profile.firstName); setShowMatch(true); }
      if (action === "SUPER_LIKE") setSuperLikesLeft((n) => Math.max(0, n - 1));
    } catch {
      toast.error("Erreur lors du swipe");
    }
    setCurrent((c) => c + 1);
  };

  const handleUndo = async () => {
    if (undoing || current === 0) return;
    setUndoing(true);
    try {
      const res = await api.delete("/swipes/undo");
      const name = res.data.data?.firstName ?? "ce profil";
      toast.success(`Swipe annulé sur ${name}`);
      setCurrent((c) => c - 1);
    } catch {
      toast.error("Impossible d'annuler");
    } finally {
      setUndoing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Heart size={40} className="mx-auto mb-3 animate-pulse" style={{ color: "#D4537E" }} />
          <p className="text-gray-400">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  const remaining = profiles.slice(current, current + 3);

  if (remaining.length === 0 && !loadingMore) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <Heart size={48} className="text-gray-200" />
        <p className="text-gray-500 text-lg font-semibold">Plus de profils pour l&apos;instant</p>
        <p className="text-gray-400 text-sm">Reviens plus tard ou élargis tes critères</p>
        <button className="btn-primary" onClick={() => { setPage(1); setHasMore(true); fetchProfiles(1); }}>
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 flex flex-col items-center">
      {/* Match popup */}
      {showMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setShowMatch(false)}>
          <div className="bg-white rounded-3xl p-8 text-center max-w-xs mx-4 shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#D4537E" }}>C&apos;est un match !</h2>
            <p className="text-gray-500 mb-1">Toi et <strong>{matchName}</strong></p>
            <p className="text-gray-400 text-sm mb-6">vous vous êtes likés mutuellement</p>
            <div className="flex flex-col gap-2">
              <Link href="/matches" className="btn-primary block">Envoyer un message</Link>
              <button className="btn-outline" onClick={() => setShowMatch(false)}>Continuer à swiper</button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau filtres */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setShowFilters(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Filtres</h3>
              <button onClick={() => setShowFilters(false)}><X size={22} className="text-gray-400" /></button>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-600">Tranche d&apos;âge</span>
                <span className="font-bold" style={{ color: "#D4537E" }}>{pendingFilters.minAge} – {pendingFilters.maxAge} ans</span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-xs text-gray-400">18</span>
                <input type="range" min={18} max={pendingFilters.maxAge - 1} value={pendingFilters.minAge}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, minAge: +e.target.value }))}
                  className="flex-1 accent-pink-500" />
                <input type="range" min={pendingFilters.minAge + 1} max={80} value={pendingFilters.maxAge}
                  onChange={(e) => setPendingFilters((f) => ({ ...f, maxAge: +e.target.value }))}
                  className="flex-1 accent-pink-500" />
                <span className="text-xs text-gray-400">80</span>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-600 text-sm mb-2">Je cherche</p>
              <div className="flex gap-2">
                {[{ v: "", l: "Tout le monde" }, { v: "FEMME", l: "Femmes" }, { v: "HOMME", l: "Hommes" }, { v: "AUTRE", l: "Autre" }].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setPendingFilters((f) => ({ ...f, gender: v }))}
                    className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                    style={{
                      background: pendingFilters.gender === v ? "#D4537E" : "white",
                      color: pendingFilters.gender === v ? "white" : "#6b7280",
                      borderColor: pendingFilters.gender === v ? "#D4537E" : "#e5e7eb",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={applyFilters} className="btn-primary w-full">Appliquer</button>
          </div>
        </div>
      )}

      {/* Bannière complétion de profil */}
      {profileComplete !== null && profileComplete < 60 && !dismissedBanner && (
        <div className="w-full max-w-sm mb-3 rounded-2xl p-3.5 flex items-center gap-3" style={{ background: "#FBEAF0" }}>
          <AlertCircle size={18} style={{ color: "#D4537E", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#993556" }}>Profil à {profileComplete}%</p>
            <p className="text-xs text-pink-400">Complète-le pour plus de visibilité</p>
          </div>
          <Link href="/profile" className="text-xs font-bold px-3 py-1.5 rounded-full text-white flex-shrink-0" style={{ background: "#D4537E" }}>
            Compléter
          </Link>
          <button onClick={() => setDismissedBanner(true)} className="text-pink-300 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Barre du haut */}
      <div className="w-full max-w-sm flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-400">{profiles.length - current} profil(s)</p>
          {current > 0 && (
            <button
              onClick={handleUndo}
              disabled={undoing}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border font-medium transition-colors"
              style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
              title="Annuler le dernier swipe"
            >
              <RotateCcw size={12} className={undoing ? "animate-spin" : ""} />
              Annuler
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPendingFilters(filters); setShowFilters(true); }}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
            style={{ borderColor: "#D4537E", color: "#D4537E" }}
          >
            <SlidersHorizontal size={13} />
            Filtres
          </button>
          <button
            onClick={shareLocation}
            disabled={locating}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
            style={{ borderColor: "#D4537E", color: "#D4537E" }}
          >
            <MapPin size={13} />
            {locating ? "..." : "Moi"}
          </button>
        </div>
      </div>

      {/* Cartes */}
      <div className="relative w-full max-w-sm" style={{ height: remaining[0] ? 700 : 480 }}>
        {loadingMore && remaining.length === 0 && (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <Heart size={28} className="animate-pulse" style={{ color: "#D4537E" }} />
          </div>
        )}
        {[...remaining].reverse().map((profile, revIdx) => {
          const idx = remaining.length - 1 - revIdx;
          const isTop = idx === 0;
          return (
            <SwipeCard
              key={profile.userId}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={isTop}
              zIndex={remaining.length - idx}
              offsetY={isTop ? 0 : idx * 10}
              scale={isTop ? 1 : 1 - idx * 0.04}
              superLikesLeft={superLikesLeft}
            />
          );
        })}
      </div>
    </div>
  );
}
