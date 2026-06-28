'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatMontant, formatMontantCompact } from '@/lib/utils';

interface RHStats {
  employes: number;
  employesActifs: number;
  masseSalariale: number;
  contratsActifs: number;
  congesEnAttente: number;
}

interface PointageJour {
  presents: number;
  retards: number;
  absents: number;
  nonPointes: number;
  total: number;
}

const NAV = [
  { href: '/rh/employes',  label: 'Employés',          desc: 'Personnel actif',           icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', color: '#7c3aed', bg: '#f5f3ff' },
  { href: '/rh/postes',    label: 'Postes & Métiers',   desc: 'Référentiel postes',        icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: '#1e40af', bg: '#eef2ff' },
  { href: '/rh/contrats',  label: 'Contrats',           desc: 'Contrats de travail',       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#047857', bg: '#ecfdf5' },
  { href: '/rh/paie',      label: 'Gestion de la paie', desc: 'Bulletins et virements',    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: '#b45309', bg: '#fffbeb' },
  { href: '/rh/conges',    label: 'Congés & Absences',  desc: 'Demandes et planification', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#b91c1c', bg: '#fef2f2' },
  { href: '/rh/pointage',  label: 'Pointage',           desc: 'Présences et biométrique',  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#0369a1', bg: '#f0f9ff' },
];

export default function RHDashboardPage() {
  const [stats, setStats] = useState<RHStats | null>(null);
  const [pointageJour, setPointageJour] = useState<PointageJour | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get('/rh/employes?limit=1'),
      api.get('/rh/employes?statut=ACTIF&limit=1000'),
      api.get('/rh/contrats?statut=ACTIF&limit=1'),
      api.get('/rh/conges?statut=EN_ATTENTE&limit=1'),
      api.get(`/rh/pointage/journalier?date=${today}`).catch(() => null),
    ]).then(([emp, empActif, contrats, conges, pointage]) => {
      const total    = emp.data.data.total as number;
      const employes = empActif.data.data.items as any[];
      const actifs   = empActif.data.data.total as number;
      const masse    = employes.reduce((s: number, e: any) => s + Number(e.salaireBrut), 0);
      setStats({
        employes: total,
        employesActifs: actifs,
        masseSalariale: masse,
        contratsActifs: contrats.data.data.total,
        congesEnAttente: conges.data.data.total,
      });
      if (pointage) {
        const liste = pointage.data.data as any[];
        setPointageJour({
          total:      liste.length,
          presents:   liste.filter((e) => e.pointage?.statut === 'PRESENT').length,
          retards:    liste.filter((e) => e.pointage?.statut === 'RETARD').length,
          absents:    liste.filter((e) => e.pointage?.statut === 'ABSENT').length,
          nonPointes: liste.filter((e) => !e.pointage).length,
        });
      }
    }).catch(() => {});
  }, []);

  const kpis = stats ? [
    { label: 'Employés actifs',      value: stats.employesActifs,    total: stats.employes,        suffix: '', color: '#7c3aed', bg: '#f5f3ff', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z' },
    { label: 'Masse salariale brute', value: stats.masseSalariale,   total: null,                  suffix: 'HTG', color: '#047857', bg: '#ecfdf5', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Contrats actifs',       value: stats.contratsActifs,   total: null,                  suffix: '', color: '#1e40af', bg: '#eef2ff', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Congés en attente',     value: stats.congesEnAttente,  total: null,                  suffix: '', color: '#b91c1c', bg: '#fef2f2', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ] : [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0b1733' }}>Ressources humaines</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>Gestion du personnel, contrats, paie et congés</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 w-24 rounded" style={{ background: '#f0f2f9' }} />
              <div className="h-7 w-16 rounded mt-3" style={{ background: '#f0f2f9' }} />
            </div>
          ))
        ) : kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: '#8b94b0' }}>{k.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: k.color }}>
                  <path d={k.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <p title={k.suffix === 'HTG' ? formatMontant(k.value, 'HTG') : undefined} className="text-2xl font-bold" style={{ color: k.color }}>
              {k.suffix === 'HTG' ? formatMontantCompact(k.value, 'HTG') : k.value.toLocaleString('fr-FR')}
            </p>
            {k.total !== null && (
              <p className="text-xs mt-1" style={{ color: '#8b94b0' }}>{k.total} au total</p>
            )}
          </div>
        ))}
      </div>

      {/* Pointage du jour */}
      {pointageJour && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm tracking-tight" style={{ color: '#0b1733' }}>Pointage du jour</h3>
              <p className="text-xs mt-0.5" style={{ color: '#8b94b0' }}>{pointageJour.total} employés actifs</p>
            </div>
            <Link href="/rh/pointage" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#0369a1' }}>
              Saisir <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Présents',    value: pointageJour.presents,   color: '#047857', bg: '#d1fae5' },
              { label: 'Retards',     value: pointageJour.retards,    color: '#b45309', bg: '#fef3c7' },
              { label: 'Absents',     value: pointageJour.absents,    color: '#b91c1c', bg: '#fee2e2' },
              { label: 'Non pointés', value: pointageJour.nonPointes, color: '#8b94b0', bg: '#f0f2f9' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
          {pointageJour.total > 0 && (
            <div className="mt-3 h-2 rounded-full overflow-hidden flex" style={{ background: '#f0f2f9' }}>
              <div style={{ width: `${(pointageJour.presents / pointageJour.total) * 100}%`, background: '#10b981' }} />
              <div style={{ width: `${(pointageJour.retards / pointageJour.total) * 100}%`, background: '#f59e0b' }} />
              <div style={{ width: `${(pointageJour.absents / pointageJour.total) * 100}%`, background: '#ef4444' }} />
            </div>
          )}
        </div>
      )}

      {/* Modules */}
      <div>
        <p className="text-sm font-semibold mb-3" style={{ color: '#4a5578' }}>Modules</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {NAV.map((m) => (
            <Link key={m.href} href={m.href} className="card p-5 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: m.color }}>
                  <path d={m.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: '#0b1733' }}>{m.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#8b94b0' }}>{m.desc}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#8b94b0' }}>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
