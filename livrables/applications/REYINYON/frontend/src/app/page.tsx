import Link from 'next/link';
import { Video, Wifi, PhoneCall, MessageCircle, RefreshCw } from 'lucide-react';

const POINTS = [
  { icon: Wifi, titre: 'Dégradation visible, pas subie', texte: "Connexion faible ? Bascule automatique en audio seul, annoncée à tous — jamais un flou silencieux." },
  { icon: PhoneCall, titre: 'Rejoindre par appel téléphonique', texte: "Pas de data fiable ? Un numéro local suffit (bientôt disponible)." },
  { icon: MessageCircle, titre: 'Invitation WhatsApp', texte: "Message d'invitation prêt à partager, pas juste un email." },
  { icon: RefreshCw, titre: 'Reprise de session en un clic', texte: "Coupure de connexion ? Revenez sans redemander l'autorisation d'entrée." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="blob-field">
        <div className="blob blob-mint" style={{ width: 520, height: 520, top: -180, right: -140 }} />
        <div className="blob blob-blue" style={{ width: 460, height: 460, top: 280, left: -180, animationDelay: '-6s' }} />
        <div className="blob blob-violet" style={{ width: 380, height: 380, bottom: -160, right: 80, animationDelay: '-13s' }} />
      </div>

      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative" style={{ zIndex: 1 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-mint)' }}>
            <Video className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-black text-xl text-white tracking-tight">REYINYON</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">Se connecter</Link>
          <Link href="/register" className="btn btn-mint">Créer un compte</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24 relative" style={{ zIndex: 1 }}>
        <div className="max-w-2xl animate-[fade-up_0.6s_ease-out]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest" style={{ background: 'rgba(34,211,172,0.14)', border: '1px solid rgba(34,211,172,0.3)', color: '#5eead4' }}>
            VISIOCONFÉRENCE POUR CONNEXIONS INSTABLES
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            Des réunions vidéo qui tiennent, même en 3G
          </h1>
          <p className="text-lg text-white/60 mb-8 leading-relaxed">
            Pensé pour Haïti et les Caraïbes : quand la connexion faiblit, l&apos;application le dit clairement
            et s&apos;adapte, au lieu de vous laisser deviner pourquoi tout gèle.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-mint" style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}>Créer une réunion gratuitement</Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem' }}>J&apos;ai déjà un compte</Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-16">
          {POINTS.map((p, i) => (
            <div
              key={p.titre}
              className="card card-hover p-5 animate-[fade-up_0.6s_ease-out_backwards]"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--color-accent-soft)' }}>
                <p.icon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </div>
              <h3 className="text-white font-bold mb-1.5">{p.titre}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{p.texte}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
