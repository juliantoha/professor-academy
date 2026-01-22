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
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Animated Logo/Brand Mark */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
            boxShadow: '0 10px 40px rgba(0, 50, 80, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse-glow 2s ease-in-out infinite'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

          {/* Loading Text */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#003250',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite'
            }}>
              Professor Academy
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
              <span style={{ animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.1s' }}>Loading</span>
              <span style={{ display: 'flex', gap: '2px' }}>
                <span style={{ animation: 'bounce 1s ease-in-out infinite' }}>.</span>
                <span style={{ animation: 'bounce 1s ease-in-out infinite 0.15s' }}>.</span>
                <span style={{ animation: 'bounce 1s ease-in-out infinite 0.3s' }}>.</span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '200px',
            height: '4px',
            background: 'rgba(0, 74, 105, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, #004A69, #0066A2)',
              borderRadius: '2px',
              animation: 'loading-bar 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 10px 40px rgba(0, 50, 80, 0.25);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 15px 50px rgba(0, 50, 80, 0.35);
              transform: scale(1.02);
            }
          }
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(150%); }
          }
        `}</style>
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
