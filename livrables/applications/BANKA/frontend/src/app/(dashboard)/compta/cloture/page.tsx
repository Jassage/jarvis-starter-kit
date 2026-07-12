'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface PeriodeComptable {
  id: string;
  periode: string;
  statut: 'OUVERTE' | 'CLOTUREE';
  clotureeAt?: string | null;
  reouverteAt?: string | null;
}

interface PeriodeRow {
  periode: string;
  statut: 'OUVERTE' | 'CLOTUREE';
  clotureeAt?: string | null;
  estCourantOuFutur: boolean;
}

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const MOIS_LABEL = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function toPeriode(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function labelPeriode(periode: string): string {
  const [annee, mois] = periode.split('-').map(Number);
  return `${MOIS_LABEL[mois - 1]} ${annee}`;
}

export default function CloturePage() {
  const { utilisateur } = useAuthStore();
  const canCloturer = ['SUPER_ADMIN', 'DIRECTEUR'].includes(utilisateur?.role || '');
  const isSuperAdmin = utilisateur?.role === 'SUPER_ADMIN';

  const [periodes, setPeriodes] = useState<PeriodeComptable[]>([]);
  const [loading, setLoading] = useState(true);

  const [target, setTarget] = useState<PeriodeRow | null>(null);
  const [action, setAction] = useState<'cloturer' | 'rouvrir' | null>(null);
  const [equilibre, setEquilibre] = useState<boolean | null>(null);
  const [checkingBilan, setCheckingBilan] = useState(false);
  const [forcer, setForcer] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/compta/cloture/periodes');
      setPeriodes(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // 15 derniers mois, du plus récent au plus ancien, fusionnés avec les statuts connus (OUVERTE par défaut)
  const rows: PeriodeRow[] = (() => {
    const now = new Date();
    const periodeCourante = toPeriode(now);
    const list: PeriodeRow[] = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periode = toPeriode(d);
      const existing = periodes.find((p) => p.periode === periode);
      list.push({
        periode,
        statut: existing?.statut || 'OUVERTE',
        clotureeAt: existing?.clotureeAt,
        estCourantOuFutur: periode >= periodeCourante,
      });
    }
    return list;
  })();

  const openCloturer = async (row: PeriodeRow) => {
    setTarget(row); setAction('cloturer'); setError(''); setForcer(false); setEquilibre(null);
    setCheckingBilan(true);
    try {
      const [annee, mois] = row.periode.split('-').map(Number);
      const finMois = new Date(annee, mois, 0).toISOString().slice(0, 10);
      const { data } = await api.get(`/compta/bilan?date=${finMois}`);
      setEquilibre(!!data.data.equilibre);
    } catch { setEquilibre(null); }
    finally { setCheckingBilan(false); }
  };

  const openRouvrir = (row: PeriodeRow) => {
    setTarget(row); setAction('rouvrir'); setError('');
  };

  const confirmer = async () => {
    if (!target || !action) return;
    setModalLoading(true); setError('');
    try {
      if (action === 'cloturer') {
        await api.post('/compta/cloture', { periode: target.periode, forcerMalgreDesequilibre: forcer || undefined });
      } else {
        await api.post('/compta/cloture/reouvrir', { periode: target.periode });
      }
      setTarget(null); setAction(null);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur');
    } finally { setModalLoading(false); }
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Clôture comptable mensuelle</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>
          Une période clôturée devient immuable : aucune saisie ni suppression manuelle d'écriture ne peut plus y être faite.
        </p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16" style={{ color: '#047857' }}>
            <Spin /><span className="text-sm" style={{ color: '#8b94b0' }}>Chargement...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3c4', background: '#0b1733' }}>Période</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3c4', background: '#0b1733' }}>Statut</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3c4', background: '#0b1733' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.periode} style={{ background: idx % 2 === 0 ? 'white' : '#fafbfc', borderBottom: '1px solid #f0f2f9' }}>
                    <td style={{ padding: '13px 16px' }}>
                      <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>{labelPeriode(row.periode)}</p>
                      {row.estCourantOuFutur && (
                        <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Mois en cours — non clôturable</p>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={row.statut === 'CLOTUREE'
                        ? { background: '#d1fae5', color: '#047857' }
                        : { background: '#f0f2f9', color: '#4a5578' }}>
                        {row.statut === 'CLOTUREE' ? 'Clôturée' : 'Ouverte'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                      {canCloturer && row.statut === 'OUVERTE' && !row.estCourantOuFutur && (
                        <button onClick={() => openCloturer(row)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: '#0b1733', color: 'white' }}>
                          Clôturer
                        </button>
                      )}
                      {isSuperAdmin && row.statut === 'CLOTUREE' && (
                        <button onClick={() => openRouvrir(row)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: '#fef3c7', color: '#b45309' }}>
                          Rouvrir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!target && action === 'rouvrir'}
        title={`Rouvrir la période ${target ? labelPeriode(target.periode) : ''} ?`}
        message="Cette période redevient modifiable : la saisie manuelle et la suppression d'écritures y seront de nouveau possibles. Action réservée au SUPER_ADMIN."
        variant="warning"
        confirmLabel="Rouvrir"
        loading={modalLoading}
        onConfirm={confirmer}
        onCancel={() => { setTarget(null); setAction(null); }}
      />

      {target && action === 'cloturer' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(11,23,51,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setTarget(null); setAction(null); } }}>
          <div className="card w-full max-w-sm p-6">
            <h3 className="font-bold text-base" style={{ color: '#0b1733' }}>Clôturer {labelPeriode(target.periode)} ?</h3>
            <p className="text-sm mt-1.5" style={{ color: '#4a5578' }}>
              Une fois clôturée, plus aucune écriture manuelle ne pourra être saisie ni supprimée sur cette période.
            </p>

            {checkingBilan ? (
              <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: '#8b94b0' }}><Spin /> Vérification du bilan...</div>
            ) : equilibre === false ? (
              <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                Le bilan n'est pas équilibré à la fin de cette période. La clôture sera refusée
                {isSuperAdmin ? ' sauf si vous forcez ci-dessous.' : '.'}
              </div>
            ) : equilibre === true ? (
              <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: '#d1fae5', color: '#047857' }}>
                Bilan équilibré à la fin de cette période.
              </div>
            ) : null}

            {isSuperAdmin && equilibre === false && (
              <label className="flex items-center gap-2 mt-3 text-xs font-medium" style={{ color: '#4a5578' }}>
                <input type="checkbox" checked={forcer} onChange={(e) => setForcer(e.target.checked)} />
                Forcer la clôture malgré le déséquilibre
              </label>
            )}

            {error && <div className="mt-3 p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setTarget(null); setAction(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f9', color: '#4a5578' }}>
                Annuler
              </button>
              <button onClick={confirmer} disabled={modalLoading || checkingBilan || (equilibre === false && !forcer)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: '#0b1733', color: 'white' }}>
                {modalLoading && <Spin />} Clôturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
