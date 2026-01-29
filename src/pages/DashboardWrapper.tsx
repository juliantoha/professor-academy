import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import MasqueradeBanner from '../components/MasqueradeBanner';
import { LogOut, Settings, ChevronDown, ArrowLeft } from 'lucide-react';

const DashboardWrapper = () => {
  const { dashboardToken } = useParams<{ dashboardToken: string }>();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // Track masquerade status in state (check URL params first, then sessionStorage)
  const [isMasquerading, setIsMasquerading] = useState(() => {
    // Check if URL has masquerade params (for new tab) or sessionStorage (for refresh)
    const params = new URLSearchParams(window.location.search);
    return params.get('masquerade') === 'true' || sessionStorage.getItem('adminMasqueradeActive') === 'true';
  });

  // Initialize masquerade from URL params (since sessionStorage isn't shared between tabs)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('masquerade') === 'true') {
      // Store masquerade info in this tab's sessionStorage
      sessionStorage.setItem('adminMasqueradeActive', 'true');
      sessionStorage.setItem('adminOriginalEmail', params.get('adminEmail') || '');
      sessionStorage.setItem('masqueradeEmail', params.get('masqueradeEmail') || '');
      sessionStorage.setItem('masqueradeName', params.get('masqueradeName') || '');
      sessionStorage.setItem('masqueradeType', params.get('masqueradeType') || '');
      setIsMasquerading(true);
      // Clean up URL by removing masquerade params (for cleaner URL)
      if (dashboardToken) {
        window.history.replaceState({}, '', `/dashboard/${dashboardToken}`);
      }
    }
  }, [location.search, dashboardToken]);

  const displayName = profile?.firstName || profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!dashboardToken) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        fontFamily: 'Lato, sans-serif'
      }}>
        <h1 style={{ color: '#DC2626' }}>Invalid Dashboard Token</h1>
        <p style={{ color: '#6B7280' }}>Please check the URL and try again.</p>
      </div>
    );
  }

  // If user is logged in, show header with profile dropdown
  if (user) {
    return (
      <div style={{ fontFamily: 'Lato, sans-serif', paddingTop: isMasquerading ? '52px' : '0' }}>
        <MasqueradeBanner />
        {/* Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
          padding: '0.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 100
        }}>
          {/* Back Button for Professors */}
          <div>
            {(profile?.role === 'professor' || profile?.role === 'admin') && (
              <button
                onClick={() => navigate('/professor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
            )}
          </div>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                if (!showProfileMenu) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: profile?.avatarUrl
                  ? `url(${profile.avatarUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {!profile?.avatarUrl && (
                  <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'white'
                  }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span>{displayName}</span>
              <ChevronDown size={16} style={{
                transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 20,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1F2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {profile?.firstName && profile?.lastName
                        ? `${profile.firstName} ${profile.lastName}`
                        : displayName}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      margin: 0
                    }}>
                      {user?.email}
                    </p>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Navigate to appropriate settings based on role
                        const userRole = profile?.role || user.user_metadata?.role;
                        if (userRole === 'professor' || userRole === 'admin') {
                          navigate('/settings');
                        } else {
                          navigate('/apprentice/settings');
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F3F4F6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Settings size={18} color="#6B7280" />
                      <span style={{ fontSize: '14px', color: '#1F2937' }}>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleSignOut();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <LogOut size={18} color="#DC2626" />
                      <span style={{ fontSize: '14px', color: '#DC2626' }}>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <Dashboard dashboardToken={dashboardToken} />
      </div>
    );
  }

  // Public access (no user logged in) - just show dashboard without header
  // But still show masquerade banner if admin is viewing
  return (
    <div style={{ paddingTop: isMasquerading ? '52px' : '0' }}>
      <MasqueradeBanner />
      <Dashboard dashboardToken={dashboardToken} />
    </div>
  );
};

export default DashboardWrapper;
