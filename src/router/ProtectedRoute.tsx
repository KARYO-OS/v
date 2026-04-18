import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFeatureStore } from '../store/featureStore';
import { isPathEnabled } from '../lib/featureFlags';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ROLE_DEFAULT_PATH: Record<Role, string> = {
  admin: '/admin/dashboard',
  komandan: '/komandan/dashboard',
  prajurit: '/prajurit/dashboard',
  guard: '/guard/gatepass-scan',
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const { pathname } = useLocation();
  const { flags, isLoaded, loadFeatureFlags } = useFeatureStore();

  useEffect(() => {
    if (!user) return;
    if (isLoaded) return;
    void loadFeatureFlags();
  }, [user, isLoaded, loadFeatureFlags]);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DEFAULT_PATH[user.role]} replace />;
  }

  if (!isLoaded) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isPathEnabled(pathname, flags)) {
    return <Navigate to={ROLE_DEFAULT_PATH[user.role]} replace />;
  }

  return <Outlet />;
}
