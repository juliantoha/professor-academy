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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid rgba(0, 74, 105, 0.1)',
            borderTopColor: '#004A69',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
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
