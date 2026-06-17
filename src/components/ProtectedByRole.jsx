import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ProtectedByRole({ roles = [], fallbackPath = '/login' }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    const redirectMap = {
      admin: '/',
      compliance_officer: '/pii-review',
      user: '/chat',
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return <Outlet />;
}