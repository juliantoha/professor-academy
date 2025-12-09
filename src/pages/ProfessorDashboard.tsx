import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Users, Clock, CheckCircle, ExternalLink, RefreshCw, Settings, ChevronDown, Plus, X, UserPlus, Copy, Check } from 'lucide-react';

interface Apprentice {
  id: string;
  apprenticeId: string;
  name: string;
  email: string;
  dashboardToken: string;
  createdAt?: string;
  employmentType?: '1099' | 'part-time' | null;
}

interface Progress {
  apprenticeEmail: string;
  phase: string;
  module: string;
  Status: string;
  submissionId: string | null;
}

interface Submission {
  submissionId: string;
  apprenticeEmail: string;
  moduleName: string;
  moduleNumber: string;
  status: string;
  submittedAt: string;
  studentName: string;
}

const ProfessorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [apprentices, setApprentices] = useState<Apprentice[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress[]>>({});
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Add Apprentice modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApprenticeName, setNewApprenticeName] = useState('');
  const [newApprenticeEmail, setNewApprenticeEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState<{ email: string; dashboardUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Get display name
  const displayName = profile?.firstName || profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Professor';

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: apprenticesData, error: apprenticesError } = await supabase
        .from('apprentices')
        .select('*')
        .eq('professorEmail', user?.email);

      if (apprenticesError) throw apprenticesError;
      setApprentices(apprenticesData || []);

      if (apprenticesData && apprenticesData.length > 0) {
        const emails = apprenticesData.map(a => a.email);
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .in('apprenticeEmail', emails);

        if (progressError) throw progressError;

        const progressMap: Record<string, Progress[]> = {};
        (progressData || []).forEach(p => {
          if (!progressMap[p.apprenticeEmail]) {
            progressMap[p.apprenticeEmail] = [];
          }
          progressMap[p.apprenticeEmail].push(p);
        });
        setProgress(progressMap);
      }

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('professorEmail', user?.email)
        .eq('status', 'Pending')
        .order('submittedAt', { ascending: false });

      if (submissionsError) throw submissionsError;
      setPendingSubmissions(submissionsData || []);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getProgressSummary = (email: string) => {
    const apprenticeProgress = progress[email] || [];
    const completed = apprenticeProgress.filter(p => p.Status === 'Completed' || p.Status === 'Approved').length;
    const submitted = apprenticeProgress.filter(p => p.Status === 'Submitted').length;
    return { completed, submitted, total: apprenticeProgress.length };
  };

  // Generate a unique token for the dashboard
  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  // Generate a unique apprentice ID
  const generateApprenticeId = () => {
    const prefix = 'APP';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleAddApprentice = async () => {
    if (!newApprenticeName.trim() || !newApprenticeEmail.trim()) {
      setAddError('Please enter both name and email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newApprenticeEmail)) {
      setAddError('Please enter a valid email address');
      return;
    }

    setAdding(true);
    setAddError('');

    try {
      // Check if apprentice already exists
      const { data: existing } = await supabase
        .from('apprentices')
        .select('email')
        .eq('email', newApprenticeEmail.toLowerCase())
        .single();

      if (existing) {
        setAddError('An apprentice with this email already exists');
        setAdding(false);
        return;
      }

      const dashboardToken = generateToken();
      const apprenticeId = generateApprenticeId();

      const { error: insertError } = await supabase
        .from('apprentices')
        .insert({
          apprenticeId,
          name: newApprenticeName.trim(),
          email: newApprenticeEmail.toLowerCase().trim(),
          professorEmail: user?.email,
          dashboardToken
        });

      if (insertError) throw insertError;

      const dashboardUrl = `${window.location.origin}/dashboard/${dashboardToken}`;

      setAddSuccess({
        email: newApprenticeEmail.toLowerCase().trim(),
        dashboardUrl
      });

      // Refresh the apprentices list
      fetchData();

    } catch (err: any) {
      console.error('Error adding apprentice:', err);
      setAddError(err.message || 'Failed to add apprentice');
    } finally {
      setAdding(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetAddModal = () => {
    setShowAddModal(false);
    setNewApprenticeName('');
    setNewApprenticeEmail('');
    setAddError('');
    setAddSuccess(null);
    setCopied(false);
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
          <span style={{ color: '#004A69', fontWeight: 500 }}>Loading dashboard...</span>
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

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '28px',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.5px'
              }}>
                Professor Dashboard
              </h1>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.8)',
                margin: 0
              }}>
                Welcome back, {displayName}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={fetchData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
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
                <RefreshCw size={18} />
                Refresh
              </button>

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
                    {/* Overlay to close dropdown when clicking outside */}
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
                            navigate('/settings');
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
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            border: '2px solid #DC2626',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            color: '#991B1B',
            fontSize: '14px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Pending Reviews Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(235,106,24,0.3)'
            }}>
              <Clock size={22} color="white" />
            </div>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#004A69',
              margin: 0
            }}>
              Pending Reviews ({pendingSubmissions.length})
            </h2>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFF6ED 0%, #FFE0BA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <CheckCircle size={36} color="#eb6a18" />
              </div>
              <h3 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#004A69',
                margin: '0 0 0.75rem 0'
              }}>
                All caught up!
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                margin: 0
              }}>
                No pending submissions to review. New submissions will appear here.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {pendingSubmissions.map((submission) => (
                <div
                  key={submission.submissionId}
                  onClick={() => navigate(`/review/${submission.submissionId}?review=true`)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    borderLeft: '5px solid #eb6a18',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#004A69',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {submission.moduleNumber} - {submission.moduleName}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: 0
                      }}>
                        {submission.studentName || submission.apprenticeEmail}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      background: 'linear-gradient(135deg, #FFF6ED 0%, #FFE0BA 100%)',
                      color: '#d05510',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '20px',
                      border: '1px solid rgba(235,106,24,0.2)'
                    }}>
                      Pending
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#9CA3AF'
                    }}>
                      {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      color: '#0066A2',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      Review <ExternalLink size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Apprentices Section */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,74,105,0.3)'
              }}>
                <Users size={22} color="white" />
              </div>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: '#004A69',
                margin: 0
              }}>
                Your Apprentices ({apprentices.length})
              </h2>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(235,106,24,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(235,106,24,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(235,106,24,0.3)';
              }}
            >
              <UserPlus size={18} />
              Add Apprentice
            </button>
          </div>

          {apprentices.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <Users size={36} color="#9CA3AF" />
              </div>
              <h3 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#004A69',
                margin: '0 0 0.75rem 0'
              }}>
                No apprentices yet
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                margin: 0
              }}>
                Apprentices assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {apprentices.map((apprentice) => {
                const summary = getProgressSummary(apprentice.email);
                return (
                  <div
                    key={apprentice.id}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '1.75rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,74,105,0.3)'
                        }}>
                          <span style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'white'
                          }}>
                            {apprentice.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '17px',
                            fontWeight: 600,
                            color: '#004A69',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {apprentice.name}
                          </h3>
                          <p style={{
                            fontSize: '13px',
                            color: '#6B7280',
                            margin: 0
                          }}>
                            {apprentice.email}
                          </p>
                        </div>
                      </div>
                      {apprentice.employmentType && (
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          background: apprentice.employmentType === '1099'
                            ? 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
                            : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                          color: apprentice.employmentType === '1099' ? '#6D28D9' : '#1E40AF',
                          border: apprentice.employmentType === '1099'
                            ? '1px solid #8B5CF6'
                            : '1px solid #3B82F6',
                          whiteSpace: 'nowrap'
                        }}>
                          {apprentice.employmentType === '1099' ? '1099' : 'W-2'}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#6B7280', fontWeight: 500 }}>Progress</span>
                        <span style={{ color: '#004A69', fontWeight: 600 }}>
                          {summary.completed} of 5 modules
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#E5E7EB',
                        borderRadius: '50px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(summary.completed / 5) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #00952E 0%, #10B981 100%)',
                          borderRadius: '50px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1.25rem'
                    }}>
                      {summary.submitted > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          background: 'linear-gradient(135deg, #FFF6ED 0%, #FFE0BA 100%)',
                          borderRadius: '8px'
                        }}>
                          <Clock size={14} color="#d05510" />
                          <span style={{ fontSize: '13px', color: '#d05510', fontWeight: 600 }}>
                            {summary.submitted} pending
                          </span>
                        </div>
                      )}
                      {summary.completed > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                          borderRadius: '8px'
                        }}>
                          <CheckCircle size={14} color="#00952E" />
                          <span style={{ fontSize: '13px', color: '#00952E', fontWeight: 600 }}>
                            {summary.completed} completed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Dashboard Button */}
                    <button
                      onClick={() => window.open(`/dashboard/${apprentice.dashboardToken}`, '_blank')}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#004A69',
                        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                        border: '2px solid #E5E7EB',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#004A69';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
                        e.currentTarget.style.color = '#004A69';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                      }}
                    >
                      <ExternalLink size={16} />
                      View Dashboard
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Apps & Resources */}
        <section style={{ marginTop: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #471657 0%, #6B2C7B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(71,22,87,0.3)'
            }}>
              <ExternalLink size={22} color="white" />
            </div>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#004A69',
              margin: 0
            }}>
              Apps & Resources
            </h2>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem'
            }}>
              <ResourceCard
                href="https://studio.oclef.com/notation"
                icon="🎼"
                title="Oclef Notation App"
                subtitle="PDF Annotation Tool"
                description="Annotate lesson scores with practice icons, shapes, and notes"
                color="#471657"
              />
              <ResourceCard
                href="https://events.oclef.com"
                icon="🎭"
                title="Oclef Events"
                subtitle="Community Calendar"
                description="Browse upcoming recitals, masterclasses, and performances"
                color="#B9314F"
              />
              <ResourceCard
                href="https://studio.oclef.com/virtuoso-piano"
                icon="🎹"
                title="Virtuoso Piano"
                subtitle="MIDI Instrument"
                description="Browser-based MIDI piano with velocity-sensitive playback"
                color="#471657"
              />
              <ResourceCard
                href="https://blog.oclef.com"
                icon="✍️"
                title="Oclef Blog"
                subtitle="Articles & Insights"
                description="Teaching strategies, pedagogy insights, and faculty reflections"
                color="#FFA6B4"
              />
              <ResourceCard
                href="https://www.thevivekproject.com"
                icon="📚"
                title="The Vivek Project"
                subtitle="Pedagogical Study"
                description="Longitudinal study with teaching videos and expert commentary"
                color="#00952E"
              />
              <ResourceCard
                href="https://studio.oclef.com/instructor.html"
                icon="🎯"
                title="Instructor Assessment"
                subtitle="Evaluation Rubric"
                description="Official rubric for instructor promotion evaluations"
                color="#eb6a18"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#6B7280',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Oclef Professor Academy
      </footer>

      {/* Add Apprentice Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserPlus size={24} color="white" />
                <h3 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'white',
                  margin: 0
                }}>
                  Add Apprentice
                </h3>
              </div>
              <button
                onClick={resetAddModal}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} color="white" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '2rem' }}>
              {addSuccess ? (
                // Success state
                <div>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}>
                    <CheckCircle size={32} color="#059669" />
                  </div>

                  <h4 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#004A69',
                    textAlign: 'center',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Apprentice Added!
                  </h4>

                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    textAlign: 'center',
                    margin: '0 0 1.5rem 0'
                  }}>
                    {addSuccess.email} can now register and access their dashboard.
                  </p>

                  <div style={{
                    background: '#F9FAFB',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#004A69',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Dashboard Link (optional - they can also just login):
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        value={addSuccess.dashboardUrl}
                        readOnly
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          fontSize: '13px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          background: 'white',
                          color: '#4B5563'
                        }}
                      />
                      <button
                        onClick={() => handleCopyLink(addSuccess.dashboardUrl)}
                        style={{
                          padding: '0.75rem',
                          background: copied ? '#059669' : '#004A69',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {copied ? <Check size={18} color="white" /> : <Copy size={18} color="white" />}
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                    border: '2px solid #0066A2',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#004A69',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      <strong>Next step:</strong> Tell your apprentice to sign up at the login page using the email <strong>{addSuccess.email}</strong>. They'll automatically be connected to their dashboard.
                    </p>
                  </div>

                  <button
                    onClick={resetAddModal}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'white',
                      background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                // Form state
                <div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: '0 0 1.5rem 0',
                    lineHeight: 1.5
                  }}>
                    Add an apprentice to your program. They'll receive access to their training dashboard once they register with the same email.
                  </p>

                  {addError && (
                    <div style={{
                      background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                      border: '2px solid #DC2626',
                      borderRadius: '10px',
                      padding: '0.875rem 1rem',
                      marginBottom: '1rem',
                      fontSize: '14px',
                      color: '#991B1B'
                    }}>
                      {addError}
                    </div>
                  )}

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#004A69',
                      marginBottom: '0.5rem'
                    }}>
                      Apprentice Name
                    </label>
                    <input
                      type="text"
                      value={newApprenticeName}
                      onChange={(e) => setNewApprenticeName(e.target.value)}
                      placeholder="e.g., John Smith"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        fontSize: '15px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '10px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0066A2'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#004A69',
                      marginBottom: '0.5rem'
                    }}>
                      Apprentice Email
                    </label>
                    <input
                      type="email"
                      value={newApprenticeEmail}
                      onChange={(e) => setNewApprenticeEmail(e.target.value)}
                      placeholder="e.g., john@example.com"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        fontSize: '15px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '10px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0066A2'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={resetAddModal}
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#004A69',
                        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                        border: '2px solid #E5E7EB',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddApprentice}
                      disabled={adding}
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'white',
                        background: adding
                          ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                          : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: adding ? 'not-allowed' : 'pointer',
                        boxShadow: adding ? 'none' : '0 4px 12px rgba(235,106,24,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {adding ? (
                        <>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Add Apprentice
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const ResourceCard = ({ href, icon, title, subtitle, description, color }: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
        border: `2px solid ${isHovered ? color : '#E5E7EB'}`,
        borderRadius: '14px',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 20px ${color}20` : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: `0 4px 10px ${color}30`,
          flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#1F2937',
            margin: 0
          }}>
            {title}
          </h3>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
            {subtitle}
          </p>
        </div>
      </div>
      <p style={{
        fontSize: '13px',
        color: '#4B5563',
        margin: 0,
        lineHeight: '1.5'
      }}>
        {description}
      </p>
    </a>
  );
};

export default ProfessorDashboard;
