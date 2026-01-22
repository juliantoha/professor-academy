import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Dashboard from './Dashboard';
import { LogOut, Settings, ChevronDown, AlertCircle, Clock, RefreshCw, Mail } from 'lucide-react';

const ApprenticeDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboardToken, setDashboardToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waitingForProfessor, setWaitingForProfessor] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = profile?.firstName || profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';

  const fetchDashboardToken = async () => {
    try {
      setLoading(true);
      setError('');
      setWaitingForProfessor(false);

      // Look up the apprentice record by email
      const { data, error: fetchError } = await supabase
        .from('apprentices')
        .select('dashboardToken')
        .eq('email', user?.email)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No record found - apprentice signed up before professor added them
          setWaitingForProfessor(true);
        } else {
          throw fetchError;
        }
        return;
      }

      if (data?.dashboardToken) {
        setDashboardToken(data.dashboardToken);
      } else {
        setError('Dashboard not configured. Please contact your professor.');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard token:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchDashboardToken();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: 'Lato, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
            border: '4px solid #E5E7EB',
            borderTopColor: '#0066A2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#004A69', fontWeight: 500 }}>Loading your dashboard...</span>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Friendly waiting state when apprentice signs up before professor adds them
  if (waitingForProfessor) {
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
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '3px solid #F59E0B'
          }}>
            <Clock size={48} color="#D97706" />
          </div>

          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '26px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 0.5rem 0'
          }}>
            Almost There!
          </h1>

          <p style={{
            fontSize: '17px',
            color: '#D97706',
            fontWeight: 600,
            margin: '0 0 1.5rem 0'
          }}>
            Waiting for your professor to set up your dashboard
          </p>

          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '2px solid rgba(0,102,162,0.2)',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '15px',
              color: '#004A69',
              margin: '0 0 1rem 0',
              lineHeight: 1.6
            }}>
              <strong>What's happening?</strong>
            </p>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: '0 0 1rem 0',
              lineHeight: 1.7
            }}>
              Your account is created successfully! Your professor just needs to add you to their studio before you can access your training dashboard.
            </p>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: 0,
              lineHeight: 1.7
            }}>
              <strong>What to do:</strong> Reach out to your professor and let them know you've signed up with this email. They'll add you to the system, and you'll be good to go!
            </p>
          </div>

          <div style={{
            background: '#FEF3C7',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Mail size={20} color="#D97706" />
            <span style={{
              fontSize: '14px',
              color: '#92400E'
            }}>
              Your email: <strong>{user?.email}</strong>
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => fetchDashboardToken()}
              style={{
                padding: '1rem 1.5rem',
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,102,162,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,102,162,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,162,0.3)';
              }}
            >
              <RefreshCw size={18} />
              Check Again
            </button>

            <button
              onClick={handleSignOut}
              style={{
                padding: '0.875rem 1.5rem',
                fontSize: '14px',
                fontWeight: 500,
                color: '#6B7280',
                background: 'transparent',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <AlertCircle size={40} color="#DC2626" />
          </div>

          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 0.75rem 0'
          }}>
            Dashboard Not Found
          </h1>

          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            margin: '0 0 2rem 0',
            lineHeight: 1.6
          }}>
            {error}
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => fetchDashboardToken()}
              style={{
                padding: '0.875rem 1.5rem',
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Try Again
            </button>

            <button
              onClick={handleSignOut}
              style={{
                padding: '0.875rem 1.5rem',
                fontSize: '15px',
                fontWeight: 600,
                color: '#DC2626',
                background: 'transparent',
                border: '2px solid #FCA5A5',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
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
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render the dashboard with a header that includes profile menu
  return (
    <div style={{ fontFamily: 'Lato, sans-serif' }}>
      {/* Header Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
        zIndex: 100
      }}>
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
                      navigate('/apprentice/settings');
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
      {dashboardToken && <Dashboard dashboardToken={dashboardToken} />}
    </div>
  );
};

export default ApprenticeDashboard;
