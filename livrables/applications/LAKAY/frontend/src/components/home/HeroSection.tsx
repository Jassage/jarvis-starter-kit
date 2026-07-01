'use client';
import { useState } from 'react';
import { SearchBar } from '../search/SearchBar';
import { HeroStats } from './HeroStats';

export function HeroSection() {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative min-h-[680px] flex items-center overflow-hidden text-white">

      {/* Image de fond — déposez public/hero.jpg */}
      {!imgError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={() => setImgError(true)}
        />
      )}

      {/* Fallback couleur si pas d'image */}
      <div className={`absolute inset-0 ${imgError
        ? 'bg-gradient-to-br from-navy-700 via-navy-600 to-navy-700'
        : 'bg-navy-900/10'
      }`} />

      {/* Overlay dégradé pour lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Motif de points discret */}
      {imgError && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }}
        />
      )}

      {/* Contenu */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            N°1 de l'immobilier en Haïti
          </div>

          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5 drop-shadow-lg">
            Trouvez votre
            <span className="text-primary-400 block">maison de rêve</span>
            en Haïti
          </h1>

          {/* Sous-titre */}
          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
            Carte interactive, points de repère locaux, contact direct avec les propriétaires.
          </p>

          {/* Barre de recherche */}
          <SearchBar size="large" className="max-w-xl" />

          {/* Stats dynamiques */}
          <HeroStats />
        </div>
      </div>
    </section>
  );
}
