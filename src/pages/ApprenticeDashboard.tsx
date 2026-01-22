import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Dashboard from './Dashboard';
import { LogOut, Settings, ChevronDown, AlertCircle, Clock, Mail, Award, CheckCircle } from 'lucide-react';

const ApprenticeDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboardToken, setDashboardToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waitingForProfessor, setWaitingForProfessor] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = profile?.firstName || profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';
  const isInitialLoad = useRef(true);

  const fetchDashboardToken = useCallback(async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
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
      isInitialLoad.current = false;
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    fetchDashboardToken();

    // Real-time subscription for when professor adds the apprentice
    const apprenticeChannel = supabase
      .channel('apprentice-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apprentices',
          filter: `email=eq.${user.email}`
        },
        () => {
          console.log('[RealTime] Apprentice record changed');
          fetchDashboardToken(false);
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialLoad.current) {
        fetchDashboardToken(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(apprenticeChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.email, fetchDashboardToken]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
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
          gap: '1.5rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Premium Loading Spinner */}
          <div style={{
            position: 'relative',
            width: '70px',
            height: '70px'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid #E5E7EB'
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#004A69',
              borderRightColor: '#0066A2',
              animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,74,105,0.3)'
            }}>
              <Award size={24} color="white" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#002642',
              margin: '0 0 0.5rem 0'
            }}>
              Loading Dashboard
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(0, 38, 66, 0.6)',
              margin: 0
            }}>
              Preparing your training journey...
            </p>
          </div>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
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
        fontFamily: "'Inter', system-ui, sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(251, 191, 36, 0.1)',
          animation: 'float-waiting 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(0, 102, 162, 0.08)',
          animation: 'float-waiting 6s ease-in-out infinite 2s'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '5%',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(235, 106, 24, 0.08)',
          animation: 'float-waiting 6s ease-in-out infinite 1s'
        }} />

        <div style={{
          background: 'white',
          borderRadius: '28px',
          padding: '3.5rem 3rem',
          maxWidth: '540px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(0,74,105,0.08)'
        }}>
          {/* Animated illustration */}
          <div style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            margin: '0 auto 2rem'
          }}>
            {/* Outer pulse ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid rgba(251, 191, 36, 0.2)',
              animation: 'pulse-ring 2s ease-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '50%',
              border: '3px solid rgba(251, 191, 36, 0.3)',
              animation: 'pulse-ring 2s ease-out infinite 0.5s'
            }} />
            {/* Main icon circle */}
            <div style={{
              position: 'absolute',
              inset: '25px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 15px 40px rgba(251, 191, 36, 0.35)',
              animation: 'bounce-waiting 2s ease-in-out infinite'
            }}>
              <Clock size={52} color="white" strokeWidth={1.5} />
            </div>
            {/* Decorative sparkles */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '25px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#10B981',
              animation: 'sparkle-waiting 2s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '15px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#3B82F6',
              animation: 'sparkle-waiting 2s ease-in-out infinite 0.5s'
            }} />
          </div>

          <h1 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#002642',
            margin: '0 0 0.75rem 0',
            letterSpacing: '-0.5px'
          }}>
            You're Almost Ready!
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#D97706',
            fontWeight: 600,
            margin: '0 0 2rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#FBBF24',
              animation: 'dot-pulse 1.5s ease-in-out infinite'
            }} />
            Waiting for professor setup
          </p>

          {/* Progress steps */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle size={18} color="white" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>Account Created</span>
            </div>
            <div style={{
              width: '40px',
              height: '2px',
              background: 'linear-gradient(90deg, #10B981 0%, #FBBF24 100%)',
              borderRadius: '2px'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                animation: 'pulse-step 2s ease-in-out infinite'
              }}>
                <Clock size={16} color="white" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>Professor Setup</span>
            </div>
            <div style={{
              width: '40px',
              height: '2px',
              background: '#E5E7EB',
              borderRadius: '2px'
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={16} color="#9CA3AF" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF' }}>Start Training</span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(0,102,162,0.15)',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: 0,
              lineHeight: 1.7
            }}>
              <strong style={{ color: '#004A69' }}>Next step:</strong> Reach out to your professor and let them know you've signed up with <strong>{user?.email}</strong>. Once they add you to their studio, you'll be ready to begin your training journey!
            </p>
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
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 25px rgba(0,102,162,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,102,162,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,102,162,0.3)';
              }}
            >
              <Clock size={18} />
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
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9CA3AF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        <style>{`
          @keyframes float-waiting {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          @keyframes bounce-waiting {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes sparkle-waiting {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.6; }
          }
          @keyframes dot-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
          }
          @keyframes pulse-step {
            0%, 100% { box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3); }
            50% { box-shadow: 0 4px 20px rgba(251, 191, 36, 0.5); }
          }
        `}</style>
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
