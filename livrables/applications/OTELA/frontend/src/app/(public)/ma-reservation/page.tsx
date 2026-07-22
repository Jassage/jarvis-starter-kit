'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Download, CalendarClock, BedDouble, User, Receipt } from 'lucide-react';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ReservationPublique {
  reference: string;
  dateArrivee: string;
  dateDepart: string;
  nombreAdultes: number;
  nombreEnfants: number;
  statut: string;
  client: { nom: string; email: string; telephone: string };
  chambre: { numero: string; typeChambre: { nom: string } };
  etablissement: { nom: string; adresse: string; commune: string; telephone: string | null; heureCheckIn: string; heureCheckOut: string; politiqueAnnulation: string | null };
  facture: { montantHT: string; taxes: string; montantTotal: string; devise: string; statutPaiement: string } | null;
}

const STATUT_FACTURE: Record<string, string> = { IMPAYE: 'Impayée', PARTIEL: 'Partiellement payée', PAYE: 'Payée' };
const STATUT_RESA: Record<string, string> = { CONFIRMEE: 'Confirmée', EN_ATTENTE: 'En attente', ANNULEE: 'Annulée', TERMINEE: 'Terminée', NO_SHOW: 'Non présenté' };

function formatDate(iso: string) { return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function fmt(m: string, d: string) { return `${Number(m).toLocaleString('fr-FR')} ${d}`; }

function Contenu() {
  const params = useSearchParams();
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [resa, setResa] = useState<ReservationPublique | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pré-remplit la référence depuis le lien du QR / de l'email (?ref=OT-XXXXXX).
  useEffect(() => {
    const ref = params.get('ref');
    if (ref) setReference(ref);
  }, [params]);

  const rechercher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResa(null);
    setQr(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/reservations/public/${encodeURIComponent(reference.trim())}`, { params: { email: email.trim() } });
      setResa(data.data.reservation);
      setQr(data.data.qr);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Aucune réservation trouvée. Vérifiez la référence et l\'email.');
    } finally {
      setLoading(false);
    }
  };

  const pdfUrl = resa
    ? `${API_URL}/reservations/public/${encodeURIComponent(resa.reference)}/facture.pdf?email=${encodeURIComponent(email.trim())}`
    : '#';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>Ma réservation</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-3)' }}>Retrouvez votre séjour avec votre référence et l'email utilisé lors de la réservation.</p>

      <form onSubmit={rechercher} className="card p-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="label">Référence</label>
          <input required className="input" placeholder="OT-XXXXXX" value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" placeholder="vous@email.ht" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary h-[42px]">
          <Search className="w-4 h-4" /> {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {error && <div className="card p-4 mt-4 text-sm font-medium" style={{ color: 'var(--color-danger)' }}>{error}</div>}

      {resa && (
        <div className="mt-6 space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>RÉFÉRENCE</p>
                <p className="text-xl font-extrabold" style={{ color: 'var(--color-ink)' }}>{resa.reference}</p>
              </div>
              <span className="badge">{STATUT_RESA[resa.statut] ?? resa.statut}</span>
            </div>
            <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>{resa.etablissement.nom}</p>
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>{resa.etablissement.adresse}, {resa.etablissement.commune}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5 space-y-2">
              <p className="text-xs font-bold tracking-widest flex items-center gap-1.5" style={{ color: 'var(--color-ink-3)' }}><CalendarClock className="w-3.5 h-3.5" /> SÉJOUR</p>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Arrivée : {formatDate(resa.dateArrivee)} (dès {resa.etablissement.heureCheckIn})</p>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>Départ : {formatDate(resa.dateDepart)} (avant {resa.etablissement.heureCheckOut})</p>
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}><BedDouble className="w-3.5 h-3.5" /> Chambre {resa.chambre.numero} — {resa.chambre.typeChambre.nom}</p>
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-ink-2)' }}><User className="w-3.5 h-3.5" /> {resa.nombreAdultes} adulte(s), {resa.nombreEnfants} enfant(s)</p>
            </div>

            <div className="card p-5 flex flex-col items-center justify-center">
              {qr ? <img src={qr} alt="QR de la réservation" className="w-40 h-40" /> : <BedDouble className="w-10 h-10" style={{ color: 'var(--color-ink-3)' }} />}
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-ink-3)' }}>Présentez ce code à votre arrivée</p>
            </div>
          </div>

          {resa.facture && (
            <div className="card p-5">
              <p className="text-xs font-bold tracking-widest flex items-center gap-1.5 mb-3" style={{ color: 'var(--color-ink-3)' }}><Receipt className="w-3.5 h-3.5" /> FACTURE</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span style={{ color: 'var(--color-ink-3)' }}>Hébergement</span><span style={{ color: 'var(--color-ink-2)' }}>{fmt(resa.facture.montantHT, resa.facture.devise)}</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--color-ink-3)' }}>Taxes</span><span style={{ color: 'var(--color-ink-2)' }}>{fmt(resa.facture.taxes, resa.facture.devise)}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}><span>Total</span><span>{fmt(resa.facture.montantTotal, resa.facture.devise)}</span></div>
                <div className="flex justify-between pt-1"><span style={{ color: 'var(--color-ink-3)' }}>Statut</span><span style={{ color: 'var(--color-ink-2)' }}>{STATUT_FACTURE[resa.facture.statutPaiement] ?? resa.facture.statutPaiement}</span></div>
              </div>
              <a href={pdfUrl} className="btn btn-secondary w-full mt-4"><Download className="w-4 h-4" /> Télécharger la facture PDF</a>
            </div>
          )}

          {resa.etablissement.politiqueAnnulation && (
            <div className="card p-5">
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'var(--color-ink-3)' }}>POLITIQUE D'ANNULATION</p>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{resa.etablissement.politiqueAnnulation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MaReservationPage() {
  // useSearchParams impose une frontière Suspense en app router.
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-10 text-sm" style={{ color: 'var(--color-ink-3)' }}>Chargement...</div>}>
      <Contenu />
    </Suspense>
  );
}
