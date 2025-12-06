import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Users, Clock, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface Apprentice {
  id: string;
  apprenticeId: string;
  name: string;
  email: string;
  dashboardToken: string;
  createdAt?: string;
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
        overflow: 'hidden'
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
                Welcome back, {profile?.name || user?.email}
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
              <button
                onClick={handleSignOut}
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
                <LogOut size={18} />
                Sign Out
              </button>
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
        {pendingSubmissions.length > 0 && (
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
          </section>
        )}

        {/* Apprentices Section */}
        <section>
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfessorDashboard;
