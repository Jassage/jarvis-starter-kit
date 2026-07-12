'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useClientStore } from '@/stores/clientStore';
import { useToastStore } from '@/stores/toastStore';
import api from '@/lib/api';
import { nomClient, formatMontant, formatDate, TYPE_COMPTE_LABELS, STATUT_PRET_LABELS } from '@/lib/utils';
import ClientForm from '@/components/clients/ClientForm';
import CompteForm from '@/components/comptes/CompteForm';
import ClientDocuments from '@/components/clients/ClientDocuments';

const STATUT_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ACTIF:      { label: 'Actif',      color: '#047857', bg: '#ecfdf5', border: '#6ee7b7' },
  SUSPENDU:   { label: 'Suspendu',   color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
  BLACKLISTE: { label: 'Blacklisté', color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5' },
  INACTIF:    { label: 'Inactif',    color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' },
};

export default function ClientDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { fetchClient } = useClientStore();
  const toast = useToastStore();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showCompteForm, setShowCompteForm] = useState(false);
  const [changingStatut, setChangingStatut] = useState(false);

  const load = async () => {
    try {
      const data = await fetchClient(id);
      setClient(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatutChange = async (nouveauStatut: string) => {
    if (changingStatut) return;
    setChangingStatut(true);
    try {
      await api.put(`/clients/${id}`, { statut: nouveauStatut });
      toast.success('Statut mis à jour', `Le client est maintenant ${STATUT_META[nouveauStatut]?.label || nouveauStatut}.`);
      await load();
    } catch {
      toast.error('Erreur', 'Impossible de modifier le statut.');
    } finally {
      setChangingStatut(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
        <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  );
  if (!client) return <div className="text-center py-12 text-sm" style={{ color: '#8b94b0' }}>Client introuvable</div>;

  const statutMeta = STATUT_META[client.statut] || STATUT_META.INACTIF;
  const initiales = client.type === 'ENTREPRISE'
    ? (client.raisonSociale || '').slice(0, 2).toUpperCase()
    : `${client.prenom?.[0] || ''}${client.nom?.[0] || ''}`.toUpperCase();

  const totalHTG = client.comptes
    ?.filter((c: any) => c.devise === 'HTG' && c.statut === 'ACTIF')
    .reduce((s: number, c: any) => s + Number(c.solde), 0) || 0;
  const totalUSD = client.comptes
    ?.filter((c: any) => c.devise === 'USD' && c.statut === 'ACTIF')
    .reduce((s: number, c: any) => s + Number(c.solde), 0) || 0;
  const comptesActifs = client.comptes?.filter((c: any) => c.statut === 'ACTIF').length || 0;
  const pretsActifs = client.prets?.filter((p: any) => ['EN_COURS', 'EN_ATTENTE'].includes(p.statut)).length || 0;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/clients" className="flex items-center gap-1.5 font-medium transition-colors" style={{ color: '#8b94b0' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#8b94b0'}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Clients
        </Link>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span className="font-medium truncate" style={{ color: '#0b1733' }}>{nomClient(client)}</span>
      </div>

      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
              {initiales}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold" style={{ color: 'white' }}>{nomClient(client)}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  {client.type === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'}
                </span>
              </div>
              <p className="text-sm font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{client.numeroClient}</p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: statutMeta.bg, color: statutMeta.color }}>
                {statutMeta.label}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Modifier
            </button>
            <button onClick={() => setShowCompteForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: 'white', color: '#1e3a8a' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7ff'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Ouvrir un compte
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 divide-x" style={{ borderTop: '1px solid #f0f2f9' }}>
          {[
            { label: 'Comptes actifs', value: comptesActifs, suffix: '' },
            { label: 'Solde total HTG', value: formatMontant(totalHTG, 'HTG'), suffix: '' },
            { label: 'Solde total USD', value: formatMontant(totalUSD, 'USD'), suffix: '' },
            { label: 'Prêts actifs', value: pretsActifs, suffix: '' },
          ].map((kpi) => (
            <div key={kpi.label} className="px-5 py-4">
              <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>{kpi.label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: '#0b1733' }}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left: infos + statut */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: '#0b1733' }}>Coordonnées</h3>
            <div className="space-y-3">
              {[
                { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: 'Téléphone', value: client.telephone },
                { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email', value: client.email },
                { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', label: 'Adresse', value: client.adresse },
                { icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Profession', value: client.profession },
                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Membre depuis', value: formatDate(client.createdAt) },
              ].filter(row => row.value).map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#f0f2f9' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#4a5578' }}><path d={row.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#8b94b0' }}>{row.label}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: '#0b1733' }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statut actions */}
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#0b1733' }}>Actions sur le compte</h3>
            <div className="space-y-2">
              {client.statut === 'ACTIF' && (
                <button onClick={() => handleStatutChange('SUSPENDU')} disabled={changingStatut}
                  className="w-full text-sm py-2 px-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}>
                  Suspendre le compte
                </button>
              )}
              {client.statut === 'SUSPENDU' && (
                <button onClick={() => handleStatutChange('ACTIF')} disabled={changingStatut}
                  className="w-full text-sm py-2 px-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #6ee7b7' }}>
                  Réactiver le compte
                </button>
              )}
              {client.statut !== 'BLACKLISTE' && (
                <button onClick={() => handleStatutChange('BLACKLISTE')} disabled={changingStatut}
                  className="w-full text-sm py-2 px-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                  Blacklister
                </button>
              )}
              {client.statut === 'BLACKLISTE' && (
                <button onClick={() => handleStatutChange('ACTIF')} disabled={changingStatut}
                  className="w-full text-sm py-2 px-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #6ee7b7' }}>
                  Lever le blacklist
                </button>
              )}
            </div>
          </div>

          <ClientDocuments clientId={client.id} />
        </div>

        {/* Right: comptes + prêts */}
        <div className="col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: '#0b1733' }}>Comptes ({client.comptes?.length || 0})</h3>
              <button onClick={() => setShowCompteForm(true)} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors" style={{ background: '#eef2ff', color: '#2563eb' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#eef2ff'}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                Nouveau compte
              </button>
            </div>
            {!client.comptes?.length ? (
              <div className="text-center py-8" style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 mx-auto mb-2 opacity-40"><path d="M20 12V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-2M22 12h-6a2 2 0 100 4h6v-4z" stroke="currentColor" strokeWidth="1.5"/></svg>
                <p className="text-sm">Aucun compte ouvert</p>
              </div>
            ) : (
              <div className="space-y-2">
                {client.comptes.map((compte: any) => (
                  <Link key={compte.id} href={`/comptes/${compte.id}`}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{ background: '#f7f8fc', border: '1px solid #f0f2f9' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d7fd'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f7f8fc'; e.currentTarget.style.borderColor = '#f0f2f9'; }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#eef2ff' }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#2563eb' }}><path d="M20 12V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-2M22 12h-6a2 2 0 100 4h6v-4z" stroke="currentColor" strokeWidth="1.8"/></svg>
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold" style={{ color: '#0b1733' }}>{compte.numeroCompte}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{TYPE_COMPTE_LABELS[compte.type]} · {compte.devise} · {compte.agence?.nom}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: Number(compte.solde) >= 0 ? '#1e40af' : '#b91c1c' }}>
                        {formatMontant(compte.solde, compte.devise)}
                      </p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: compte.statut === 'ACTIF' ? '#047857' : '#8b94b0' }}>{compte.statut}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-4" style={{ color: '#0b1733' }}>Prêts ({client.prets?.length || 0})</h3>
            {!client.prets?.length ? (
              <div className="text-center py-8" style={{ color: '#8b94b0' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 mx-auto mb-2 opacity-40"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" stroke="currentColor" strokeWidth="1.5"/></svg>
                <p className="text-sm">Aucun prêt enregistré</p>
              </div>
            ) : (
              <div className="space-y-2">
                {client.prets.map((pret: any) => {
                  const pct = pret.montant > 0 ? Math.min(100, Math.round((1 - pret.resteARegler / pret.montant) * 100)) : 0;
                  const statutColors: Record<string, string> = { EN_COURS: '#2563eb', EN_ATTENTE: '#b45309', SOLDE: '#047857', REFUSE: '#b91c1c', EN_DEFAUT: '#7c2d12' };
                  return (
                    <Link key={pret.id} href={`/prets/${pret.id}`}
                      className="block p-3 rounded-xl transition-colors"
                      style={{ background: '#f7f8fc', border: '1px solid #f0f2f9' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d7fd'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f7f8fc'; e.currentTarget.style.borderColor = '#f0f2f9'; }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-mono text-sm font-semibold" style={{ color: '#0b1733' }}>{pret.reference}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{formatMontant(pret.montant, pret.devise)} · {pret.dureeMois} mois</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: '#b45309' }}>{formatMontant(pret.resteARegler, pret.devise)} restant</p>
                          <p className="text-xs mt-0.5 font-medium" style={{ color: statutColors[pret.statut] || '#8b94b0' }}>{STATUT_PRET_LABELS[pret.statut]}</p>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#e7eaf3' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }} />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: '#8b94b0' }}>{pct}% remboursé</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && <ClientForm initial={client} onClose={() => setShowEdit(false)} onSuccess={() => { setShowEdit(false); load(); }} />}
      {showCompteForm && <CompteForm clientId={client.id} onClose={() => setShowCompteForm(false)} onSuccess={() => { setShowCompteForm(false); load(); }} />}
    </div>
  );
}
