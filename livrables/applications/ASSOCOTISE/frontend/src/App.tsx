import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ParametresProvider } from './contexts/ParametresContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleGate } from './components/layout/RoleGate';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';

// Écrans chargés à la demande. Les graphes (recharts) et les écrans réservés au
// responsable finances ne sont pas téléchargés tant qu'on n'y va pas : sur une connexion
// lente, l'écran de connexion et les pages courantes doivent arriver seuls.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const MembresListe = lazy(() => import('./pages/Membres/Liste').then((m) => ({ default: m.MembresListe })));
const MembreFiche = lazy(() => import('./pages/Membres/Fiche').then((m) => ({ default: m.MembreFiche })));
const Cotisations = lazy(() => import('./pages/Cotisations').then((m) => ({ default: m.Cotisations })));
const Relances = lazy(() => import('./pages/Relances').then((m) => ({ default: m.Relances })));
const DepensesListe = lazy(() => import('./pages/Depenses/Liste').then((m) => ({ default: m.DepensesListe })));
const UtilisateursListe = lazy(() =>
  import('./pages/Utilisateurs/Liste').then((m) => ({ default: m.UtilisateursListe }))
);
const Parametres = lazy(() => import('./pages/Parametres').then((m) => ({ default: m.Parametres })));
const Journal = lazy(() => import('./pages/Journal').then((m) => ({ default: m.Journal })));
const Exercices = lazy(() => import('./pages/Exercices').then((m) => ({ default: m.Exercices })));
const Rapports = lazy(() => import('./pages/Rapports').then((m) => ({ default: m.Rapports })));

function Chargement() {
  return <p className="p-6 text-sm text-[var(--color-muted)]">Chargement…</p>;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ParametresProvider>
            <Suspense fallback={<Chargement />}>
              <Routes>
                <Route path="/connexion" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="membres" element={<MembresListe />} />
                    <Route path="membres/:id" element={<MembreFiche />} />
                    <Route path="cotisations" element={<Cotisations />} />
                    <Route path="relances" element={<Relances />} />

                    <Route element={<RoleGate roles={['responsable_finances']} />}>
                      <Route path="depenses" element={<DepensesListe />} />
                      <Route path="utilisateurs" element={<UtilisateursListe />} />
                      <Route path="parametres" element={<Parametres />} />
                      <Route path="journal" element={<Journal />} />
                      <Route path="exercices" element={<Exercices />} />
                      <Route path="rapports" element={<Rapports />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </ParametresProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
