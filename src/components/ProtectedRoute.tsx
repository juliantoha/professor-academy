import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'professor' | 'apprentice';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Render:', { loading, hasUser: !!user, hasProfile: !!profile, requiredRole });

  if (loading) {
    console.log('[ProtectedRoute] Showing spinner - loading is true');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get role from profile, or fall back to user metadata (from signup)
  const userRole = profile?.role || user.user_metadata?.role;
  console.log('[ProtectedRoute] Role check:', { userRole, requiredRole, profileRole: profile?.role, metadataRole: user.user_metadata?.role });

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    console.log('[ProtectedRoute] Role mismatch - redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('[ProtectedRoute] Access granted - rendering children');
  return <>{children}</>;
};
