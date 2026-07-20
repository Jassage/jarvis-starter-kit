import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleGate } from './components/layout/RoleGate';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MembresListe } from './pages/Membres/Liste';
import { MembreFiche } from './pages/Membres/Fiche';
import { Cotisations } from './pages/Cotisations';
import { DepensesListe } from './pages/Depenses/Liste';
import { UtilisateursListe } from './pages/Utilisateurs/Liste';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/connexion" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="membres" element={<MembresListe />} />
                <Route path="membres/:id" element={<MembreFiche />} />
                <Route path="cotisations" element={<Cotisations />} />

                <Route element={<RoleGate roles={['responsable_finances']} />}>
                  <Route path="depenses" element={<DepensesListe />} />
                  <Route path="utilisateurs" element={<UtilisateursListe />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
