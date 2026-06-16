"use client";
import { useRef, useState } from "react";
import { Heart, X, Star, MapPin, Briefcase, Info } from "lucide-react";
import Link from "next/link";
import { photoUrl } from "@/lib/photo";

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

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (action: "LIKE" | "PASS" | "SUPER_LIKE") => void;
  isTop: boolean;
  zIndex: number;
  offsetY: number;
  scale: number;
  superLikesLeft?: number;
}

export default function SwipeCard({ profile, onSwipe, isTop, zIndex, offsetY, scale, superLikesLeft = 3 }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, rotate: 0 });
  const [indicator, setIndicator] = useState<"like" | "pass" | null>(null);
  const [leaving, setLeaving] = useState<"left" | "right" | "up" | null>(null);

  const THRESHOLD = 100;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    startX.current = e.clientX - drag.x;
    startY.current = e.clientY - drag.y;
    try { cardRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isTop || !cardRef.current?.hasPointerCapture(e.pointerId)) return;
    const x = e.clientX - startX.current;
    const y = e.clientY - startY.current;
    const rotate = x * 0.06;
    setDrag({ x, y, rotate });
    if (x > 40) setIndicator("like");
    else if (x < -40) setIndicator("pass");
    else setIndicator(null);
  };

  const onPointerUp = () => {
    if (!isTop) return;
    if (drag.x > THRESHOLD) flyOut("right");
    else if (drag.x < -THRESHOLD) flyOut("left");
    else {
      setDrag({ x: 0, y: 0, rotate: 0 });
      setIndicator(null);
    }
  };

  const flyOut = (dir: "left" | "right" | "up") => {
    setLeaving(dir);
    if (dir === "right") setDrag({ x: 700, y: drag.y, rotate: 25 });
    else if (dir === "left") setDrag({ x: -700, y: drag.y, rotate: -25 });
    else setDrag({ x: 0, y: -700, rotate: 0 });
    setIndicator(null);
    const action = dir === "right" ? "LIKE" : dir === "left" ? "PASS" : "SUPER_LIKE";
    setTimeout(() => onSwipe(action), 350);
  };

  const handleButton = (action: "LIKE" | "PASS" | "SUPER_LIKE") => {
    if (!isTop) return;
    if (action === "LIKE") flyOut("right");
    else if (action === "PASS") flyOut("left");
    else flyOut("up");
  };

  const photo = photoUrl(profile.mainPhoto);
  const transition = leaving
    ? "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease-out"
    : drag.x === 0 && drag.y === 0
    ? "transform 0.25s ease-out"
    : "none";

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        zIndex,
        transform: isTop
          ? `translate(${drag.x}px, ${drag.y}px) rotate(${drag.rotate}deg)`
          : `translateY(${offsetY}px) scale(${scale})`,
        transition,
        opacity: leaving ? 0 : 1,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* Carte principale */}
      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          height: 460,
          boxShadow: isTop
            ? "0 20px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.12)"
            : "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        {/* Photo ou avatar */}
        {photo ? (
          <img
            src={photo}
            alt={profile.firstName}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              background: "linear-gradient(135deg, #FBEAF0 0%, #f3d6e4 50%, #e8b4c8 100%)",
            }}
          >
            <span className="text-9xl font-black" style={{ color: "#993556", opacity: 0.35 }}>
              {profile.firstName[0]}
            </span>
          </div>
        )}

        {/* Overlay gradient du bas */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            padding: "24px 20px 20px",
          }}
        >
          {/* Nom + statut */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-white text-2xl font-bold tracking-tight">
              {profile.firstName}, {profile.age}
            </h2>
            {profile.isVerified && (
              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
            )}
            {profile.isOnline && (
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
            )}
          </div>

          {/* Ville + distance */}
          <div className="flex items-center gap-1 text-white/75 text-sm mb-1">
            <MapPin size={13} />
            <span>{profile.city}</span>
            {profile.distanceKm != null && (
              <span className="text-white/50 text-xs ml-1">· {profile.distanceKm} km</span>
            )}
          </div>

          {/* Occupation */}
          {profile.occupation && (
            <div className="flex items-center gap-1 text-white/65 text-xs mb-2">
              <Briefcase size={11} />
              <span>{profile.occupation}</span>
            </div>
          )}

          {/* Badge compatibilité */}
          <div className="flex items-center justify-between mt-1">
            {profile.compatibility > 0 ? (
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: "rgba(52,211,153,0.85)", color: "white" }}
              >
                ✨ {profile.compatibility}% compatible
              </span>
            ) : <span />}
            <Link
              href={`/profile/${profile.userId}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
            >
              <Info size={16} className="text-white" />
            </Link>
          </div>
        </div>

        {/* Indicateurs de swipe */}
        {indicator === "like" && (
          <div
            className="absolute top-10 left-6 border-[3px] border-green-400 rounded-2xl px-4 py-2"
            style={{ transform: "rotate(-18deg)", background: "rgba(0,0,0,0.15)" }}
          >
            <span className="text-green-400 text-2xl font-black tracking-widest drop-shadow">LIKE</span>
          </div>
        )}
        {indicator === "pass" && (
          <div
            className="absolute top-10 right-6 border-[3px] border-red-400 rounded-2xl px-4 py-2"
            style={{ transform: "rotate(18deg)", background: "rgba(0,0,0,0.15)" }}
          >
            <span className="text-red-400 text-2xl font-black tracking-widest drop-shadow">NOPE</span>
          </div>
        )}
      </div>

      {/* Contenu sous la carte (seulement pour la carte du dessus) */}
      {isTop && (
        <div className="mt-3 flex flex-col gap-2">
          {profile.bio && (
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.prompt1 && (
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wide">{profile.prompt1.q}</p>
              <p className="text-sm text-gray-700 italic">&ldquo;{profile.prompt1.a}&rdquo;</p>
            </div>
          )}

          {profile.commonInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.commonInterests.map((i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: "#FBEAF0", color: "#993556" }}
                >
                  {i}
                </span>
              ))}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-center gap-5 mt-2 pb-2">
            <button
              onClick={() => handleButton("PASS")}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ boxShadow: "0 4px 16px rgba(239,68,68,0.25), 0 2px 6px rgba(0,0,0,0.08)" }}
            >
              <X size={26} className="text-red-400" strokeWidth={2.5} />
            </button>

            <button
              onClick={() => handleButton("SUPER_LIKE")}
              disabled={superLikesLeft === 0}
              className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 4px 16px rgba(96,165,250,0.25), 0 2px 6px rgba(0,0,0,0.08)" }}
              title={superLikesLeft === 0 ? "Plus de Super Likes aujourd'hui" : `${superLikesLeft} Super Like(s) restant(s)`}
            >
              <Star size={20} className="text-blue-400" strokeWidth={2.5} />
              {superLikesLeft < 3 && (
                <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {superLikesLeft}
                </span>
              )}
            </button>

            <button
              onClick={() => handleButton("LIKE")}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #e8688a 0%, #D4537E 60%, #b83d65 100%)",
                boxShadow: "0 6px 20px rgba(212,83,126,0.45), 0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Heart size={28} className="text-white" strokeWidth={2.5} fill="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
