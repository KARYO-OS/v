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

const ROLE_FALLBACK_PATHS: Record<Role, string[]> = {
  admin: ['/admin/dashboard', '/admin/settings'],
  komandan: ['/komandan/dashboard', '/komandan/tasks', '/komandan/attendance'],
  prajurit: ['/prajurit/dashboard', '/prajurit/profile'],
  guard: ['/guard/gatepass-scan'],
};

function getRoleFallbackPath(role: Role, flags: ReturnType<typeof useFeatureStore.getState>['flags']): string | null {
  const candidates = ROLE_FALLBACK_PATHS[role] ?? [];
  return candidates.find((path) => isPathEnabled(path, flags)) ?? null;
}

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
    const fallbackPath = getRoleFallbackPath(user.role, flags);
    if (!fallbackPath || fallbackPath === pathname) {
      return (
        <Navigate
          to="/error"
          replace
          state={{
            code: '403',
            message: 'Modul untuk peran Anda sedang dinonaktifkan oleh admin.',
          }}
        />
      );
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
