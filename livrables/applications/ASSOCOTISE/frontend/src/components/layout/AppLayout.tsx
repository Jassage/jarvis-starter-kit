import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const titresParChemin: Array<[prefix: string, titre: string]> = [
  ['/membres', 'Membres'],
  ['/cotisations', 'Cotisations'],
  ['/depenses', 'Dépenses'],
  ['/tontine', 'Tontine'],
  ['/utilisateurs', 'Gestion des utilisateurs'],
];

function titrePourChemin(pathname: string): string {
  const trouve = titresParChemin.find(([prefix]) => pathname.startsWith(prefix));
  return trouve?.[1] ?? 'Tableau de bord';
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar titre={titrePourChemin(location.pathname)} />
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
