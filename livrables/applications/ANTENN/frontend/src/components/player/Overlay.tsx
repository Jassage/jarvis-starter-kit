'use client';

/**
 * Habillage sponsor par-dessus le player — DEUX approches possibles, compromis :
 *
 * 1. Overlay HTML côté player (implémenté ici) : le logo/bandeau est un élément
 *    HTML positionné en `absolute` par-dessus le <video>, piloté par les données
 *    IncrustationLogo/BandeauSponsor lues depuis l'EPG.
 *    + Modifiable en temps réel sans re-transcoder le flux, réversible instantanément
 *      côté admin, ne pèse pas sur l'encodeur/playout.
 *    + Seule option réalisable sans toucher à ErsatzTV dans cet environnement.
 *    - Absent si le flux est regardé hors du player web (app tierce, TV connectée
 *      via un lecteur générique, intégration IPTV) — l'habillage n'existe qu'ici.
 *    - Un spectateur peut bloquer l'overlay avec un ad-blocker agressif ou un CSS
 *      custom, contrairement à un logo brûlé dans l'image.
 *
 * 2. Incrustation brûlée dans le flux côté playout (ErsatzTV) : le logo fait partie
 *    de l'image vidéo elle-même, appliqué par ErsatzTV/l'encodeur avant diffusion.
 *    + Visible sur tout lecteur HLS, y compris hors du player web.
 *    + Pas contournable côté client.
 *    - Nécessite de piloter ErsatzTV via son API (non branché ici, cf.
 *      src/integrations/ersatztv.ts côté backend) — changer l'habillage exige de
 *      republier le bloc de playout, latence plus élevée qu'un simple update DB.
 *    - Irréversible sans re-render : si un contrat sponsor s'arrête en cours de
 *      diffusion, l'ancien logo reste visible jusqu'au prochain bloc programmé.
 *
 * Choix retenu ici : option 1, car c'est la seule qui ne dépend pas d'un accès
 * ErsatzTV réel. Le jour où l'intégration ErsatzTV est branchée, les deux peuvent
 * coexister (brûlé pour l'habillage permanent contractuel long terme, overlay HTML
 * pour les bandeaux sponsors ponctuels faciles à changer).
 */

interface IncrustationData {
  id: string;
  logoUrl: string;
  position: 'HAUT_GAUCHE' | 'HAUT_DROITE' | 'BAS_GAUCHE' | 'BAS_DROITE';
  opacite: number;
}

interface BandeauData {
  id: string;
  items: Array<{ texte: string }>;
  vitesseDefilement: number;
}

interface LogoChaine {
  logoUrl: string;
  logoPosition: 'HAUT_GAUCHE' | 'HAUT_DROITE' | 'BAS_GAUCHE' | 'BAS_DROITE';
  logoOpacite: number;
}

const POSITION_STYLE: Record<string, React.CSSProperties> = {
  HAUT_GAUCHE: { top: '4%', left: '3%' },
  HAUT_DROITE: { top: '4%', right: '3%' },
  BAS_GAUCHE: { bottom: '10%', left: '3%' },
  BAS_DROITE: { bottom: '10%', right: '3%' },
};

export default function Overlay({ incrustations, bandeaux, logoChaine }: { incrustations: IncrustationData[]; bandeaux: BandeauData[]; logoChaine?: LogoChaine | null }) {
  const texteBandeau = bandeaux.flatMap((b) => b.items.map((i) => i.texte)).join('     •     ');

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Logo d'identité de la chaîne — rendu en permanence, indépendamment du
          programme, du repli et des habillages sponsors (le "bug" de la chaîne). */}
      {logoChaine && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoChaine.logoUrl}
          alt=""
          className="absolute h-9 sm:h-12 w-auto"
          style={{ ...POSITION_STYLE[logoChaine.logoPosition], opacity: logoChaine.logoOpacite }}
        />
      )}

      {incrustations.map((inc) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={inc.id}
          src={inc.logoUrl}
          alt=""
          className="absolute h-10 sm:h-14 w-auto rounded-md"
          style={{ ...POSITION_STYLE[inc.position], opacity: inc.opacite }}
        />
      ))}

      {texteBandeau && (
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-9 overflow-hidden" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div
            className="whitespace-nowrap text-xs sm:text-sm font-semibold text-white flex items-center h-full"
            style={{ animation: `scroll-bandeau ${Math.max(10, 120 - (bandeaux[0]?.vitesseDefilement || 60))}s linear infinite` }}
          >
            {texteBandeau}
          </div>
          <style>{`
            @keyframes scroll-bandeau {
              from { transform: translateX(100%); }
              to { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
