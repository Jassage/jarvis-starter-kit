'use client';
import { useState } from 'react';
import { Home, CheckCircle2, Bed, Bath } from 'lucide-react';

export function HeroImage() {
  const [hasImage, setHasImage] = useState(true);

  return (
    <div className="hidden lg:block relative">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
        {/* Fallback gradient (toujours présent en fond) */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-400 to-primary-600">
          {!hasImage && (
            <div className="flex flex-col items-center justify-center h-full text-white/50 text-sm text-center px-6">
              <Home className="w-16 h-16 mb-3 opacity-30" />
              <p>Ajoutez votre photo dans</p>
              <code className="bg-white/10 px-2 py-0.5 rounded mt-1">public/hero.jpg</code>
            </div>
          )}
        </div>

        {/* Image hero — remplacez public/hero.jpg par votre photo de propriété */}
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/hero.jpg"
            alt="Belle propriété en Haïti"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setHasImage(false)}
          />
        )}

        {/* Overlay gradient bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge prix flottant bas-gauche */}
        <div className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
            <Home className="w-4.5 h-4.5 text-primary-500" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 leading-none mb-0.5">Villa à Pétion-Ville</p>
            <p className="font-bold text-gray-900 text-sm">HTG 12 500 000</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        </div>

        {/* Badge caractéristiques haut-droite */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2.5 text-xs text-gray-700 font-semibold">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-gray-400" />4</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-gray-400" />3</span>
          <span className="text-gray-300">·</span>
          <span>320 m²</span>
        </div>
      </div>

      {/* Carte flottante propriétaires actifs */}
      <div className="absolute -bottom-5 -right-6 bg-white rounded-2xl shadow-xl p-4 w-52">
        <p className="text-xs text-gray-400 mb-2">Propriétaires actifs</p>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {(['#FF6B35', '#1B2A4A', '#10B981'] as const).map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: c }}
              >
                {['JD', 'MR', 'SA'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-gray-900">+240</p>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">annonces vérifiées</p>
      </div>
    </div>
  );
}
