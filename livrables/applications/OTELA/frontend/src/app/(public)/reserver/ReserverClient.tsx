'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Users, MapPin, CheckCircle2, ArrowLeft, Building2, Wallet, Mail, Clock3, ChevronDown, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { construireLienWhatsApp } from '@/lib/whatsapp';

interface Etablissement {
  id: string; nom: string; commune: string; departement: string; devisesAcceptees: ('HTG' | 'USD')[];
}

interface Resultat {
  typeChambreId: string;
  nom: string;
  description: string | null;
  capaciteMax: number;
  etablissement: { id: string; nom: string; commune: string; departement: string };
  devise: 'HTG' | 'USD';
  typeSejour: 'NUITEE' | 'JOUR';
  tarifParNuit: string;
  nombreNuits: number;
  montantTotal: number;
  chambresDisponibles: number;
}

type Etape = 'recherche' | 'reservation' | 'confirmation';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=2000&auto=format&fit=crop';

const ATOUTS = [
  { icon: Building2, titre: 'Plusieurs établissements, un seul compte', texte: 'Réservez dans n\'importe quel établissement de la chaîne avec le même profil client, où que vous soyez en Haïti.' },
  { icon: Wallet, titre: 'Tarifs transparents HTG ou USD', texte: 'Le prix affiché est le prix payé, dans la devise de votre choix — jamais de conversion cachée au moment de payer.' },
  { icon: Mail, titre: 'Confirmation immédiate', texte: 'Votre réservation est confirmée en temps réel et un email de confirmation vous est envoyé aussitôt.' },
  { icon: Clock3, titre: 'Réception sur place', texte: 'Un personnel dédié vous accueille à votre arrivée et reste disponible tout au long de votre séjour.' },
];

export default function ReserverClient() {
  const searchParams = useSearchParams();
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [form, setForm] = useState({
    typeSejour: 'NUITEE' as 'NUITEE' | 'JOUR',
    etablissementId: '',
    dateArrivee: '',
    dateDepart: '',
    dateJour: '',
    heureArrivee: '10:00',
    heureDepart: '18:00',
    nombreAdultes: 2,
    nombreEnfants: 0,
    devise: 'HTG' as 'HTG' | 'USD',
  });
  // Le moteur de disponibilité ne raisonne qu'en nombre total ; la ventilation
  // adultes/enfants n'est portée que par la réservation finale.
  const nombrePersonnes = form.nombreAdultes + form.nombreEnfants;
  const [resultats, setResultats] = useState<Resultat[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [etape, setEtape] = useState<Etape>('recherche');
  const [selection, setSelection] = useState<Resultat | null>(null);
  const [client, setClient] = useState({ nom: '', telephone: '', email: '' });
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [confirmation, setConfirmation] = useState<any>(null);

  useEffect(() => {
    api.get('/etablissements').then(({ data }) => setEtablissements(data.data.etablissements)).catch(() => {});
  }, []);

  // Pré-remplit l'établissement depuis le CTA "Réserver ici" d'une fiche établissement
  // (?etablissementId=...) — même pattern que le ?ref= déjà utilisé sur ma-reservation.
  useEffect(() => {
    const id = searchParams.get('etablissementId');
    if (id) setForm((f) => ({ ...f, etablissementId: id }));
  }, [searchParams]);

  // Combine les champs du formulaire en un couple de dates ISO — mode JOUR :
  // même date calendaire, heures saisies ; mode NUITEE : deux dates distinctes.
  const datesRecherche = () => {
    if (form.typeSejour === 'JOUR') {
      return {
        dateArrivee: new Date(`${form.dateJour}T${form.heureArrivee}`).toISOString(),
        dateDepart: new Date(`${form.dateJour}T${form.heureDepart}`).toISOString(),
      };
    }
    return { dateArrivee: form.dateArrivee, dateDepart: form.dateDepart };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearching(true);
    setResultats(null);
    try {
      const { data } = await api.get('/disponibilite', {
        params: {
          etablissementId: form.etablissementId || undefined,
          ...datesRecherche(),
          nombrePersonnes,
          devise: form.devise,
          typeSejour: form.typeSejour,
        },
      });
      setResultats(data.data.resultats);
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  const choisir = (r: Resultat) => {
    setSelection(r);
    setEtape('reservation');
    setReserveError('');
  };

  const handleReserver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection) return;
    setReserveError('');
    setReserving(true);
    try {
      const { data } = await api.post('/reservations', {
        etablissementId: selection.etablissement.id,
        typeChambreId: selection.typeChambreId,
        ...datesRecherche(),
        nombrePersonnes,
        nombreAdultes: form.nombreAdultes,
        nombreEnfants: form.nombreEnfants,
        devise: selection.devise,
        typeSejour: selection.typeSejour,
        client,
      });
      setConfirmation(data.data.reservation);
      setEtape('confirmation');
    } catch (err: any) {
      setReserveError(err.response?.data?.message || 'Impossible de finaliser la réservation');
    } finally {
      setReserving(false);
    }
  };

  if (etape === 'confirmation' && confirmation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-success-soft)' }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Réservation confirmée</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--color-ink-3)' }}>Un email de confirmation avec votre QR code a été envoyé à {confirmation.client.email}.</p>
          {confirmation.reference && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--color-primary-soft)' }}>
              <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-primary-2)' }}>VOTRE RÉFÉRENCE</p>
              <p className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-primary-2)' }}>{confirmation.reference}</p>
              <a href={`/ma-reservation?ref=${encodeURIComponent(confirmation.reference)}`} className="text-xs font-semibold underline" style={{ color: 'var(--color-primary-2)' }}>Consulter ma réservation en ligne</a>
            </div>
          )}
          <div className="text-left space-y-2 p-4 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-3)' }}>Établissement</span><span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{confirmation.etablissement.nom}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-3)' }}>Chambre</span><span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{confirmation.chambre.typeChambre.nom} — {confirmation.chambre.numero}</span></div>
            {confirmation.typeSejour === 'JOUR' ? (
              <>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-3)' }}>Date</span><span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{new Date(confirmation.dateArrivee).toLocaleDateString('fr-FR')}</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-3)' }}>Horaires</span><span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{new Date(confirmation.dateArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} – {new Date(confirmation.dateDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-3)' }}>Arrivée</span><span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{new Date(confirmation.dateArrivee).toLocaleDateString('fr-FR')}</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--color-ink-3)' }}>Départ</span><span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{new Date(confirmation.dateDepart).toLocaleDateString('fr-FR')}</span></div>
              </>
            )}
            <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}><span style={{ color: 'var(--color-ink-3)' }}>Total</span><span className="font-bold" style={{ color: 'var(--color-ink)' }}>{Number(confirmation.montantTotal).toLocaleString('fr-FR')} {confirmation.devise}</span></div>
          </div>
          <button
            onClick={() => window.open(construireLienWhatsApp(confirmation.client.telephone, `Bonjour, ma réservation ${confirmation.reference ?? ''} à ${confirmation.etablissement.nom} est confirmée : chambre ${confirmation.chambre.typeChambre.nom} (${confirmation.chambre.numero}), du ${new Date(confirmation.dateArrivee).toLocaleDateString('fr-FR')} au ${new Date(confirmation.dateDepart).toLocaleDateString('fr-FR')}.`), '_blank')}
            className="btn w-full mt-4"
            style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}
          >
            <MessageCircle className="w-4 h-4" /> Confirmer par WhatsApp
          </button>

          <button onClick={() => { setEtape('recherche'); setResultats(null); setConfirmation(null); setSelection(null); setClient({ nom: '', telephone: '', email: '' }); }} className="btn btn-primary w-full mt-3">
            Nouvelle recherche
          </button>
        </div>
      </div>
    );
  }

  if (etape === 'reservation' && selection) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <button onClick={() => setEtape('recherche')} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: 'var(--color-ink-2)' }}>
          <ArrowLeft className="w-4 h-4" /> Retour aux résultats
        </button>

        <div className="card p-6">
          <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--color-accent)' }}>{selection.etablissement.nom}</p>
          <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--color-ink)' }}>{selection.nom}</h1>
          <div className="flex justify-between text-sm p-3 rounded-xl mb-5" style={{ background: 'var(--color-surface-2)' }}>
            <span style={{ color: 'var(--color-ink-2)' }}>{selection.typeSejour === 'JOUR' ? 'Forfait journée' : `${selection.nombreNuits} nuit(s)`}</span>
            <span className="font-bold" style={{ color: 'var(--color-ink)' }}>{selection.montantTotal.toLocaleString('fr-FR')} {selection.devise}</span>
          </div>

          <form onSubmit={handleReserver} className="space-y-3">
            <input required placeholder="Nom complet" className="input" value={client.nom} onChange={(e) => setClient({ ...client, nom: e.target.value })} />
            <input required placeholder="Téléphone" className="input" value={client.telephone} onChange={(e) => setClient({ ...client, telephone: e.target.value })} />
            <input required type="email" placeholder="Email" className="input" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} />

            {reserveError && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{reserveError}</div>}

            <button type="submit" disabled={reserving} className="btn btn-gold w-full">
              {reserving ? 'Confirmation en cours...' : 'Confirmer la réservation'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section
        id="recherche"
        className="relative overflow-hidden"
        style={{ minHeight: '640px' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(5,11,26,0.78) 0%, rgba(11,23,51,0.82) 45%, rgba(11,23,51,0.94) 100%)' }}
          aria-hidden
        />
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(200,148,28,0.18) 0%, transparent 70%)', top: '-10%', left: '10%' }} />
          <div className="absolute w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 70%)', bottom: '-15%', right: '15%' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#c8941c' }}>CHAÎNE HÔTELIÈRE HAÏTIENNE</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">Votre séjour commence ici</h1>
          <p className="text-sm sm:text-base mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Plusieurs établissements à travers Haïti, un seul compte client, une réservation confirmée en quelques secondes.
          </p>

          <form
            onSubmit={handleSearch}
            className="p-4 sm:p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-left"
            style={{ background: 'rgba(10,18,40,0.85)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
          >
            <div className="sm:col-span-2 lg:col-span-7 flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, typeSejour: 'NUITEE' })}
                className="btn"
                style={form.typeSejour === 'NUITEE'
                  ? { background: 'var(--gradient-gold)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.72)' }}
              >
                Nuitée
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, typeSejour: 'JOUR' })}
                className="btn"
                style={form.typeSejour === 'JOUR'
                  ? { background: 'var(--gradient-gold)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.72)' }}
              >
                Day-use (à la journée)
              </button>
            </div>
            <div className="lg:col-span-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}><MapPin className="w-3 h-3" /> ÉTABLISSEMENT</label>
              <select className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.etablissementId} onChange={(e) => setForm({ ...form, etablissementId: e.target.value })}>
                <option value="" style={{ color: '#111' }}>Tous les établissements</option>
                {etablissements.map((e) => <option key={e.id} value={e.id} style={{ color: '#111' }}>{e.nom} — {e.commune}</option>)}
              </select>
            </div>

            {form.typeSejour === 'NUITEE' ? (
              <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}>ARRIVÉE</label>
                  <input required type="date" className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.dateArrivee} onChange={(e) => setForm({ ...form, dateArrivee: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}>DÉPART</label>
                  <input required type="date" className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.dateDepart} onChange={(e) => setForm({ ...form, dateDepart: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="lg:col-span-3 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}>DATE</label>
                  <input required type="date" className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.dateJour} onChange={(e) => setForm({ ...form, dateJour: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}>DE</label>
                  <input required type="time" className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.heureArrivee} onChange={(e) => setForm({ ...form, heureArrivee: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}>À</label>
                  <input required type="time" className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.heureDepart} onChange={(e) => setForm({ ...form, heureDepart: e.target.value })} />
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}><Users className="w-3 h-3" /> ADULTES</label>
              <input required type="number" min={1} max={20} className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.nombreAdultes} onChange={(e) => setForm({ ...form, nombreAdultes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}>ENFANTS</label>
              <input required type="number" min={0} max={20} className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.nombreEnfants} onChange={(e) => setForm({ ...form, nombreEnfants: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider mb-1.5" style={{ color: '#c8941c' }}>DEVISE</label>
              <select className="input" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} value={form.devise} onChange={(e) => setForm({ ...form, devise: e.target.value as 'HTG' | 'USD' })}>
                <option value="HTG" style={{ color: '#111' }}>HTG</option>
                <option value="USD" style={{ color: '#111' }}>USD</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-7 flex justify-center pt-1">
              <button type="submit" disabled={searching} className="btn btn-gold px-8">
                <Search className="w-4 h-4" />
                {searching ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </form>

          {!resultats && (
            <div className="mt-12 flex justify-center">
              <ChevronDown className="w-5 h-5 animate-bounce" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {searchError && <div className="p-4 rounded-xl text-sm mb-6" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{searchError}</div>}

        {resultats && resultats.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>Aucune chambre disponible pour ces critères.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-ink-3)' }}>Essayez d'autres dates ou un autre établissement.</p>
          </div>
        )}

        {resultats && resultats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resultats.map((r) => (
              <div key={`${r.etablissement.id}-${r.typeChambreId}`} className="card p-5 flex flex-col">
                <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--color-accent)' }}>{r.etablissement.nom}</p>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-ink)' }}>{r.nom}</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--color-ink-3)' }}>{r.description}</p>
                <p className="text-xs mb-4" style={{ color: 'var(--color-ink-3)' }}>Jusqu'à {r.capaciteMax} personnes · {r.chambresDisponibles} chambre(s) disponible(s)</p>
                <div className="mt-auto">
                  <div className="flex items-end justify-between mb-3">
                    <span className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{r.typeSejour === 'JOUR' ? 'Forfait journée' : `${r.nombreNuits} nuit(s)`}</span>
                    <span className="text-xl font-black" style={{ color: 'var(--color-ink)' }}>{r.montantTotal.toLocaleString('fr-FR')} {r.devise}</span>
                  </div>
                  <button onClick={() => choisir(r)} className="btn btn-gold w-full">Réserver</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {!resultats && (
        <>
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>POURQUOI OTELA</p>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-ink)' }}>Une réservation simple, où que vous alliez en Haïti</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ATOUTS.map((a) => (
                <div key={a.titre} className="card p-6">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--gradient-gold)' }}>
                    <a.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-ink)' }}>{a.titre}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-3)' }}>{a.texte}</p>
                </div>
              ))}
            </div>
          </section>

          {etablissements.length > 0 && (
            <section className="py-16 sm:py-20" style={{ background: 'var(--color-surface-2)' }}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                  <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>NOS ÉTABLISSEMENTS</p>
                  <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--color-ink)' }}>{etablissements.length} établissement{etablissements.length > 1 ? 's' : ''} à découvrir</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {etablissements.map((e) => (
                    <Link key={e.id} href={`/etablissements/${e.id}`} className="card card-hover p-6 text-left block">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex gap-1.5">
                          {e.devisesAcceptees.map((d) => (
                            <span key={d} className="badge" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>{d}</span>
                          ))}
                        </div>
                      </div>
                      <h3 className="font-bold text-base mb-1" style={{ color: 'var(--color-ink)' }}>{e.nom}</h3>
                      <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-ink-3)' }}>
                        <MapPin className="w-3 h-3" /> {e.commune}, {e.departement}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
