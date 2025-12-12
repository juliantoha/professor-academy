import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  GraduationCap,
  Eye,
  RefreshCw,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  ChevronDown,
  Settings,
  Search,
  FileText,
  Trash2,
  UserX,
  UserCheck,
  AlertTriangle,
  X
} from 'lucide-react';

interface Professor {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  apprenticeCount: number;
  pendingSubmissions: number;
  isActive?: boolean;
}

interface Apprentice {
  id: string;
  apprenticeId: string;
  name: string;
  email: string;
  professorEmail: string;
  professorName?: string;
  dashboardToken: string;
  currentPhase: string | null;
  completedModules: number;
  pendingSubmissions: number;
}

// Super admin emails - only these users can access this page
const SUPER_ADMIN_EMAILS = ['julian@oclef.com'];

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [apprentices, setApprentices] = useState<Apprentice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'professors' | 'apprentices'>('professors');
  const [searchTerm, setSearchTerm] = useState('');

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    show: boolean;
    type: 'delete' | 'deactivate' | 'activate' | null;
    targetType: 'professor' | 'apprentice' | null;
    target: Professor | Apprentice | null;
  }>({ show: false, type: null, targetType: null, target: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is super admin
  const isSuperAdmin = user?.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());

  const displayName = profile?.firstName || profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/professor');
      return;
    }
    fetchData();
  }, [user, isSuperAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all professors (users with role 'professor')
      const { data: professorProfiles, error: professorError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'professor');

      if (professorError) throw professorError;

      // Fetch all apprentices
      const { data: apprenticesData, error: apprenticesError } = await supabase
        .from('apprentices')
        .select('*');

      if (apprenticesError) throw apprenticesError;

      // Fetch all submissions to count pending ones
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('professorEmail, apprenticeEmail, status');

      if (submissionsError) throw submissionsError;

      // Fetch progress data
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('apprenticeEmail, Status');

      if (progressError) throw progressError;

      // Build professor list with counts
      const professorList: Professor[] = (professorProfiles || []).map(prof => {
        const profEmail = prof.email?.toLowerCase();
        const apprenticeCount = (apprenticesData || []).filter(
          a => a.professorEmail?.toLowerCase() === profEmail
        ).length;
        const pendingSubmissions = (submissionsData || []).filter(
          s => s.professorEmail?.toLowerCase() === profEmail && s.status === 'Pending'
        ).length;

        return {
          id: prof.id,
          email: prof.email,
          name: prof.name,
          firstName: prof.firstName,
          lastName: prof.lastName,
          apprenticeCount,
          pendingSubmissions,
          isActive: prof.isActive !== false // Default to true if not set
        };
      });

      // Build apprentice list with progress info
      const apprenticeList: Apprentice[] = (apprenticesData || []).map(app => {
        const appEmail = app.email?.toLowerCase();
        const professor = professorProfiles?.find(
          p => p.email?.toLowerCase() === app.professorEmail?.toLowerCase()
        );
        const completedModules = (progressData || []).filter(
          p => p.apprenticeEmail?.toLowerCase() === appEmail &&
               (p.Status === 'Completed' || p.Status === 'Approved')
        ).length;
        const pendingSubmissions = (submissionsData || []).filter(
          s => s.apprenticeEmail?.toLowerCase() === appEmail && s.status === 'Pending'
        ).length;

        return {
          id: app.id || app.apprenticeId,
          apprenticeId: app.apprenticeId,
          name: app.name,
          email: app.email,
          professorEmail: app.professorEmail,
          professorName: professor ?
            (professor.firstName && professor.lastName ?
              `${professor.firstName} ${professor.lastName}` :
              professor.name || professor.email) :
            app.professorEmail,
          dashboardToken: app.dashboardToken,
          currentPhase: app.currentPhase,
          completedModules,
          pendingSubmissions
        };
      });

      setProfessors(professorList);
      setApprentices(apprenticeList);

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleMasqueradeAsProfessor = (professorEmail: string, professorName: string) => {
    // Store masquerade info in sessionStorage
    sessionStorage.setItem('adminMasqueradeActive', 'true');
    sessionStorage.setItem('adminOriginalEmail', user?.email || '');
    sessionStorage.setItem('masqueradeEmail', professorEmail);
    sessionStorage.setItem('masqueradeName', professorName);
    sessionStorage.setItem('masqueradeType', 'professor');
    // Open in new tab
    window.open(`/professor`, '_blank');
  };

  const handleMasqueradeAsApprentice = (dashboardToken: string, apprenticeName: string, apprenticeEmail: string) => {
    // Store masquerade info in sessionStorage
    sessionStorage.setItem('adminMasqueradeActive', 'true');
    sessionStorage.setItem('adminOriginalEmail', user?.email || '');
    sessionStorage.setItem('masqueradeEmail', apprenticeEmail);
    sessionStorage.setItem('masqueradeName', apprenticeName);
    sessionStorage.setItem('masqueradeType', 'apprentice');
    sessionStorage.setItem('masqueradeDashboardToken', dashboardToken);
    // Open the apprentice's dashboard in a new tab
    window.open(`/dashboard/${dashboardToken}`, '_blank');
  };

  const handleDeactivateProfessor = async (professor: Professor) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ isActive: false })
        .eq('id', professor.id);

      if (error) throw error;

      await fetchData();
      setActionModal({ show: false, type: null, targetType: null, target: null });
    } catch (err: any) {
      console.error('Error deactivating professor:', err);
      setError(err.message || 'Failed to deactivate professor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateProfessor = async (professor: Professor) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ isActive: true })
        .eq('id', professor.id);

      if (error) throw error;

      await fetchData();
      setActionModal({ show: false, type: null, targetType: null, target: null });
    } catch (err: any) {
      console.error('Error activating professor:', err);
      setError(err.message || 'Failed to activate professor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfessor = async (professor: Professor) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', professor.id);

      if (error) throw error;

      await fetchData();
      setActionModal({ show: false, type: null, targetType: null, target: null });
    } catch (err: any) {
      console.error('Error deleting professor:', err);
      setError(err.message || 'Failed to delete professor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteApprentice = async (apprentice: Apprentice) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('apprentices')
        .delete()
        .eq('apprenticeId', apprentice.apprenticeId);

      if (error) throw error;

      await fetchData();
      setActionModal({ show: false, type: null, targetType: null, target: null });
    } catch (err: any) {
      console.error('Error deleting apprentice:', err);
      setError(err.message || 'Failed to delete apprentice');
    } finally {
      setActionLoading(false);
    }
  };

  const executeAction = () => {
    if (!actionModal.target || !actionModal.type) return;

    if (actionModal.targetType === 'professor') {
      const prof = actionModal.target as Professor;
      if (actionModal.type === 'delete') {
        handleDeleteProfessor(prof);
      } else if (actionModal.type === 'deactivate') {
        handleDeactivateProfessor(prof);
      } else if (actionModal.type === 'activate') {
        handleActivateProfessor(prof);
      }
    } else if (actionModal.targetType === 'apprentice') {
      const app = actionModal.target as Apprentice;
      if (actionModal.type === 'delete') {
        handleDeleteApprentice(app);
      }
    }
  };

  // Filter based on search
  const filteredProfessors = professors.filter(p =>
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApprentices = apprentices.filter(a =>
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.professorEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div style={{
        fontFamily: 'Lato, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#FFD700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#FFD700', fontWeight: 500 }}>Loading admin dashboard...</span>
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
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        borderBottom: '2px solid rgba(255,215,0,0.3)',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(255,215,0,0.4)'
              }}>
                <Shield size={28} color="#1a1a2e" />
              </div>
              <div>
                <h1 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#FFD700',
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}>
                  Super Admin Dashboard
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0
                }}>
                  Manage professors and apprentices
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={fetchData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(255,215,0,0.1)',
                  border: '2px solid rgba(255,215,0,0.3)',
                  borderRadius: '10px',
                  color: '#FFD700',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,215,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
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
                    background: 'rgba(255,215,0,0.1)',
                    border: '2px solid rgba(255,215,0,0.3)',
                    borderRadius: '10px',
                    color: '#FFD700',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1a1a2e'
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{displayName}</span>
                  <ChevronDown size={16} style={{
                    transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>

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
                      background: '#1a1a2e',
                      border: '2px solid rgba(255,215,0,0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      minWidth: '200px',
                      zIndex: 20,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255,215,0,0.2)'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#FFD700',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {displayName}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.6)',
                          margin: 0
                        }}>
                          {user?.email}
                        </p>
                      </div>
                      <div style={{ padding: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/professor');
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
                            e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <GraduationCap size={18} color="rgba(255,255,255,0.7)" />
                          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>Professor View</span>
                        </button>
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
                            e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Settings size={18} color="rgba(255,255,255,0.7)" />
                          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>Settings</span>
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
                            e.currentTarget.style.background = 'rgba(220,38,38,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <LogOut size={18} color="#EF4444" />
                          <span style={{ fontSize: '14px', color: '#EF4444' }}>Sign Out</span>
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
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.2)',
            border: '2px solid #EF4444',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            color: '#FCA5A5',
            fontSize: '14px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={24} color="white" />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Professors</p>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: 0 }}>{professors.length}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Apprentices</p>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: 0 }}>{apprentices.length}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={24} color="white" />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Pending Reviews</p>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: 0 }}>
                  {apprentices.reduce((sum, a) => sum + a.pendingSubmissions, 0)}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={24} color="white" />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>Completed Modules</p>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: 0 }}>
                  {apprentices.reduce((sum, a) => sum + a.completedModules, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setActiveTab('professors')}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === 'professors' ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
                background: activeTab === 'professors' ? '#FFD700' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <GraduationCap size={18} />
              Professors ({professors.length})
            </button>
            <button
              onClick={() => setActiveTab('apprentices')}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === 'apprentices' ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
                background: activeTab === 'apprentices' ? '#FFD700' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Users size={18} />
              Apprentices ({apprentices.length})
            </button>
          </div>

          {/* Search */}
          <div style={{
            position: 'relative',
            minWidth: '280px'
          }}>
            <Search
              size={18}
              color="rgba(255,255,255,0.5)"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                fontSize: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: 'white',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255,215,0,0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        {/* Professors Table */}
        {activeTab === 'professors' && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,215,0,0.1)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Professor</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Apprentices</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Pending</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfessors.map((professor, index) => (
                  <tr
                    key={professor.id}
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      opacity: professor.isActive === false ? 0.5 : 1
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: professor.isActive === false
                            ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                            : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontWeight: 700 }}>
                            {(professor.firstName || professor.name || professor.email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span style={{ color: 'white', fontWeight: 500 }}>
                          {professor.firstName && professor.lastName
                            ? `${professor.firstName} ${professor.lastName}`
                            : professor.name || professor.email?.split('@')[0]}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                      {professor.email}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.35rem 0.75rem',
                        background: professor.isActive === false ? 'rgba(107,114,128,0.2)' : 'rgba(16,185,129,0.2)',
                        color: professor.isActive === false ? '#9CA3AF' : '#10B981',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {professor.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(16,185,129,0.2)',
                        color: '#10B981',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        <Users size={14} />
                        {professor.apprenticeCount}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {professor.pendingSubmissions > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(245,158,11,0.2)',
                          color: '#F59E0B',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          <Clock size={14} />
                          {professor.pendingSubmissions}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          <CheckCircle size={14} />
                          0
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleMasqueradeAsProfessor(
                            professor.email,
                            professor.firstName && professor.lastName
                              ? `${professor.firstName} ${professor.lastName}`
                              : professor.name || professor.email
                          )}
                          title="View as this professor"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.75rem',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#FFD700',
                            background: 'rgba(255,215,0,0.1)',
                            border: '1px solid rgba(255,215,0,0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,215,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
                          }}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => setActionModal({
                            show: true,
                            type: professor.isActive === false ? 'activate' : 'deactivate',
                            targetType: 'professor',
                            target: professor
                          })}
                          title={professor.isActive === false ? 'Activate professor' : 'Deactivate professor'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.4rem 0.6rem',
                            fontSize: '12px',
                            color: professor.isActive === false ? '#10B981' : '#F59E0B',
                            background: professor.isActive === false ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            border: `1px solid ${professor.isActive === false ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {professor.isActive === false ? <UserCheck size={14} /> : <UserX size={14} />}
                        </button>
                        <button
                          onClick={() => setActionModal({
                            show: true,
                            type: 'delete',
                            targetType: 'professor',
                            target: professor
                          })}
                          title="Delete professor"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.4rem 0.6rem',
                            fontSize: '12px',
                            color: '#EF4444',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProfessors.length === 0 && (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)'
              }}>
                No professors found
              </div>
            )}
          </div>
        )}

        {/* Apprentices Table */}
        {activeTab === 'apprentices' && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,215,0,0.1)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Apprentice</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Professor</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Progress</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Pending</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#FFD700', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprentices.map((apprentice, index) => (
                  <tr
                    key={apprentice.id}
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontWeight: 700 }}>
                            {apprentice.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <span style={{ color: 'white', fontWeight: 500 }}>
                          {apprentice.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                      {apprentice.email}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                      {apprentice.professorName || apprentice.professorEmail}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.35rem 0.75rem',
                        background: apprentice.completedModules > 0 ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.1)',
                        color: apprentice.completedModules > 0 ? '#8B5CF6' : 'rgba(255,255,255,0.5)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        {apprentice.completedModules}/5 modules
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {apprentice.pendingSubmissions > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(245,158,11,0.2)',
                          color: '#F59E0B',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          <Clock size={14} />
                          {apprentice.pendingSubmissions}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          0
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleMasqueradeAsApprentice(apprentice.dashboardToken, apprentice.name, apprentice.email)}
                          title="View as this apprentice"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.75rem',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#FFD700',
                            background: 'rgba(255,215,0,0.1)',
                            border: '1px solid rgba(255,215,0,0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,215,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
                          }}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => setActionModal({
                            show: true,
                            type: 'delete',
                            targetType: 'apprentice',
                            target: apprentice
                          })}
                          title="Delete apprentice"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.4rem 0.6rem',
                            fontSize: '12px',
                            color: '#EF4444',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApprentices.length === 0 && (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)'
              }}>
                No apprentices found
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '14px'
      }}>
        Oclef Professor Academy - Super Admin
      </footer>

      {/* Action Confirmation Modal */}
      {actionModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '20px',
            border: '2px solid rgba(255,215,0,0.3)',
            width: '100%',
            maxWidth: '450px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: actionModal.type === 'delete'
                ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)'
                : actionModal.type === 'activate'
                ? 'linear-gradient(135deg, #065F46 0%, #047857 100%)'
                : 'linear-gradient(135deg, #78350F 0%, #92400E 100%)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {actionModal.type === 'delete' ? (
                  <Trash2 size={24} color="white" />
                ) : actionModal.type === 'activate' ? (
                  <UserCheck size={24} color="white" />
                ) : (
                  <AlertTriangle size={24} color="white" />
                )}
                <h3 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'white',
                  margin: 0
                }}>
                  {actionModal.type === 'delete' && 'Confirm Delete'}
                  {actionModal.type === 'deactivate' && 'Confirm Deactivate'}
                  {actionModal.type === 'activate' && 'Confirm Activate'}
                </h3>
              </div>
              <button
                onClick={() => setActionModal({ show: false, type: null, targetType: null, target: null })}
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
              <p style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 1.5rem 0',
                lineHeight: 1.6
              }}>
                {actionModal.type === 'delete' && (
                  <>
                    Are you sure you want to <strong style={{ color: '#EF4444' }}>permanently delete</strong>{' '}
                    <strong style={{ color: '#FFD700' }}>
                      {actionModal.targetType === 'professor'
                        ? (actionModal.target as Professor)?.email
                        : (actionModal.target as Apprentice)?.name}
                    </strong>
                    ? This action cannot be undone.
                  </>
                )}
                {actionModal.type === 'deactivate' && (
                  <>
                    Are you sure you want to <strong style={{ color: '#F59E0B' }}>deactivate</strong>{' '}
                    <strong style={{ color: '#FFD700' }}>
                      {(actionModal.target as Professor)?.email}
                    </strong>
                    ? They will no longer be able to access the platform.
                  </>
                )}
                {actionModal.type === 'activate' && (
                  <>
                    Are you sure you want to <strong style={{ color: '#10B981' }}>reactivate</strong>{' '}
                    <strong style={{ color: '#FFD700' }}>
                      {(actionModal.target as Professor)?.email}
                    </strong>
                    ? They will regain access to the platform.
                  </>
                )}
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setActionModal({ show: false, type: null, targetType: null, target: null })}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: actionModal.type === 'delete'
                      ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
                      : actionModal.type === 'activate'
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {actionLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionModal.type === 'delete' && 'Delete'}
                      {actionModal.type === 'deactivate' && 'Deactivate'}
                      {actionModal.type === 'activate' && 'Activate'}
                    </>
                  )}
                </button>
              </div>
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

export default AdminDashboard;
