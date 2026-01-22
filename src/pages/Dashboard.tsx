import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, XCircle, Award, ArrowRight, Eye, AlertCircle, Play, BookOpen, Video, FileText, CheckSquare, Download, MessageSquare, Smartphone, Music2, Theater, Piano, PenLine, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ApprenticeData {
  id: string;
  apprenticeId: string;
  name: string;
  email: string;
  professorEmail: string;
  dateStarted: string;
  currentPhase: string;
  dashboardToken: string;
  preOrientationZoomDownloaded?: string;
  preOrientationGchatBrowser?: string;
  preOrientationGchatPhone?: string;
  hasGmail?: string;
}

interface SubmissionData {
  submissionId: string;
  status: 'Pending' | 'Approved' | 'Needs Work';
  professorNotes?: string;
  submittedAt: string;
}

interface ProgressItem {
  phase: string;
  module: string;
  Status: 'Not Started' | 'In Progress' | 'Completed';
  submissionId?: string;
}

const CURRICULUM = [
  { phase: 'Phase 1', module: 'Orientation', number: '1.1' },
  { phase: 'Phase 2', module: 'Computer Essentials', number: '2.1' },
  { phase: 'Phase 2', module: 'Zoom Configuration', number: '2.2' },
  { phase: 'Phase 2', module: 'System Navigation', number: '2.3' },
  { phase: 'Phase 2', module: 'Documentation & Lesson Closure', number: '2.4' }
];

const MODULE_NUMBERS: Record<string, string> = {
  'Orientation': '1.1',
  'Computer Essentials': '2.1',
  'Zoom Configuration': '2.2',
  'System Navigation': '2.3',
  'Documentation & Lesson Closure': '2.4'
};

const MODULE_ICONS: Record<string, any> = {
  'Orientation': Play,
  'Computer Essentials': BookOpen,
  'Zoom Configuration': Video,
  'System Navigation': FileText,
  'Documentation & Lesson Closure': CheckSquare
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  'Orientation': 'Welcome to Oclef: Understanding Our Mission',
  'Computer Essentials': 'Master basic computer operations and file management',
  'Zoom Configuration': 'Set up and optimize your Zoom environment',
  'System Navigation': 'Navigate Oclef systems and student portal',
  'Documentation & Lesson Closure': 'Document lessons and manage closures effectively'
};

const Dashboard = ({ dashboardToken }: { dashboardToken: string }) => {
  const [apprentice, setApprentice] = useState<ApprenticeData | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, SubmissionData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preOrientationChecks, setPreOrientationChecks] = useState({
    zoomDownloaded: false,
    gchatBrowser: false,
    gchatPhone: false,
    hasGmail: true
  });
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      console.log('Dashboard already initialized, skipping...');
      return;
    }
    hasInitialized.current = true;
    
    fetchDashboardData();
  }, [dashboardToken]);

  const initializeProgress = async (apprenticeEmail: string) => {
    console.log('📄 initializeProgress called for:', apprenticeEmail);
    
    try {
      // Check existing progress records
      const { data: existingProgress, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('apprenticeEmail', apprenticeEmail);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        return;
      }

      console.log('📊 Found', existingProgress?.length || 0, 'existing progress records');
      
      const existingModulesMap = new Map<string, any>();
      existingProgress?.forEach((r: any) => {
        const key = `${r.phase}-${r.module}`;
        if (!existingModulesMap.has(key) || r.submissionId) {
          existingModulesMap.set(key, r);
        }
      });

      console.log('📋 Unique modules already in Supabase:', Array.from(existingModulesMap.keys()));

      const missingModules = CURRICULUM.filter(
        module => !existingModulesMap.has(`${module.phase}-${module.module}`)
      );

      if (missingModules.length > 0) {
        console.log('➕ Creating', missingModules.length, 'missing progress records:', missingModules.map(m => m.module));
        
        const records = missingModules.map(module => ({
          apprenticeEmail,
          phase: module.phase,
          module: module.module,
          Status: 'Not Started'
        }));

        const { error: insertError } = await supabase
          .from('progress')
          .insert(records);

        if (insertError) {
          console.error('Error inserting progress:', insertError);
        } else {
          console.log('✅ Progress initialization complete');
        }
      } else {
        console.log('✅ All progress records already exist for', apprenticeEmail, '- no action needed');
      }
    } catch (error) {
      console.error('❌ Error initializing progress:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch apprentice by dashboard token
      const { data: apprenticeData, error: apprenticeError } = await supabase
        .from('apprentices')
        .select('*')
        .eq('dashboardToken', dashboardToken)
        .single();

      if (apprenticeError || !apprenticeData) {
        throw new Error('Dashboard not found');
      }

      setApprentice(apprenticeData as ApprenticeData);

      setPreOrientationChecks({
        zoomDownloaded: apprenticeData.preOrientationZoomDownloaded === 'checked',
        gchatBrowser: apprenticeData.preOrientationGchatBrowser === 'checked',
        gchatPhone: apprenticeData.preOrientationGchatPhone === 'checked',
        hasGmail: apprenticeData.hasGmail !== 'unchecked'
      });

      await initializeProgress(apprenticeData.email);

      // Fetch progress records
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('apprenticeEmail', apprenticeData.email);

      if (progressError) {
        throw new Error('Failed to fetch progress data');
      }
      
      const curriculumModuleKeys = new Set(
        CURRICULUM.map(m => `${m.phase}-${m.module}`)
      );
      
      const progressMap = new Map<string, ProgressItem>();
      
      progressData?.forEach((r: any) => {
        const item = r as ProgressItem;
        const key = `${item.phase}-${item.module}`;
        
        if (curriculumModuleKeys.has(key)) {
          if (!progressMap.has(key) || 
              (item.Status === 'Completed' && progressMap.get(key)?.Status !== 'Completed') ||
              (item.Status === 'In Progress' && progressMap.get(key)?.Status === 'Not Started')) {
            progressMap.set(key, item);
          }
        }
      });
      
      const progressItems = Array.from(progressMap.values());
      setProgress(progressItems);

      // Fetch submissions
      const submissionIds = progressItems
        .filter(p => p.submissionId)
        .map(p => p.submissionId!);
      
      if (submissionIds.length > 0) {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .in('submissionId', submissionIds);

        if (!submissionsError && submissionsData) {
          const submissionsMap: Record<string, SubmissionData> = {};
          submissionsData.forEach((sub: any) => {
            submissionsMap[sub.submissionId] = sub as SubmissionData;
          });
          setSubmissions(submissionsMap);
        }
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const updatePreOrientationCheck = async (field: string, value: boolean) => {
    if (!apprentice) return;

    try {
      const { error } = await supabase
        .from('apprentices')
        .update({ [field]: value ? 'checked' : '' })
        .eq('dashboardToken', dashboardToken);

      if (error) {
        console.error('Failed to update pre-orientation check:', error);
      } else {
        console.log('✅ Saved', field, '=', value);
      }
    } catch (error) {
      console.error('Error updating pre-orientation check:', error);
    }
  };

  const toggleCheck = (key: keyof typeof preOrientationChecks) => {
    const newValue = !preOrientationChecks[key];
    
    setPreOrientationChecks(prev => ({ ...prev, [key]: newValue }));
    
    const fieldMap = {
      zoomDownloaded: 'preOrientationZoomDownloaded',
      gchatBrowser: 'preOrientationGchatBrowser',
      gchatPhone: 'preOrientationGchatPhone',
      hasGmail: 'hasGmail'
    };
    
    updatePreOrientationCheck(fieldMap[key], newValue);
  };

  const calculateOverallProgress = (): number => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(p => p.Status === 'Completed').length;
    return Math.round((completed / CURRICULUM.length) * 100);
  };

  const getOrientationStatus = (): 'Not Started' | 'Completed' => {
    const orientationProgress = progress.find(
      p => p.phase === 'Phase 1' && p.module === 'Orientation'
    );
    return orientationProgress?.Status === 'Completed' ? 'Completed' : 'Not Started';
  };

  const getModuleUrl = (phase: string, module: string): string => {
    if (!apprentice) return '/';
    
    const params = `email=${encodeURIComponent(apprentice.email)}&professor=${encodeURIComponent(apprentice.professorEmail)}&name=${encodeURIComponent(apprentice.name)}&token=${dashboardToken}`;
    
    if (phase === 'Phase 1' && module === 'Orientation') {
      return `/orientation?${params}`;
    }
    
    if (phase === 'Phase 2') {
      const moduleMap: Record<string, string> = {
        'Computer Essentials': '/module1',
        'Zoom Configuration': '/module2',
        'System Navigation': '/module3',
        'Documentation & Lesson Closure': '/module4'
      };
      const basePath = moduleMap[module] || '/';
      return `${basePath}?${params}`;
    }
    
    return '/';
  };

  const getStatusStyle = (status: string, submissionStatus?: string): { bg: string; color: string; icon: any; text: string } => {
    if (submissionStatus === 'Pending') {
      return { bg: '#FEF3C7', color: '#92400E', icon: Clock, text: 'Under Review' };
    }
    if (submissionStatus === 'Needs Work') {
      return { bg: '#FEE2E2', color: '#991B1B', icon: AlertCircle, text: 'Needs Revision' };
    }
    if (submissionStatus === 'Approved') {
      return { bg: '#D1FAE5', color: '#065F46', icon: CheckCircle, text: 'Approved ✓' };
    }
    
    switch (status) {
      case 'Completed': return { bg: '#D1FAE5', color: '#065F46', icon: CheckCircle, text: 'Completed' };
      case 'In Progress': return { bg: '#FEF3C7', color: '#92400E', icon: Clock, text: 'In Progress' };
      case 'Not Started': return { bg: '#F3F4F6', color: '#6B7280', icon: XCircle, text: 'Not Started' };
      default: return { bg: '#F3F4F6', color: '#6B7280', icon: Clock, text: 'Not Started' };
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        fontFamily: 'Lato, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Premium Loading Spinner */}
          <div style={{
            position: 'relative',
            width: '56px',
            height: '56px'
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
              borderTopColor: '#0066A2',
              borderRightColor: '#0066A2',
              animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,102,162,0.3)'
            }}>
              <Award size={20} color="white" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#004A69',
              margin: '0 0 0.25rem 0'
            }}>
              Loading Dashboard
            </p>
            <p style={{
              fontSize: '13px',
              color: '#6B7280',
              margin: 0
            }}>
              Preparing your training modules...
            </p>
          </div>
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

  if (error || !apprentice) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #FEF2F2 50%, #FEE2E2 100%)',
        fontFamily: 'Lato, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          padding: '3rem',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <XCircle size={32} color="#DC2626" />
          </div>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            color: '#991B1B',
            margin: '0 0 0.5rem 0'
          }}>
            Dashboard Not Found
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.5
          }}>
            {error || 'The dashboard you\'re looking for doesn\'t exist or you don\'t have access.'}
          </p>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const orientationStatus = getOrientationStatus();
  
  const phase2Progress = progress
    .filter(p => !(p.phase === 'Phase 1' && p.module === 'Orientation'))
    .sort((a, b) => {
      const numA = MODULE_NUMBERS[a.module] || '';
      const numB = MODULE_NUMBERS[b.module] || '';
      return numA.localeCompare(numB);
    });
  const hasPhase2Progress = phase2Progress.length > 0;
  const preOrientationComplete = preOrientationChecks.zoomDownloaded && 
    preOrientationChecks.gchatBrowser && 
    preOrientationChecks.gchatPhone;

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(235,106,24,0.3)',
              flexShrink: 0
            }}>
              <Award size={36} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0'
              }}>
                {apprentice.name}'s Training Dashboard
              </h1>
              <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
                Professor: {apprentice.professorEmail}
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #DBEAFE 100%)',
            borderRadius: '16px',
            padding: '1.75rem',
            border: '2px solid rgba(0,102,162,0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <span style={{
                fontSize: '17px',
                fontWeight: 600,
                color: '#004A69'
              }}>
                Overall Progress
              </span>
              <span style={{
                fontSize: '28px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {overallProgress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '14px',
              background: '#E5E7EB',
              borderRadius: '50px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${overallProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #eb6a18 0%, #ff8c3d 50%, #F6AE00 100%)',
                borderRadius: '50px',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 16px rgba(235,106,24,0.4)'
              }} />
            </div>
          </div>
        </div>

        {/* Pre-Orientation Checklist */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          marginBottom: '2rem',
          border: preOrientationComplete ? '2px solid #10B981' : '2px solid #F59E0B'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: preOrientationComplete 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: preOrientationComplete 
                  ? '0 4px 12px rgba(16,185,129,0.3)'
                  : '0 4px 12px rgba(245,158,11,0.3)'
              }}>
                {preOrientationComplete ? (
                  <CheckCircle size={28} color="white" />
                ) : (
                  <Clock size={28} color="white" />
                )}
              </div>
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#004A69',
                  margin: '0 0 0.25rem 0'
                }}>
                  Pre-Orientation Setup
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  margin: 0
                }}>
                  Complete these items before your orientation session
                </p>
              </div>
            </div>

            {!preOrientationComplete && (
              <div style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '1px solid #F59E0B',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{
                  fontSize: '14px',
                  color: '#92400E',
                  margin: 0,
                  lineHeight: '1.5',
                  fontWeight: 500
                }}>
                  <strong>Important:</strong> You'll use these tools during your orientation session. Please download and set them up in advance so we can get started right away.
                </p>
              </div>
            )}

            {preOrientationComplete && (
              <div style={{
                background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                border: '1px solid #10B981',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{
                  fontSize: '14px',
                  color: '#065F46',
                  margin: 0,
                  lineHeight: '1.5',
                  fontWeight: 500
                }}>
                  <strong>Great work!</strong> You're all set for orientation. Your professor will reach out with your session details.
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Zoom Download */}
            <div style={{
              background: '#F9FAFB',
              border: '2px solid #E5E7EB',
              borderRadius: '14px',
              padding: '1.5rem',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div
                  onClick={() => toggleCheck('zoomDownloaded')}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: `3px solid ${preOrientationChecks.zoomDownloaded ? '#10B981' : '#D1D5DB'}`,
                    background: preOrientationChecks.zoomDownloaded ? '#10B981' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {preOrientationChecks.zoomDownloaded && (
                    <CheckCircle size={20} color="white" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Download size={20} color="#0066A2" />
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1F2937',
                      margin: 0
                    }}>
                      Zoom Desktop App
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5'
                  }}>
                    Download and install the Zoom desktop application for your operating system
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href="https://zoom.us/download?os=mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0066A2',
                        background: 'white',
                        border: '2px solid #0066A2',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Download size={14} />
                      Mac
                    </a>
                    <a
                      href="https://zoom.us/download?os=win"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0066A2',
                        background: 'white',
                        border: '2px solid #0066A2',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Download size={14} />
                      Windows 64-bit
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Gmail Check */}
            {!preOrientationChecks.hasGmail && (
              <div style={{
                background: '#FEF3C7',
                border: '2px solid #F59E0B',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '0.5rem'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#92400E',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  📧 <strong>Note:</strong> Google Chat requires a Gmail account. If you don't have one, please{' '}
                  <a 
                    href="https://accounts.google.com/signup" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#D97706', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    create a free Gmail account
                  </a>
                  {' '}before proceeding.
                </p>
              </div>
            )}

            {/* Google Chat Browser */}
            <div style={{
              background: '#F9FAFB',
              border: '2px solid #E5E7EB',
              borderRadius: '14px',
              padding: '1.5rem',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div
                  onClick={() => toggleCheck('gchatBrowser')}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: `3px solid ${preOrientationChecks.gchatBrowser ? '#10B981' : '#D1D5DB'}`,
                    background: preOrientationChecks.gchatBrowser ? '#10B981' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {preOrientationChecks.gchatBrowser && (
                    <CheckCircle size={20} color="white" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <MessageSquare size={20} color="#0066A2" />
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1F2937',
                      margin: 0
                    }}>
                      Google Chat - Desktop Browser
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5'
                  }}>
                    Bookmark Google Chat in your desktop browser for quick access
                  </p>
                  <a
                    href="https://mail.google.com/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0066A2',
                      background: 'white',
                      border: '2px solid #0066A2',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowRight size={14} />
                    Open Google Chat
                  </a>
                </div>
              </div>
            </div>

            {/* Google Chat Phone */}
            <div style={{
              background: '#F9FAFB',
              border: '2px solid #E5E7EB',
              borderRadius: '14px',
              padding: '1.5rem',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div
                  onClick={() => toggleCheck('gchatPhone')}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: `3px solid ${preOrientationChecks.gchatPhone ? '#10B981' : '#D1D5DB'}`,
                    background: preOrientationChecks.gchatPhone ? '#10B981' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {preOrientationChecks.gchatPhone && (
                    <CheckCircle size={20} color="white" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Smartphone size={20} color="#0066A2" />
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1F2937',
                      margin: 0
                    }}>
                      Google Chat - Mobile App
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5'
                  }}>
                    Download the Google Chat app on your phone for mobile communication
                  </p>
                  <a
                    href="https://apps.apple.com/us/app/google-chat/id1163852619"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0066A2',
                      background: 'white',
                      border: '2px solid #0066A2',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Download size={14} />
                    iPhone App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training Modules */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 2rem 0'
          }}>
            Training Modules
          </h2>

          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#eb6a18',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '32px',
              height: '3px',
              background: 'linear-gradient(90deg, #eb6a18 0%, #ff8c3d 100%)',
              borderRadius: '2px'
            }}></div>
            Phase 1
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FFF6ED 0%, #FFE0BA 100%)',
            border: '2px solid rgba(235,106,24,0.25)',
            borderRadius: '14px',
            padding: '1.75rem',
            marginBottom: '2.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => {
            window.location.href = getModuleUrl('Phase 1', 'Orientation');
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(235,106,24,0.3)',
                    flexShrink: 0
                  }}>
                    <Play size={22} color="white" />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#004A69',
                      margin: '0 0 0.25rem 0'
                    }}>
                      1.1 - Orientation
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      margin: 0
                    }}>
                      {MODULE_DESCRIPTIONS['Orientation']}
                    </p>
                  </div>
                </div>
              </div>
              
              {orientationStatus === 'Completed' ? (
                <div style={{
                  background: '#D1FAE5',
                  padding: '0.7rem 1.3rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 6px rgba(0,149,46,0.15)',
                  flexShrink: 0
                }}>
                  <CheckCircle size={18} color="#065F46" />
                  <span style={{
                    fontWeight: 600,
                    color: '#065F46',
                    fontSize: '14px'
                  }}>
                    Completed ✓
                  </span>
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                  padding: '0.7rem 1.3rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(235,106,24,0.3)',
                  color: 'white',
                  flexShrink: 0
                }}>
                  <ArrowRight size={18} />
                  <span style={{
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    Start Now
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#0066A2',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '32px',
              height: '3px',
              background: 'linear-gradient(90deg, #0066A2 0%, #004A69 100%)',
              borderRadius: '2px'
            }}></div>
            Phase 2
          </div>

          {!hasPhase2Progress ? (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
              borderRadius: '14px',
              border: '2px solid rgba(0, 102, 162, 0.25)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 6px 20px rgba(0, 102, 162, 0.25)'
              }}>
                <Clock size={32} color="white" />
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.75rem 0'
              }}>
                Ready for Phase 2?
              </h3>
              <p style={{ 
                color: '#0369A1', 
                marginBottom: '1.75rem', 
                fontSize: '15px',
                fontWeight: 500 
              }}>
                Complete Phase 1 Orientation to unlock Phase 2 modules
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {phase2Progress.map((item, index) => {
                const submission = item.submissionId ? submissions[item.submissionId] : null;
                
                let displayStyle: { bg: string; color: string; icon: any; text: string };
                
                if (submission) {
                  displayStyle = getStatusStyle(item.Status, submission.status);
                } else if (item.Status === 'Completed' && item.submissionId) {
                  displayStyle = { bg: '#FEF3C7', color: '#92400E', icon: Clock, text: 'Under Review' };
                } else {
                  displayStyle = getStatusStyle(item.Status);
                }
                
                const StatusIcon = displayStyle.icon;
                const ModuleIcon = MODULE_ICONS[item.module] || BookOpen;
                
                return (
                  <div key={index} style={{
                    border: `2px solid ${submission?.status === 'Needs Work' ? '#FCA5A5' : '#E5E7EB'}`,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    background: submission?.status === 'Needs Work' ? '#FEF2F2' : 'white',
                    boxShadow: submission?.status === 'Needs Work' ? '0 2px 12px rgba(220,38,38,0.1)' : 'none'
                  }}>
                    <div style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <ModuleIcon size={20} color="white" />
                          </div>
                          <div>
                            <div style={{
                              fontSize: '17px',
                              fontWeight: 600,
                              color: '#1F2937',
                              marginBottom: '0.25rem'
                            }}>
                              {MODULE_NUMBERS[item.module] || ''} - {item.module}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6B7280' }}>
                              {MODULE_DESCRIPTIONS[item.module] || 'Complete this training module'}
                            </div>
                          </div>
                        </div>
                        {submission && (
                          <div style={{ fontSize: '13px', color: '#9CA3AF', marginLeft: '52px' }}>
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{
                          background: displayStyle.bg,
                          padding: '0.65rem 1.1rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          flexShrink: 0
                        }}>
                          <StatusIcon size={16} color={displayStyle.color} />
                          <span style={{
                            fontWeight: 600,
                            color: displayStyle.color,
                            fontSize: '13px'
                          }}>
                            {displayStyle.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {submission?.professorNotes && (
                      <div style={{
                        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                        padding: '1.25rem 1.5rem',
                        borderTop: '1px solid rgba(0,102,162,0.1)'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0369A1',
                          marginBottom: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Professor Feedback
                        </div>
                        <p style={{
                          color: '#0C4A6E',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          margin: 0,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {submission.professorNotes}
                        </p>
                      </div>
                    )}

                    <div style={{
                      padding: '1rem 1.5rem',
                      background: '#F9FAFB',
                      display: 'flex',
                      gap: '0.75rem',
                      justifyContent: 'flex-end',
                      flexWrap: 'wrap'
                    }}>
                      {item.submissionId && (
                        <button
                          onClick={() => window.location.href = `/review/${item.submissionId}`}
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#0066A2',
                            background: 'white',
                            border: '2px solid #0066A2',
                            borderRadius: '8px',
                            padding: '0.5rem 1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <Eye size={14} />
                          View Submission
                        </button>
                      )}
                      
                      {(!item.submissionId || submission?.status === 'Needs Work') && (
                        <button
                          onClick={() => {
                            const url = getModuleUrl(item.phase, item.module);
                            window.location.href = url;
                          }}
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'white',
                            background: submission?.status === 'Needs Work' 
                              ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
                              : 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          {submission?.status === 'Needs Work' ? 'Revise & Resubmit' : 'Start Module'}
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Apps & Resources */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 1.75rem 0'
          }}>
            Apps & Resources
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            <ResourceCard
              href="https://studio.oclef.com/notation"
              icon={<Music2 size={24} color="white" strokeWidth={2} />}
              title="Oclef Notation App"
              subtitle="PDF Annotation Tool"
              description="Annotate lesson scores with practice icons, shapes, and notes"
              color="#471657"
            />
            <ResourceCard
              href="https://events.oclef.com"
              icon={<Theater size={24} color="white" strokeWidth={2} />}
              title="Oclef Events"
              subtitle="Community Calendar"
              description="Browse upcoming recitals, masterclasses, and performances"
              color="#B9314F"
            />
            <ResourceCard
              href="https://studio.oclef.com/virtuoso-piano"
              icon={<Piano size={24} color="white" strokeWidth={2} />}
              title="Virtuoso Piano"
              subtitle="MIDI Instrument"
              description="Browser-based MIDI piano with velocity-sensitive playback"
              color="#471657"
            />
            <ResourceCard
              href="https://blog.oclef.com"
              icon={<PenLine size={24} color="white" strokeWidth={2} />}
              title="Oclef Blog"
              subtitle="Articles & Insights"
              description="Teaching strategies, pedagogy insights, and faculty reflections"
              color="#B9314F"
            />
            <ResourceCard
              href="https://www.thevivekproject.com"
              icon={<BookOpen size={24} color="white" strokeWidth={2} />}
              title="The Vivek Project"
              subtitle="Pedagogical Study"
              description="Longitudinal study with teaching videos and expert commentary"
              color="#00952E"
            />
            <ResourceCard
              href="https://studio.oclef.com/instructor.html"
              icon={<Target size={24} color="white" strokeWidth={2} />}
              title="Instructor Assessment"
              subtitle="Evaluation Rubric"
              description="Official rubric for instructor promotion evaluations"
              color="#eb6a18"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ href, icon, title, subtitle, description, color }: {
  href: string;
  icon: React.ReactNode;
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
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        border: `2px solid ${isHovered ? color : '#E5E7EB'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 24px ${color}18` : '0 2px 8px rgba(0,0,0,0.04)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${color}25`,
          flexShrink: 0,
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#1F2937',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h3>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <p style={{
        fontSize: '13px',
        color: '#4B5563',
        margin: 0,
        lineHeight: '1.6'
      }}>
        {description}
      </p>
    </a>
  );
};

export default Dashboard;
