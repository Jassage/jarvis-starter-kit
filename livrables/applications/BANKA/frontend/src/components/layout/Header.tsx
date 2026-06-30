'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { useSSE } from '@/lib/useSSE';

const PAGES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':     { title: 'Tableau de bord',    subtitle: "Vue d'ensemble de votre activité bancaire" },
  '/clients':       { title: 'Clients',             subtitle: 'Gestion de la base clients et KYC' },
  '/comptes':       { title: 'Comptes',             subtitle: "Comptes d'épargne, courants et à terme" },
  '/transactions':  { title: 'Transactions',        subtitle: 'Dépôts, retraits, virements et validations' },
  '/caisse':        { title: 'Caisse',              subtitle: 'Ouverture, fermeture et arrêté de caisse' },
  '/prets':         { title: 'Crédits & Prêts',     subtitle: 'Dossiers, approbations et remboursements' },
  '/rapports':      { title: 'Rapports',            subtitle: 'Analyses opérationnelles et indicateurs de risque' },
  '/audit':         { title: "Journal d'audit",     subtitle: 'Traçabilité complète de toutes les opérations' },
  '/utilisateurs':  { title: 'Opérateurs',          subtitle: 'Gestion des comptes utilisateurs' },
  '/agences':       { title: 'Agences',             subtitle: 'Réseau des agences' },
  '/administration':      { title: 'Administration',         subtitle: 'Paramètres système' },
  '/epargne-programmee':  { title: 'Épargne programmée',     subtitle: 'Virements automatiques récurrents entre comptes' },
  '/taux-change':         { title: 'Taux de change',         subtitle: 'Gestion des taux HTG/USD et virements cross-devise' },
  '/aml':                 { title: 'Alertes AML',            subtitle: 'Détection de transactions suspectes et anti-blanchiment' },
  '/rapport-brh':         { title: 'Rapport BRH',            subtitle: 'Ratios prudentiels réglementaires (Banque de la République d\'Haïti)' },
  '/compta/dashboard':    { title: 'Tableau de bord',        subtitle: "Vue d'ensemble comptable" },
  '/compta/plan-comptable':{ title: 'Plan comptable',        subtitle: 'Nomenclature des comptes' },
  '/compta/journal':      { title: 'Journal des écritures',  subtitle: 'Saisie et consultation des écritures' },
  '/compta/grand-livre':  { title: 'Grand livre',            subtitle: 'Mouvements par compte' },
  '/compta/bilan':        { title: 'Bilan',                  subtitle: 'Actif, Passif et Capitaux propres' },
  '/compta/resultat':     { title: 'Compte de résultat',     subtitle: 'Produits, Charges et Résultat net' },
  '/rh/dashboard':        { title: 'Tableau de bord RH',     subtitle: "Vue d'ensemble des ressources humaines" },
  '/rh/employes':         { title: 'Employés',               subtitle: 'Gestion du personnel' },
  '/rh/postes':           { title: 'Postes & Métiers',       subtitle: 'Référentiel des postes' },
  '/rh/contrats':         { title: 'Contrats',               subtitle: 'Contrats de travail' },
  '/rh/paie':             { title: 'Gestion de la paie',     subtitle: 'Bulletins et virements salariaux' },
  '/rh/conges':           { title: 'Congés & Absences',      subtitle: 'Demandes et planification' },
};

interface Alertes {
  txEnAttente: number;
  pretsEnRetard: number;
  echeancesAujourdhui: number;
  total: number;
}

export default function Header() {
  const pathname = usePathname();
  const { utilisateur } = useAuthStore();
  const page = PAGES[pathname] || PAGES['/' + pathname.split('/').slice(1, 3).join('/')] || PAGES['/' + pathname.split('/')[1]] || { title: 'BANKA ERP', subtitle: '' };

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const [alertes, setAlertes] = useState<Alertes | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [sseFlash, setSseFlash] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const loadAlertes = useCallback(() => {
    api.get('/stats/alertes').then(({ data }) => setAlertes(data.data)).catch(() => {});
  }, []);

  useSSE((msg) => {
    if (msg.type === 'TRANSACTION_EN_ATTENTE') {
      setSseFlash(true);
      setTimeout(() => setSseFlash(false), 3000);
      setAlertes((prev) => prev ? { ...prev, txEnAttente: (prev.txEnAttente || 0) + 1, total: (prev.total || 0) + 1 } : prev);
    }
    if (msg.type === 'ALERTE_AML') {
      setSseFlash(true);
      setTimeout(() => setSseFlash(false), 3000);
    }
  }, !!utilisateur);

  useEffect(() => {
    loadAlertes();
    const interval = setInterval(loadAlertes, 60_000);
    return () => clearInterval(interval);
  }, [loadAlertes]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasAlertes = (alertes?.total ?? 0) > 0;

  return (
    <header className="h-[72px] px-8 flex items-center justify-between" style={{ background: '#fff', borderBottom: '1px solid #e7eaf3' }}>
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0b1733' }}>{page.title}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: '#f7f8fc' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#4a5578' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium capitalize" style={{ color: '#4a5578' }}>{today}</span>
        </div>

        {/* Cloche notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: showNotif || sseFlash ? '#eef2ff' : '#f7f8fc', transition: 'background 0.3s' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#4a5578' }}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {hasAlertes && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold px-1" style={{ background: '#ef4444', color: 'white' }}>
                {(alertes?.total ?? 0) > 9 ? '9+' : alertes?.total}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl z-50 overflow-hidden" style={{ background: 'white', border: '1px solid #e7eaf3' }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f2f9' }}>
                <p className="font-bold text-sm" style={{ color: '#0b1733' }}>Alertes</p>
                <button onClick={loadAlertes} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f0f2f9' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" style={{ color: '#4a5578' }}>
                    <path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {!hasAlertes ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: '#ecfdf5' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#047857' }}>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Tout est en ordre</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>Aucune alerte active</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: '#f0f2f9' }}>
                  {(alertes?.txEnAttente ?? 0) > 0 && (
                    <Link href="/transactions?statut=EN_ATTENTE" onClick={() => setShowNotif(false)}>
                      <div className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-amber-50">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fffbeb' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#b45309' }}>
                            <path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Transactions en attente</p>
                          <p className="text-xs" style={{ color: '#8b94b0' }}>Validation superviseur requise</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#fffbeb', color: '#b45309' }}>{alertes?.txEnAttente}</span>
                      </div>
                    </Link>
                  )}
                  {(alertes?.pretsEnRetard ?? 0) > 0 && (
                    <Link href="/rapports" onClick={() => setShowNotif(false)}>
                      <div className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-red-50">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef2f2' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#b91c1c' }}>
                            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Prêts en retard</p>
                          <p className="text-xs" style={{ color: '#8b94b0' }}>Dossiers avec impayés</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#fef2f2', color: '#b91c1c' }}>{alertes?.pretsEnRetard}</span>
                      </div>
                    </Link>
                  )}
                  {(alertes?.echeancesAujourdhui ?? 0) > 0 && (
                    <Link href="/prets" onClick={() => setShowNotif(false)}>
                      <div className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-blue-50">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eef2ff' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#1e40af' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>Échéances aujourd'hui</p>
                          <p className="text-xs" style={{ color: '#8b94b0' }}>Remboursements à encaisser</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#eef2ff', color: '#1e40af' }}>{alertes?.echeancesAujourdhui}</span>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-3 ml-1" style={{ borderLeft: '1px solid #e7eaf3' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <span className="text-white text-sm font-bold">
              {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: '#0b1733' }}>{utilisateur?.prenom} {utilisateur?.nom}</p>
            <p className="text-xs leading-tight" style={{ color: '#8b94b0' }}>{utilisateur?.agence?.nom || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
