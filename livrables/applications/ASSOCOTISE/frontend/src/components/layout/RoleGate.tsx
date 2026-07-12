import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';

export function RoleGate({ roles }: { roles: Role[] }) {
  const { profil } = useAuth();
  if (!profil || !roles.includes(profil.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
