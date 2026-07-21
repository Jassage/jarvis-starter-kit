import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BandeauHorsLigne } from './BandeauHorsLigne';

const titresParChemin: Array<[prefix: string, titre: string]> = [
  ['/membres', 'Membres'],
  ['/cotisations', 'Cotisations'],
  ['/relances', 'Relances'],
  ['/depenses', 'Dépenses'],
  ['/utilisateurs', 'Gestion des utilisateurs'],
  ['/rapports', 'Rapports'],
  ['/exercices', 'Exercices comptables'],
  ['/journal', "Journal d'audit"],
  ['/parametres', 'Paramètres'],
];

function titrePourChemin(pathname: string): string {
  const trouve = titresParChemin.find(([prefix]) => pathname.startsWith(prefix));
  return trouve?.[1] ?? 'Tableau de bord';
}

export function AppLayout() {
  const location = useLocation();
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  useEffect(() => setSidebarOuverte(false), [location.pathname]);

  return (
    <div className="flex h-svh overflow-hidden">
      <div className="fond-decoratif" aria-hidden="true" />
      <Sidebar open={sidebarOuverte} onClose={() => setSidebarOuverte(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BandeauHorsLigne />
        <Topbar titre={titrePourChemin(location.pathname)} onOuvrirMenu={() => setSidebarOuverte(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
