'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, Wifi, AlertCircle, Clock } from 'lucide-react';
import { obtenirVuePublique, VuePublique } from '@/lib/reunions';
import { rejoindreReunion, obtenirStatutAttente } from '@/lib/participants';
import { chargerSession, sauvegarderSession, sauvegarderAccesSalle } from '@/lib/participantSession';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';

const MINT = '#17b892';

type Etape = 'chargement' | 'reprise' | 'formulaire' | 'attente' | 'refuse' | 'erreur';

export default function RejoindrePage() {
  const params = useParams<{ codeReunion: string }>();
  const router = useRouter();
  const { t, langue, setLangue } = useI18n();

  const [vue, setVue] = useState<VuePublique | null>(null);
  const [etape, setEtape] = useState<Etape>('chargement');
  const [erreur, setErreur] = useState('');
  const [nomAffiche, setNomAffiche] = useState('');
  const [codeAcces, setCodeAcces] = useState('');
  const [modeDonneesMinimales, setModeDonneesMinimales] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [enAttentePendant, setEnAttentePendant] = useState<{ participantId: string; reconnectToken: string; nomAffiche: string } | null>(null);
  const hydrate = useAuthStore((s) => s.hydrate);

  // Chargement de la vue publique + tentative de reprise de session (brief :
  // "rejoindre en un clic depuis le même lien" après une coupure). `hydrate()`
  // est tenté d'abord (silencieusement, jamais bloquant si ça échoue) : cette
  // page n'est pas sous le layout (dashboard) protégé, donc si l'hôte ouvre le
  // lien de SA propre réunion depuis un onglet neuf, son access token n'est
  // pas encore en mémoire — sans ce hydrate(), le backend le traiterait comme
  // un invité anonyme (salle d'attente appliquée, pas de lien vers son compte).
  useEffect(() => {
    let annule = false;

    hydrate().catch(() => {});

    obtenirVuePublique(params.codeReunion)
      .then(async (v) => {
        if (annule) return;
        setVue(v);
        setModeDonneesMinimales(v.modeConnexionMinimale === 'AUDIO_SEUL' || v.modeConnexionMinimale === 'DIAL_IN');

        const session = chargerSession(params.codeReunion);
        if (!session) {
          setEtape('formulaire');
          return;
        }

        try {
          const resultat = await rejoindreReunion(params.codeReunion, {
            nomAffiche: session.nomAffiche,
            reconnectToken: session.reconnectToken,
          });
          if (annule) return;
          if (resultat.livekitToken && resultat.reunion) {
            sauvegarderAccesSalle(params.codeReunion, {
              livekitToken: resultat.livekitToken,
              livekitRoomName: resultat.reunion.livekitRoomName,
              titre: resultat.reunion.titre,
              participantId: resultat.participant.id,
              reconnectToken: session.reconnectToken,
              nomAffiche: session.nomAffiche,
              modeDonneesMinimales: v.modeConnexionMinimale === 'AUDIO_SEUL',
            });
            router.push(`/salle/${params.codeReunion}`);
          } else {
            setEtape('formulaire');
          }
        } catch {
          setEtape('formulaire');
        }
      })
      .catch(() => {
        if (!annule) {
          setErreur('Réunion introuvable ou terminée.');
          setEtape('erreur');
        }
      });

    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.codeReunion]);

  // Polling de la salle d'attente.
  useEffect(() => {
    if (etape !== 'attente' || !enAttentePendant) return;

    const interval = setInterval(async () => {
      try {
        const s = await obtenirStatutAttente(enAttentePendant.participantId);
        if (s === 'ADMIS') {
          clearInterval(interval);
          const resultat = await rejoindreReunion(params.codeReunion, {
            nomAffiche: enAttentePendant.nomAffiche,
            reconnectToken: enAttentePendant.reconnectToken,
          });
          if (resultat.livekitToken && resultat.reunion) {
            sauvegarderAccesSalle(params.codeReunion, {
              livekitToken: resultat.livekitToken,
              livekitRoomName: resultat.reunion.livekitRoomName,
              titre: resultat.reunion.titre,
              participantId: resultat.participant.id,
              reconnectToken: enAttentePendant.reconnectToken,
              nomAffiche: enAttentePendant.nomAffiche,
              modeDonneesMinimales,
            });
            router.push(`/salle/${params.codeReunion}`);
          }
        } else if (s === 'REJETE') {
          clearInterval(interval);
          setEtape('refuse');
        }
      } catch {
        // Ignoré : on réessaie au prochain tick plutôt que d'afficher une erreur transitoire.
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [etape, enAttentePendant, params.codeReunion, modeDonneesMinimales, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const resultat = await rejoindreReunion(params.codeReunion, {
        nomAffiche,
        codeAcces: codeAcces || undefined,
        modeConnexion: modeDonneesMinimales ? 'AUDIO_SEUL' : 'VIDEO',
      });

      sauvegarderSession(params.codeReunion, {
        participantId: resultat.participant.id,
        reconnectToken: resultat.reconnectToken,
        nomAffiche,
      });

      if (resultat.enAttente) {
        setEnAttentePendant({ participantId: resultat.participant.id, reconnectToken: resultat.reconnectToken, nomAffiche });
        setEtape('attente');
      } else if (resultat.livekitToken && resultat.reunion) {
        sauvegarderAccesSalle(params.codeReunion, {
          livekitToken: resultat.livekitToken,
          livekitRoomName: resultat.reunion.livekitRoomName,
          titre: resultat.reunion.titre,
          participantId: resultat.participant.id,
          reconnectToken: resultat.reconnectToken,
          nomAffiche,
          modeDonneesMinimales,
        });
        router.push(`/salle/${params.codeReunion}`);
      }
    } catch (err: any) {
      setErreur(err.response?.data?.message || 'Impossible de rejoindre la réunion');
    } finally {
      setChargement(false);
    }
  };

  const carte = (contenu: React.ReactNode) => (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob-field">
        <div className="blob blob-mint" style={{ width: 440, height: 440, top: -160, left: '50%', marginLeft: -220 }} />
        <div className="blob blob-blue" style={{ width: 420, height: 420, bottom: -180, right: -100, animationDelay: '-11s' }} />
      </div>
      <div
        className="w-full relative animate-[fade-up_0.5s_ease-out]"
        style={{ maxWidth: 440, borderRadius: 20, background: 'rgba(14,22,46,0.68)', border: '1px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(28px) saturate(160%)', WebkitBackdropFilter: 'blur(28px) saturate(160%)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', padding: '2.25rem', zIndex: 1 }}
      >
        {contenu}
      </div>
    </div>
  );

  if (etape === 'chargement' || etape === 'reprise') {
    return carte(
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 animate-pulse" style={{ background: 'rgba(23,184,146,0.14)' }}>
          <Video className="w-5 h-5" style={{ color: MINT }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Connexion à la réunion...</p>
      </div>
    );
  }

  if (etape === 'erreur') {
    return carte(
      <div className="flex flex-col items-center text-center py-6">
        <AlertCircle className="w-8 h-8 mb-3" style={{ color: '#fca5a5' }} />
        <p className="text-white font-semibold mb-1">Impossible de rejoindre</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{erreur}</p>
      </div>
    );
  }

  if (etape === 'refuse') {
    return carte(
      <div className="flex flex-col items-center text-center py-6">
        <AlertCircle className="w-8 h-8 mb-3" style={{ color: '#fca5a5' }} />
        <p className="text-white font-semibold">Votre demande a été refusée par l&apos;hôte.</p>
      </div>
    );
  }

  if (etape === 'attente') {
    return carte(
      <div className="flex flex-col items-center text-center py-6">
        <Clock className="w-8 h-8 mb-3 animate-pulse" style={{ color: MINT }} />
        <p className="text-white font-semibold mb-1">{vue?.titre}</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('salleAttente')}</p>
      </div>
    );
  }

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' };

  return carte(
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(23,184,146,0.14)' }}>
            <Video className="w-4.5 h-4.5" style={{ color: MINT }} />
          </div>
          <span className="font-black text-white tracking-tight">REYINYON</span>
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.14)' }}>
          {(['fr', 'ht'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLangue(l)}
              className="px-2.5 py-1 text-xs font-bold"
              style={{ background: langue === l ? MINT : 'transparent', color: langue === l ? '#04241c' : 'rgba(255,255,255,0.5)' }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="text-lg font-bold text-white mb-1">{vue?.titre}</p>
      <p className="text-sm mb-6 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
        <Wifi className="w-3.5 h-3.5" /> {vue?.salleAttenteActive ? "Salle d'attente activée par l'hôte" : "Vous rejoindrez directement"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: MINT }}>{t('votreNom').toUpperCase()}</label>
          <input required maxLength={60} value={nomAffiche} onChange={(e) => setNomAffiche(e.target.value)} placeholder={t('votreNom')} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
        </div>

        {vue?.codeAccesRequis && (
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: MINT }}>{t('codeAcces').toUpperCase()}</label>
            <input required value={codeAcces} onChange={(e) => setCodeAcces(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={inputStyle} />
          </div>
        )}

        <label className="flex items-start gap-3 p-3.5 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <input type="checkbox" checked={modeDonneesMinimales} onChange={(e) => setModeDonneesMinimales(e.target.checked)} className="mt-0.5" />
          <span>
            <span className="block text-sm font-semibold text-white">{t('modeDonneesMinimales')}</span>
            <span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('modeDonneesMinimalesHint')}</span>
          </span>
        </label>

        {erreur && (
          <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {erreur}
          </div>
        )}

        <button type="submit" disabled={chargement} className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50" style={{ background: MINT, color: '#04241c' }}>
          {chargement ? '...' : t('rejoindre')}
        </button>
      </form>
    </>
  );
}
