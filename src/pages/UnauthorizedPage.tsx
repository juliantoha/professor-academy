import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldX, Home, LogOut, Mail } from 'lucide-react';

const UnauthorizedPage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const userRole = profile?.role || user?.user_metadata?.role || 'unknown';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <ShieldX size={40} color="#DC2626" />
        </div>

        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '24px',
          fontWeight: 700,
          color: '#004A69',
          margin: '0 0 0.75rem 0'
        }}>
          Access Restricted
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#6B7280',
          margin: '0 0 2rem 0',
          lineHeight: 1.6
        }}>
          {userRole === 'apprentice' ? (
            <>
              As an apprentice, you access your dashboard through the personalized link sent to your email.
              <br /><br />
              Check your inbox for an email from your professor containing your dashboard link.
            </>
          ) : (
            <>
              You don't have permission to access this page.
              Please contact your administrator if you believe this is an error.
            </>
          )}
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {userRole === 'apprentice' && (
            <div style={{
              background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
              border: '2px solid #0066A2',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#004A69',
                fontSize: '14px',
                fontWeight: 600
              }}>
                <Mail size={18} />
                Check your email for your dashboard link
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,74,105,0.3)'
            }}
          >
            <Home size={18} />
            Go to Home
          </button>

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              fontSize: '15px',
              fontWeight: 600,
              color: '#DC2626',
              background: 'transparent',
              border: '2px solid #FCA5A5',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {user && (
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            margin: '1.5rem 0 0 0'
          }}>
            Signed in as: {user.email}
            <br />
            Role: {userRole}
          </p>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
