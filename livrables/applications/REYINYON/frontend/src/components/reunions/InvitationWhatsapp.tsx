'use client';
import { useState } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { genererMessageInvitation, construireLienWhatsapp } from '@/lib/whatsapp';

// Le brief exclut explicitement l'automatisation d'envoi (API WhatsApp Business
// officielle requise, hors périmètre) — seulement un texte prêt à partager et
// un lien wa.me pré-rempli. Le "rappel" est le même bouton réutilisé manuellement.
export default function InvitationWhatsapp({
  titre,
  lienReunion,
  codeAcces,
  numeroDialIn,
  codeTelephone,
}: {
  titre: string;
  lienReunion: string;
  codeAcces?: string | null;
  numeroDialIn?: string | null;
  codeTelephone?: string | null;
}) {
  const [copie, setCopie] = useState(false);
  const message = genererMessageInvitation({ titre, lienReunion, codeAcces, numeroDialIn, codeTelephone });

  const copier = async () => {
    await navigator.clipboard.writeText(message);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        <h3 className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>Invitation WhatsApp</h3>
      </div>
      <pre className="text-xs whitespace-pre-wrap p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink-2)', fontFamily: 'inherit' }}>{message}</pre>
      <div className="flex gap-2">
        <a href={construireLienWhatsapp(message)} target="_blank" rel="noopener noreferrer" className="btn btn-mint flex-1">
          <MessageCircle className="w-4 h-4" /> Ouvrir dans WhatsApp
        </a>
        <button type="button" onClick={copier} className="btn btn-secondary">
          {copie ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copie ? 'Copié' : 'Copier'}
        </button>
      </div>
      <p className="text-[11px]" style={{ color: 'var(--color-ink-3)' }}>
        Pour un rappel manuel 15 minutes avant, ouvrez simplement ce bouton à nouveau au moment voulu — aucun envoi automatique.
      </p>
    </div>
  );
}
