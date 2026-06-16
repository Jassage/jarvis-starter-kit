"use client";
import { useState, useRef } from "react";
import { Camera, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { photoUrl } from "@/lib/photo";

interface Photo {
  id: string;
  url: string;
  isMain: boolean;
}

interface PhotoUploadProps {
  photos: Photo[];
  onUpdate: (photos: Photo[]) => void;
}

export default function PhotoUpload({ photos, onUpdate }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (photos.length >= 6) { toast.error("Maximum 6 photos"); return; }
    setUploading(true);
    const form = new FormData();
    form.append("photo", file);
    form.append("isMain", photos.length === 0 ? "true" : "false");
    try {
      const { data } = await api.post("/photos", form);
      onUpdate([...photos, data.data]);
      toast.success("Photo ajoutée !");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (photoId: string) => {
    try {
      await api.delete(`/photos/${photoId}`);
      onUpdate(photos.filter((p) => p.id !== photoId));
      toast.success("Photo supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const setMain = async (photoId: string) => {
    try {
      await api.patch(`/photos/${photoId}/main`);
      onUpdate(photos.map((p) => ({ ...p, isMain: p.id === photoId })));
      toast.success("Photo principale mise à jour");
    } catch {
      toast.error("Erreur");
    }
  };

  const slots = Array.from({ length: 6 });

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((_, idx) => {
          const photo = photos[idx];
          return (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden bg-gray-100"
              style={{ aspectRatio: "3/4" }}
            >
              {photo ? (
                <>
                  <img src={photoUrl(photo.url) ?? ""} alt="" className="w-full h-full object-cover" />
                  {photo.isMain && (
                    <div className="absolute top-1 left-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center">
                      <Star size={11} className="text-white" />
                    </div>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {!photo.isMain && (
                      <button
                        onClick={() => setMain(photo.id)}
                        className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center"
                        title="Définir comme principale"
                      >
                        <Star size={12} className="text-yellow-400" />
                      </button>
                    )}
                    <button
                      onClick={() => remove(photo.id)}
                      className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center"
                    >
                      <X size={12} className="text-red-400" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-200 transition-colors"
                >
                  <Camera size={22} />
                  <span className="text-xs">{idx === 0 ? "Principale" : "Ajouter"}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-gray-400 mt-2 text-center">
        {photos.length}/6 photos · JPEG, PNG ou WEBP · max 5 Mo
      </p>
    </div>
  );
}
