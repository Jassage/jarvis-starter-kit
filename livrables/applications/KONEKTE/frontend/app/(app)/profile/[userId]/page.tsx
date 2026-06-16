"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, MessageCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { photoUrl } from "@/lib/photo";
import toast from "react-hot-toast";

interface PublicProfile {
  userId: string;
  firstName: string;
  age: number;
  city: string;
  bio: string | null;
  occupation: string | null;
  interests: string[];
  isVerified: boolean;
  isOnline: boolean;
  compatibility: number;
  commonInterests: string[];
  photos: { id: string; url: string; isMain: boolean }[];
  prompt1: { q: string; a: string } | null;
  prompt2: { q: string; a: string } | null;
  conversationId: string | null;
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    api.get(`/profiles/${userId}`)
      .then((r) => setProfile(r.data.data))
      .catch(() => toast.error("Profil introuvable"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Profil introuvable</p>
        <button onClick={() => router.back()} className="btn-primary">Retour</button>
      </div>
    );
  }

  const photos = profile.photos.length > 0
    ? [...profile.photos].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0))
    : [];
  const currentPhoto = photos[photoIdx];

  return (
    <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col overflow-y-auto">
      {/* Photo principale + navigation */}
      <div className="relative flex-shrink-0" style={{ height: "55vh", minHeight: 300 }}>
        {currentPhoto ? (
          <img
            src={photoUrl(currentPhoto.url) ?? ""}
            alt={profile.firstName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FBEAF0, #e8b4c8)" }}
          >
            <span className="text-[120px] font-black" style={{ color: "#993556", opacity: 0.25 }}>
              {profile.firstName[0]}
            </span>
          </div>
        )}

        {/* Gradient du bas */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)", height: 160 }}
        />

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        {/* Navigation photos */}
        {photos.length > 1 && (
          <>
            {/* Indicateurs */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className="h-1 rounded-full transition-all"
                  style={{ width: i === photoIdx ? 24 : 8, background: i === photoIdx ? "white" : "rgba(255,255,255,0.5)" }}
                />
              ))}
            </div>

            {photoIdx > 0 && (
              <button
                onClick={() => setPhotoIdx((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            )}
            {photoIdx < photos.length - 1 && (
              <button
                onClick={() => setPhotoIdx((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            )}
          </>
        )}

        {/* Nom sur la photo */}
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-white text-3xl font-bold">{profile.firstName}, {profile.age}</h1>
            {profile.isVerified && <CheckCircle size={20} className="text-blue-400" />}
            {profile.isOnline && <span className="w-3 h-3 rounded-full bg-green-400 shadow shadow-green-400/50" />}
          </div>
          <div className="flex items-center gap-3 text-white/75 text-sm">
            {profile.city && (
              <span className="flex items-center gap-1"><MapPin size={13} />{profile.city}</span>
            )}
            {profile.occupation && (
              <span className="flex items-center gap-1"><Briefcase size={13} />{profile.occupation}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex flex-col gap-3 p-4 pb-24">
        {/* Compatibilité */}
        {profile.compatibility > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">Compatibilité</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${profile.compatibility}%`, background: "linear-gradient(to right, #D4537E, #e8688a)" }}
                />
              </div>
              <span className="text-sm font-bold" style={{ color: "#D4537E" }}>{profile.compatibility}%</span>
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Prompts */}
        {profile.prompt1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">{profile.prompt1.q}</p>
            <p className="text-sm text-gray-700 italic">&ldquo;{profile.prompt1.a}&rdquo;</p>
          </div>
        )}
        {profile.prompt2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">{profile.prompt2.q}</p>
            <p className="text-sm text-gray-700 italic">&ldquo;{profile.prompt2.a}&rdquo;</p>
          </div>
        )}

        {/* Intérêts communs */}
        {profile.commonInterests.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">En commun</p>
            <div className="flex flex-wrap gap-2">
              {profile.commonInterests.map((i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "#FBEAF0", color: "#993556" }}>{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tous les intérêts */}
        {profile.interests.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Centres d&apos;intérêt</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium border border-gray-200 text-gray-600">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Toutes les photos */}
        {photos.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Photos ({photos.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPhotoIdx(i)}
                  className="relative rounded-xl overflow-hidden"
                  style={{ aspectRatio: "3/4", outline: i === photoIdx ? "2.5px solid #D4537E" : "none" }}
                >
                  <img src={photoUrl(p.url) ?? ""} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bouton message fixé en bas */}
      {profile.conversationId && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <button
            onClick={() => router.push(`/messages/${profile.conversationId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #e8688a, #D4537E)", boxShadow: "0 4px 16px rgba(212,83,126,0.4)" }}
          >
            <MessageCircle size={20} />
            Envoyer un message
          </button>
        </div>
      )}
    </div>
  );
}
