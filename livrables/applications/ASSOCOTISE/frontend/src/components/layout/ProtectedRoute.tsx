import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute() {
  const { profil, chargement } = useAuth();

  if (chargement) {
    return <div className="flex min-h-svh items-center justify-center text-[var(--color-muted)]">Chargement…</div>;
  }

  if (!profil) return <Navigate to="/connexion" replace />;

  return <Outlet />;
}
