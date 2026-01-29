import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { apprenticeCache } from '../lib/apprenticeCache';
import { LogOut, Users, Clock, CheckCircle, ExternalLink, Settings, ChevronDown, Plus, X, UserPlus, Copy, Check, Shield, ClipboardList, GraduationCap, RotateCcw, Music2, Theater, Piano, PenLine, BookOpen, Target, Search, UserMinus, ChevronUp, Moon, Sun, Star } from 'lucide-react';
import MasqueradeBanner from '../components/MasqueradeBanner';
import DarkModeToggle from '../components/DarkModeToggle';
import NotificationCenter from '../components/NotificationCenter';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useOnboarding, OnboardingStep } from '../contexts/OnboardingContext';

// Super admin emails - hardcoded admins plus any from environment variable
const HARDCODED_ADMINS = ['julian@oclef.com'];
const ENV_ADMINS = (import.meta.env.VITE_SUPER_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
const SUPER_ADMIN_EMAILS = [...new Set([...HARDCODED_ADMINS, ...ENV_ADMINS])];

interface Apprentice {
  id: string;
  apprenticeId: string;
  name: string;
  email: string;
  dashboardToken: string;
  createdAt?: string;
  employmentType?: '1099' | 'part-time' | null;
  graduated?: boolean;
  graduatedAt?: string;
  graduation_token?: string;
  professorEmail?: string;
}

interface FollowedApprentice extends Apprentice {
  followedAt: string;
  primaryProfessor: string;
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
  const location = useLocation();
  const { isDarkMode } = useDarkMode();

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
      // Clean up URL by removing masquerade params (optional, for cleaner URL)
      window.history.replaceState({}, '', '/professor');
    }
  }, [location.search]);

  const [apprentices, setApprentices] = useState<Apprentice[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress[]>>({});
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [apprenticeProfiles, setApprenticeProfiles] = useState<Record<string, { avatarUrl?: string }>>({});
  // School-wide analytics data
  const [schoolWideApprentices, setSchoolWideApprentices] = useState<Array<{
    email: string;
    createdAt?: string;
    graduated?: boolean;
    graduatedAt?: string;
  }>>([]);
  const [schoolWideProgress, setSchoolWideProgress] = useState<Array<{
    Status: string;
    module: string;
    phase: string;
    apprenticeEmail: string;
  }>>([]);
  const [schoolWidePendingCount, setSchoolWidePendingCount] = useState(0);
  const [schoolWideSubmissions, setSchoolWideSubmissions] = useState<Array<{
    submittedAt: string;
    status: string;
  }>>([]);
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

  // Graduated section state
  const [showGraduated, setShowGraduated] = useState(false);

  // Graduation success modal state
  const [graduationSuccess, setGraduationSuccess] = useState<{ name: string; token: string } | null>(null);
  const [graduationLinkCopied, setGraduationLinkCopied] = useState(false);

  // Follow apprentice feature state
  const [followedApprentices, setFollowedApprentices] = useState<FollowedApprentice[]>([]);
  const [showFollowing, setShowFollowing] = useState(true);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Apprentice[]>([]);
  const [searching, setSearching] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Get effective email for data fetching (use masqueradeEmail when masquerading)
  const effectiveProfessorEmail = isMasquerading
    ? sessionStorage.getItem('masqueradeEmail') || user?.email
    : user?.email;

  // Get display name (use masqueradeName when masquerading)
  const masqueradeName = isMasquerading ? sessionStorage.getItem('masqueradeName') : null;
  const displayName = masqueradeName || profile?.firstName || profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Professor';

  // Notifications and onboarding
  const { addNotification } = useNotifications();
  const { startTour, hasCompletedTour } = useOnboarding();

  // Track if this is the initial load vs a real-time update
  const isInitialLoad = useRef(true);

  // Onboarding tour steps for professor dashboard
  const professorTourSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      target: '[data-tour="dashboard-title"]',
      title: 'Welcome to Professor Dashboard!',
      content: 'This is your command center for managing apprentices and tracking their progress through the training modules.',
      placement: 'bottom'
    },
    {
      id: 'add-apprentice',
      target: '[data-tour="add-apprentice-btn"]',
      title: 'Add Your First Apprentice',
      content: 'Click here to add a new apprentice. They\'ll receive an email with their unique training dashboard link.',
      placement: 'bottom',
      action: 'Got it!'
    },
    {
      id: 'submissions',
      target: '[data-tour="pending-submissions"]',
      title: 'Review Submissions',
      content: 'When apprentices complete modules, their submissions appear here for your review. Approve or request revisions.',
      placement: 'left'
    },
    {
      id: 'notifications',
      target: '[data-tour="notification-bell"]',
      title: 'Stay Updated',
      content: 'The notification bell keeps you informed of new submissions, approvals, and important updates.',
      placement: 'bottom',
      action: 'Finish Tour'
    }
  ];

  // Start onboarding tour on first visit
  useEffect(() => {
    if (!loading && !hasCompletedTour('professor-dashboard')) {
      // Delay slightly to let the page render
      const timer = setTimeout(() => {
        startTour('professor-dashboard', professorTourSteps);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, hasCompletedTour, startTour]);

  const fetchData = useCallback(async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      setError('');

      // Use effectiveProfessorEmail for masquerade support
      const emailToUse = effectiveProfessorEmail;
      console.log('[ProfessorDashboard] Fetching data for email:', emailToUse, 'isMasquerading:', isMasquerading);

      const { data: apprenticesData, error: apprenticesError } = await supabase
        .from('apprentices')
        .select('*')
        .eq('professorEmail', emailToUse);

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

        // Fetch apprentice profile photos
        // Use lowercase emails for case-insensitive matching
        const lowercaseEmails = emails.map(e => e.toLowerCase());
        console.log('[ProfessorDashboard] Looking for profiles with emails:', lowercaseEmails);

        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('email, avatarUrl');

        console.log('[ProfessorDashboard] Profiles fetched:', profilesData);
        console.log('[ProfessorDashboard] Profiles error:', profilesError);

        if (profilesError) {
          console.error('Error fetching apprentice profiles:', profilesError);
        } else {
          const profilesMap: Record<string, { avatarUrl?: string }> = {};
          (profilesData || []).forEach(p => {
            // Store with lowercase key for case-insensitive lookup
            if (p.email && lowercaseEmails.includes(p.email.toLowerCase())) {
              console.log('[ProfessorDashboard] Matched profile:', p.email, 'avatarUrl:', p.avatarUrl);
              profilesMap[p.email.toLowerCase()] = { avatarUrl: p.avatarUrl };
            }
          });
          console.log('[ProfessorDashboard] Final profilesMap:', profilesMap);
          setApprenticeProfiles(profilesMap);
        }
      }

      console.log('[ProfessorDashboard] Fetching submissions for professor:', emailToUse);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('professorEmail', emailToUse)
        .eq('status', 'Pending')
        .order('submittedAt', { ascending: false });

      console.log('[ProfessorDashboard] Submissions fetched:', submissionsData);
      console.log('[ProfessorDashboard] Submissions error:', submissionsError);

      if (submissionsError) throw submissionsError;
      setPendingSubmissions(submissionsData || []);

      // Fetch followed apprentices
      const { data: followsData, error: followsError } = await supabase
        .from('professor_follows')
        .select('apprentice_id, followed_at')
        .eq('professor_email', user?.email);

      if (followsError) {
        console.error('Error fetching follows:', followsError);
      } else if (followsData && followsData.length > 0) {
        const followedIds = followsData.map(f => f.apprentice_id);
        setFollowingIds(new Set(followedIds));

        // Fetch the full apprentice data for followed apprentices
        const { data: followedData, error: followedError } = await supabase
          .from('apprentices')
          .select('*')
          .in('apprenticeId', followedIds);

        if (followedError) {
          console.error('Error fetching followed apprentices:', followedError);
        } else if (followedData) {
          // Merge with follow data
          const followedWithMeta: FollowedApprentice[] = followedData.map(a => {
            const followInfo = followsData.find(f => f.apprentice_id === a.apprenticeId);
            return {
              ...a,
              followedAt: followInfo?.followed_at || new Date().toISOString(),
              primaryProfessor: a.professorEmail || 'Unknown'
            };
          });
          setFollowedApprentices(followedWithMeta);

          // Also fetch progress for followed apprentices
          const followedEmails = followedData.map(a => a.email);
          const { data: followedProgressData } = await supabase
            .from('progress')
            .select('*')
            .in('apprenticeEmail', followedEmails);

          if (followedProgressData) {
            const newProgressMap = { ...progress };
            followedProgressData.forEach(p => {
              if (!newProgressMap[p.apprenticeEmail]) {
                newProgressMap[p.apprenticeEmail] = [];
              }
              if (!newProgressMap[p.apprenticeEmail].find(existing =>
                existing.phase === p.phase && existing.module === p.module
              )) {
                newProgressMap[p.apprenticeEmail].push(p);
              }
            });
            setProgress(newProgressMap);
          }
        }
      } else {
        setFollowedApprentices([]);
        setFollowingIds(new Set());
      }

      // Fetch school-wide data for analytics dashboard
      const [schoolApprenticesResult, schoolProgressResult, schoolPendingResult, schoolSubmissionsResult] = await Promise.all([
        // All apprentices school-wide
        supabase
          .from('apprentices')
          .select('email, createdAt, graduated, graduatedAt'),
        // All progress records school-wide
        supabase
          .from('progress')
          .select('Status, module, phase, apprenticeEmail'),
        // Count of all pending submissions school-wide
        supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Pending'),
        // All submissions for activity tracking (last 30 days)
        supabase
          .from('submissions')
          .select('submittedAt, status')
          .gte('submittedAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (schoolApprenticesResult.error) {
        console.error('Error fetching school-wide apprentices:', schoolApprenticesResult.error);
      } else {
        setSchoolWideApprentices(schoolApprenticesResult.data || []);
      }

      if (schoolProgressResult.error) {
        console.error('Error fetching school-wide progress:', schoolProgressResult.error);
      } else {
        setSchoolWideProgress(schoolProgressResult.data || []);
      }

      if (schoolPendingResult.error) {
        console.error('Error fetching school-wide pending count:', schoolPendingResult.error);
      } else {
        setSchoolWidePendingCount(schoolPendingResult.count || 0);
      }

      if (schoolSubmissionsResult.error) {
        console.error('Error fetching school-wide submissions:', schoolSubmissionsResult.error);
      } else {
        setSchoolWideSubmissions(schoolSubmissionsResult.data || []);
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [user?.email, effectiveProfessorEmail, isMasquerading]);

  // Initial data fetch and real-time subscriptions
  useEffect(() => {
    if (!effectiveProfessorEmail) return;

    // Initial fetch
    fetchData();

    // Set up real-time subscriptions for automatic updates
    // Use effectiveProfessorEmail for masquerade support
    const emailForSubscription = effectiveProfessorEmail;

    const apprenticesChannel = supabase
      .channel('professor-apprentices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apprentices',
          filter: `professorEmail=eq.${emailForSubscription}`
        },
        () => {
          console.log('[RealTime] Apprentices changed, refreshing...');
          fetchData(false);
        }
      )
      .subscribe();

    const submissionsChannel = supabase
      .channel('professor-submissions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `professorEmail=eq.${emailForSubscription}`
        },
        (payload) => {
          console.log('[RealTime] Submissions changed, refreshing...', payload.eventType);
          fetchData(false);

          // Add notification for new submissions
          if (payload.eventType === 'INSERT' && payload.new) {
            const newSubmission = payload.new as { studentName?: string; moduleName?: string; submissionId?: string };
            addNotification({
              type: 'submission',
              title: 'New Submission',
              message: `${newSubmission.studentName || 'An apprentice'} submitted ${newSubmission.moduleName || 'a module'} for review`,
              link: newSubmission.submissionId ? `/review/${newSubmission.submissionId}` : undefined
            });
          }
        }
      )
      .subscribe();

    const progressChannel = supabase
      .channel('professor-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress'
        },
        () => {
          console.log('[RealTime] Progress changed, refreshing...');
          fetchData(false);
        }
      )
      .subscribe();

    // Also refresh when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialLoad.current) {
        console.log('[Visibility] Tab visible, refreshing...');
        fetchData(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(apprenticesChannel);
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(progressChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [effectiveProfessorEmail, fetchData]);

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

  const toggleGraduated = async (apprentice: Apprentice, graduated: boolean) => {
    try {
      // Generate a unique graduation token for shareable celebration link
      const graduationToken = graduated
        ? `grad-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
        : null;

      // Use dashboardToken as the unique identifier (consistent with other operations)
      const { data: updateData, error: updateError } = await supabase
        .from('apprentices')
        .update({
          graduated,
          graduatedAt: graduated ? new Date().toISOString() : null,
          graduation_token: graduationToken
        })
        .eq('dashboardToken', apprentice.dashboardToken)
        .select();

      if (updateError) throw updateError;

      // Verify the update actually affected a row
      if (!updateData || updateData.length === 0) {
        throw new Error('No apprentice found to update. Please refresh and try again.');
      }

      // Update local state
      setApprentices(prev => prev.map(a =>
        a.dashboardToken === apprentice.dashboardToken
          ? {
              ...a,
              graduated,
              graduatedAt: graduated ? new Date().toISOString() : undefined,
              graduation_token: graduationToken || undefined
            }
          : a
      ));

      // Show success modal with celebration link when graduating
      if (graduated && graduationToken) {
        setGraduationSuccess({ name: apprentice.name, token: graduationToken });
        addNotification({
          type: 'achievement',
          title: 'Graduation Complete!',
          message: `${apprentice.name} has been graduated from the Professor Academy.`
        });
      }
    } catch (err: any) {
      console.error('Error updating graduated status:', err);
      setError(err.message || 'Failed to update apprentice status');
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Graduation Failed',
        message: err.message || 'Failed to graduate apprentice. Please try again.'
      });
    }
  };

  // Split apprentices into active and graduated
  const activeApprentices = apprentices.filter(a => !a.graduated);
  const graduatedApprentices = apprentices.filter(a => a.graduated);

  // Search for apprentices to follow
  const searchApprentices = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error: searchError } = await supabase
        .from('apprentices')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('professorEmail', effectiveProfessorEmail) // Exclude current professor's apprentices
        .limit(10);

      if (searchError) throw searchError;

      // Filter out already followed apprentices
      const filtered = (data || []).filter(a => !followingIds.has(a.apprenticeId));
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching apprentices:', err);
    } finally {
      setSearching(false);
    }
  };

  // Follow an apprentice
  const followApprentice = async (apprentice: Apprentice) => {
    try {
      const { error: followError } = await supabase
        .from('professor_follows')
        .insert({
          professor_email: user?.email,
          apprentice_id: apprentice.apprenticeId
        });

      if (followError) throw followError;

      // Update local state
      setFollowingIds(prev => new Set([...prev, apprentice.apprenticeId]));
      setFollowedApprentices(prev => [...prev, {
        ...apprentice,
        followedAt: new Date().toISOString(),
        primaryProfessor: apprentice.professorEmail || 'Unknown'
      }]);

      // Remove from search results
      setSearchResults(prev => prev.filter(a => a.apprenticeId !== apprentice.apprenticeId));

      // Fetch progress for this apprentice
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('apprenticeEmail', apprentice.email);

      if (progressData) {
        setProgress(prev => ({
          ...prev,
          [apprentice.email]: progressData
        }));
      }
    } catch (err: any) {
      console.error('Error following apprentice:', err);
      setError(err.message || 'Failed to follow apprentice');
    }
  };

  // Unfollow an apprentice
  const unfollowApprentice = async (apprentice: FollowedApprentice) => {
    try {
      const { error: unfollowError } = await supabase
        .from('professor_follows')
        .delete()
        .eq('professor_email', user?.email)
        .eq('apprentice_id', apprentice.apprenticeId);

      if (unfollowError) throw unfollowError;

      // Update local state
      setFollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(apprentice.apprenticeId);
        return newSet;
      });
      setFollowedApprentices(prev => prev.filter(a => a.apprenticeId !== apprentice.apprenticeId));
    } catch (err: any) {
      console.error('Error unfollowing apprentice:', err);
      setError(err.message || 'Failed to unfollow apprentice');
    }
  };

  const resetFollowModal = () => {
    setShowFollowModal(false);
    setSearchQuery('');
    setSearchResults([]);
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
          gap: '1.5rem'
        }}>
          {/* Premium Loading Spinner */}
          <div style={{
            position: 'relative',
            width: '56px',
            height: '56px'
          }}>
            {/* Outer ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid #E5E7EB'
            }} />
            {/* Spinning gradient ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#004A69',
              borderRightColor: '#0066A2',
              animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite'
            }} />
            {/* Center icon */}
            <div style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,74,105,0.3)'
            }}>
              <Users size={20} color="white" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#002642',
              margin: '0 0 0.25rem 0'
            }}>
              Loading Dashboard
            </p>
            <p style={{
              fontSize: '13px',
              color: 'rgba(0, 38, 66, 0.6)',
              margin: 0
            }}>
              Fetching your apprentices...
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

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      paddingTop: isMasquerading ? '52px' : '0',
      transition: 'background 0.4s ease'
    }}>
      <MasqueradeBanner />
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #002642 0%, #004A69 50%, #0066A2 100%)',
        boxShadow: '0 4px 20px rgba(0, 38, 66, 0.15)',
        position: 'sticky',
        top: isMasquerading ? '52px' : '0',
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
            gap: '1rem'
          }}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <h1
                data-tour="dashboard-title"
                style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 'clamp(20px, 5vw, 28px)',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.5px'
              }}>
                Professor Dashboard
              </h1>
              <p style={{
                fontSize: 'clamp(12px, 3vw, 16px)',
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Welcome back, {displayName}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
              {/* Notification Center */}
              <div data-tour="notification-bell">
                <NotificationCenter />
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
                        fontFamily: "'Lora', Georgia, serif",
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'white'
                      }}>
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="profile-name-text">{displayName}</span>
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
                      left: 'auto',
                      marginTop: '0.5rem',
                      background: isDarkMode ? '#1f2937' : 'white',
                      borderRadius: '12px',
                      boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0,0,0,0.4)'
                        : '0 8px 32px rgba(0,0,0,0.15)',
                      border: isDarkMode ? '1px solid #374151' : 'none',
                      width: '220px',
                      zIndex: 20,
                      overflow: 'hidden',
                      transition: 'background 0.3s ease, box-shadow 0.3s ease'
                    }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isDarkMode ? '#F9FAFB' : '#002642',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {profile?.firstName && profile?.lastName
                            ? `${profile.firstName} ${profile.lastName}`
                            : displayName}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)',
                          margin: 0
                        }}>
                          {user?.email}
                        </p>
                      </div>
                      <div style={{ padding: '0.5rem' }}>
                        {user?.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) && (
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              navigate('/admin');
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem 1rem',
                              background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.1) 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease',
                              textAlign: 'left',
                              marginBottom: '0.25rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.2) 100%)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.1) 100%)';
                            }}
                          >
                            <Shield size={18} color="#D97706" />
                            <span style={{ fontSize: '14px', color: '#D97706', fontWeight: 600 }}>Admin View</span>
                          </button>
                        )}
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
                            e.currentTarget.style.background = isDarkMode ? '#374151' : '#F3F4F6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <Settings size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <span style={{ fontSize: '14px', color: isDarkMode ? '#E5E7EB' : '#002642' }}>Settings</span>
                        </button>

                        {/* Dark Mode Toggle */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {isDarkMode ? (
                              <Moon size={18} color="#9CA3AF" />
                            ) : (
                              <Sun size={18} color="#F59E0B" />
                            )}
                            <span style={{ fontSize: '14px', color: isDarkMode ? '#E5E7EB' : '#002642' }}>
                              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                            </span>
                          </div>
                          <DarkModeToggle size="small" />
                        </div>

                        <div style={{
                          height: '1px',
                          background: isDarkMode ? '#374151' : '#E5E7EB',
                          margin: '0.5rem 0'
                        }} />

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

        {/* Analytics Dashboard - School-wide data */}
        <AnalyticsDashboard
          schoolWideData={{
            apprentices: schoolWideApprentices,
            progress: schoolWideProgress,
            pendingSubmissions: schoolWidePendingCount,
            submissions: schoolWideSubmissions
          }}
          isDarkMode={isDarkMode}
        />

        {/* Pending Reviews Section */}
        <section data-tour="pending-submissions" style={{ marginBottom: '2.5rem' }}>
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
              fontFamily: "'Lora', Georgia, serif",
              fontSize: '22px',
              fontWeight: 700,
              color: isDarkMode ? '#F9FAFB' : '#002642',
              margin: 0
            }}>
              Pending Reviews ({pendingSubmissions.length})
            </h2>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #1E293B 0%, #1a2332 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(235, 106, 24, 0.1)'
            }}>
              {/* Decorative background elements */}
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '8%',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                animation: 'float-caught-up 4s ease-in-out infinite',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '15%',
                right: '10%',
                width: '45px',
                height: '45px',
                borderRadius: '12px',
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.15) 100%)',
                animation: 'float-caught-up 3.5s ease-in-out infinite 0.5s',
                transform: 'rotate(15deg)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                top: '25%',
                right: '15%',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
                animation: 'float-caught-up 3s ease-in-out infinite 1s',
                transform: 'rotate(-10deg)',
                pointerEvents: 'none'
              }} />

              {/* Main illustration */}
              <div style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                margin: '0 auto 1.5rem',
                zIndex: 1
              }}>
                {/* Success rings */}
                <div style={{
                  position: 'absolute',
                  inset: '-15px',
                  borderRadius: '50%',
                  border: isDarkMode
                    ? '2px solid rgba(16, 185, 129, 0.15)'
                    : '2px solid rgba(16, 185, 129, 0.2)',
                  animation: 'pulse-ring-caught-up 2.5s ease-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: '-30px',
                  borderRadius: '50%',
                  border: isDarkMode
                    ? '2px solid rgba(16, 185, 129, 0.08)'
                    : '2px solid rgba(16, 185, 129, 0.1)',
                  animation: 'pulse-ring-caught-up 2.5s ease-out infinite 0.5s'
                }} />

                {/* Main circle with checkmark */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.35)',
                  animation: 'bounce-caught-up 3s ease-in-out infinite',
                  position: 'relative'
                }}>
                  <CheckCircle size={60} color="white" strokeWidth={2.5} />

                  {/* Sparkle decorations */}
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '10px',
                    animation: 'sparkle-caught-up 2s ease-in-out infinite'
                  }}>
                    <Star size={18} color="#FBBF24" fill="#FBBF24" />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '5px',
                    animation: 'sparkle-caught-up 2s ease-in-out infinite 0.7s'
                  }}>
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                  </div>
                </div>
              </div>

              <h3 style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: '24px',
                fontWeight: 700,
                color: isDarkMode ? '#F9FAFB' : '#002642',
                margin: '0 0 0.75rem 0',
                position: 'relative',
                zIndex: 1
              }}>
                All caught up!
              </h3>
              <p style={{
                fontSize: '15px',
                color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)',
                margin: '0 0 1.5rem 0',
                maxWidth: '320px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 1
              }}>
                No pending submissions to review. New submissions will appear here when your apprentices complete their work.
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
                    background: isDarkMode ? '#1E293B' : 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
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
                        fontFamily: "'Lora', Georgia, serif",
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#002642',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {submission.moduleNumber} - {submission.moduleName}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(0, 38, 66, 0.6)',
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
                fontFamily: "'Lora', Georgia, serif",
                fontSize: '22px',
                fontWeight: 700,
                color: isDarkMode ? '#F9FAFB' : '#002642',
                margin: 0
              }}>
                Your Apprentices ({activeApprentices.length})
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowFollowModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#004A69',
                  background: 'white',
                  border: '2px solid #004A69',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0F9FF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Search size={18} />
                Follow Apprentice
              </button>
              <button
                data-tour="add-apprentice-btn"
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
          </div>

          {activeApprentices.length === 0 ? (
            <div style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
              borderRadius: '24px',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,74,105,0.1)',
              position: 'relative',
              overflow: 'hidden',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,74,105,0.1)'
            }}>
              {/* Decorative background elements */}
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isDarkMode ? 'rgba(235,106,24,0.1)' : 'rgba(235,106,24,0.08)',
                animation: 'float-empty 4s ease-in-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '15%',
                right: '15%',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isDarkMode ? 'rgba(0,102,162,0.15)' : 'rgba(0,102,162,0.1)',
                animation: 'float-empty 4s ease-in-out infinite 1s'
              }} />
              <div style={{
                position: 'absolute',
                top: '40%',
                right: '8%',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: isDarkMode ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.15)',
                animation: 'float-empty 4s ease-in-out infinite 0.5s'
              }} />

              {/* Illustrated icon */}
              <div style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                margin: '0 auto 2rem',
                zIndex: 1
              }}>
                {/* Background circle */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(235,106,24,0.2) 0%, rgba(255,140,61,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(235,106,24,0.15) 0%, rgba(255,140,61,0.05) 100%)',
                  animation: 'pulse-empty 3s ease-in-out infinite'
                }} />
                {/* Inner circle */}
                <div style={{
                  position: 'absolute',
                  inset: '20px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 40px rgba(235,106,24,0.4)',
                  animation: 'bounce-empty 2s ease-in-out infinite'
                }}>
                  <Users size={48} color="white" strokeWidth={1.5} />
                </div>
                {/* Decorative dots */}
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '20px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#FBBF24',
                  animation: 'sparkle-empty 2s ease-in-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '15px',
                  left: '10px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                  animation: 'sparkle-empty 2s ease-in-out infinite 0.5s'
                }} />
              </div>

              <h3 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                color: isDarkMode ? '#F9FAFB' : '#002642',
                margin: '0 0 0.75rem 0',
                position: 'relative',
                zIndex: 1
              }}>
                Ready for Your First Apprentice!
              </h3>
              <p style={{
                fontSize: '16px',
                color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)',
                margin: '0 0 2rem 0',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 1
              }}>
                Start building your teaching studio by adding your first apprentice. They'll appear here ready for training.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(235,106,24,0.35)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(235,106,24,0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(235,106,24,0.35)';
                }}
              >
                <UserPlus size={20} />
                Add Your First Apprentice
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {activeApprentices.map((apprentice) => {
                const summary = getProgressSummary(apprentice.email);
                return (
                  <div
                    key={apprentice.id}
                    style={{
                      background: isDarkMode ? '#1E293B' : 'white',
                      borderRadius: '20px',
                      padding: '1.75rem',
                      boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)';
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
                          background: apprenticeProfiles[apprentice.email.toLowerCase()]?.avatarUrl
                            ? `url(${apprenticeProfiles[apprentice.email.toLowerCase()].avatarUrl}) center/cover no-repeat`
                            : 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,74,105,0.3)'
                        }}>
                          {!apprenticeProfiles[apprentice.email.toLowerCase()]?.avatarUrl && (
                            <span style={{
                              fontFamily: "'Lora', Georgia, serif",
                              fontSize: '20px',
                              fontWeight: 700,
                              color: 'white'
                            }}>
                              {apprentice.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 style={{
                            fontFamily: "'Lora', Georgia, serif",
                            fontSize: '17px',
                            fontWeight: 600,
                            color: isDarkMode ? '#F9FAFB' : '#002642',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {apprentice.name}
                          </h3>
                          <p style={{
                            fontSize: '13px',
                            color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)',
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
                        <span style={{ color: 'rgba(0, 38, 66, 0.6)', fontWeight: 500 }}>Progress</span>
                        <span style={{ color: '#002642', fontWeight: 600 }}>
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

                    {/* Ready to Graduate Indicator */}
                    {summary.completed >= 5 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        border: '2px solid #F59E0B',
                        animation: 'pulse-subtle 2s ease-in-out infinite'
                      }}>
                        <GraduationCap size={18} color="#B45309" />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#B45309'
                        }}>
                          Ready to Graduate!
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: '#92400E',
                          marginLeft: 'auto'
                        }}>
                          All modules complete
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem'
                    }}>
                      <button
                        onClick={() => window.open(`/dashboard/${apprentice.dashboardToken}`, '_blank')}
                        style={{
                          flex: 1,
                          padding: '0.85rem',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#002642',
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
                        Dashboard
                      </button>
                      <button
                        onClick={() => window.open(`/skills/${apprentice.dashboardToken}`, '_blank')}
                        style={{
                          flex: 1,
                          padding: '0.85rem',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#471657',
                          background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                          border: '2px solid #DDD6FE',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          apprenticeCache.prefetch(apprentice.dashboardToken);
                          e.currentTarget.style.background = 'linear-gradient(135deg, #471657 0%, #6B2C7B 100%)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#471657';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)';
                          e.currentTarget.style.color = '#471657';
                          e.currentTarget.style.borderColor = '#DDD6FE';
                        }}
                      >
                        <ClipboardList size={16} />
                        Skills List
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGraduated(apprentice, true);
                        }}
                        style={{
                          padding: '0.85rem',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#059669',
                          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                          border: '2px solid #A7F3D0',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #10B981 100%)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)';
                          e.currentTarget.style.color = '#059669';
                          e.currentTarget.style.borderColor = '#A7F3D0';
                        }}
                        title="Mark as graduated"
                      >
                        <GraduationCap size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Following Section */}
        {followedApprentices.length > 0 && (
          <section style={{ marginTop: '2.5rem' }}>
            <button
              onClick={() => setShowFollowing(!showFollowing)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                background: '#FFF6ED',
                border: '2px solid #C4E5F4',
                borderRadius: '16px',
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                marginBottom: showFollowing ? '1.5rem' : 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={18} color="white" />
                </div>
                <span style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#002642'
                }}>
                  Following ({followedApprentices.length})
                </span>
                <span style={{
                  fontSize: '13px',
                  color: 'rgba(0, 38, 66, 0.5)',
                  fontWeight: 500
                }}>
                  • Other professors' apprentices you're tracking
                </span>
              </div>
              {showFollowing ? <ChevronUp size={20} color="#004A69" /> : <ChevronDown size={20} color="#004A69" />}
            </button>

            {showFollowing && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.25rem'
              }}>
                {followedApprentices.map((apprentice) => {
                  const progressSummary = getProgressSummary(apprentice.email);
                  const apprenticeProfile = apprenticeProfiles[apprentice.email.toLowerCase()];

                  return (
                    <div key={apprentice.id} style={{
                      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                      borderRadius: '20px',
                      padding: '1.75rem',
                      boxShadow: '0 4px 16px rgba(0, 38, 66, 0.06)',
                      border: '2px solid #C4E5F4',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}>
                      {/* Following Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Following
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.25rem'
                      }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: apprenticeProfile?.avatarUrl
                            ? `url(${apprenticeProfile.avatarUrl}) center/cover no-repeat`
                            : 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,102,162,0.2)',
                          flexShrink: 0
                        }}>
                          {!apprenticeProfile?.avatarUrl && (
                            <span style={{
                              color: 'white',
                              fontSize: '20px',
                              fontWeight: 700
                            }}>
                              {apprentice.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontFamily: "'Lora', Georgia, serif",
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#002642',
                            margin: '0 0 0.25rem 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {apprentice.name}
                          </h3>
                          <p style={{
                            fontSize: '13px',
                            color: 'rgba(0, 38, 66, 0.6)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            Primary: {apprentice.primaryProfessor}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div style={{
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontSize: '13px', color: 'rgba(0, 38, 66, 0.6)' }}>Progress</span>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#002642'
                          }}>
                            {progressSummary.completed}/{progressSummary.total || 5} modules
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
                            width: `${progressSummary.total ? (progressSummary.completed / progressSummary.total) * 100 : 0}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #0066A2 0%, #004A69 100%)',
                            borderRadius: '50px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                      }}>
                        <a
                          href={`/dashboard/${apprentice.dashboardToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 1rem',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'white',
                            background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <ExternalLink size={14} />
                          Dashboard
                        </a>
                        <a
                          href={`/skills/${apprentice.dashboardToken}`}
                          onMouseEnter={() => apprenticeCache.prefetch(apprentice.dashboardToken)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 1rem',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#004A69',
                            background: 'white',
                            border: '2px solid #004A69',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <ClipboardList size={14} />
                          Skills
                        </a>
                        <button
                          onClick={() => unfollowApprentice(apprentice)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.65rem',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#B9314F',
                            background: '#FEE2E2',
                            border: '2px solid #FECACA',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          title="Unfollow"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Graduated Apprentices Section */}
        {graduatedApprentices.length > 0 && (
          <section style={{ marginTop: '2.5rem' }}>
            <button
              onClick={() => setShowGraduated(!showGraduated)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
              }}>
                <GraduationCap size={22} color="white" />
              </div>
              <h2 style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#002642',
                margin: 0
              }}>
                Graduated ({graduatedApprentices.length})
              </h2>
              <ChevronDown
                size={20}
                color="#6B7280"
                style={{
                  transform: showGraduated ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {showGraduated && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem'
              }}>
                {graduatedApprentices.map((apprentice) => {
                  const summary = getProgressSummary(apprentice.email);
                  return (
                    <div
                      key={apprentice.id}
                      style={{
                        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                        border: '2px solid #E5E7EB',
                        opacity: 0.9,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
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
                            background: apprenticeProfiles[apprentice.email.toLowerCase()]?.avatarUrl
                              ? `url(${apprenticeProfiles[apprentice.email.toLowerCase()].avatarUrl}) center/cover no-repeat`
                              : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(107,114,128,0.3)'
                          }}>
                            {!apprenticeProfiles[apprentice.email.toLowerCase()]?.avatarUrl && (
                              <span style={{
                                fontFamily: "'Lora', Georgia, serif",
                                fontSize: '20px',
                                fontWeight: 700,
                                color: 'white'
                              }}>
                                {apprentice.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 style={{
                              fontFamily: "'Lora', Georgia, serif",
                              fontSize: '17px',
                              fontWeight: 600,
                              color: '#374151',
                              margin: '0 0 0.25rem 0'
                            }}>
                              {apprentice.name}
                            </h3>
                            <p style={{
                              fontSize: '13px',
                              color: 'rgba(0, 38, 66, 0.6)',
                              margin: 0
                            }}>
                              {apprentice.email}
                            </p>
                          </div>
                        </div>
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <GraduationCap size={12} />
                          Graduated
                        </span>
                      </div>

                      {/* Graduated date */}
                      {apprentice.graduatedAt && (
                        <p style={{
                          fontSize: '12px',
                          color: '#9CA3AF',
                          margin: '0 0 1rem 0'
                        }}>
                          Graduated {new Date(apprentice.graduatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      )}

                      {/* Completed modules info */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.75rem',
                        background: 'white',
                        borderRadius: '8px',
                        marginBottom: '1.25rem',
                        width: 'fit-content'
                      }}>
                        <CheckCircle size={14} color="#059669" />
                        <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                          {summary.completed} of 5 modules completed
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem'
                      }}>
                        <button
                          onClick={() => window.open(`/dashboard/${apprentice.dashboardToken}`, '_blank')}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'rgba(0, 38, 66, 0.6)',
                            background: 'white',
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
                            e.currentTarget.style.background = '#F3F4F6';
                            e.currentTarget.style.color = '#374151';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#6B7280';
                          }}
                        >
                          <ExternalLink size={14} />
                          Dashboard
                        </button>
                        <button
                          onClick={() => window.open(`/skills/${apprentice.dashboardToken}`, '_blank')}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'rgba(0, 38, 66, 0.6)',
                            background: 'white',
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
                            apprenticeCache.prefetch(apprentice.dashboardToken);
                            e.currentTarget.style.background = '#F3F4F6';
                            e.currentTarget.style.color = '#374151';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#6B7280';
                          }}
                        >
                          <ClipboardList size={14} />
                          Skills
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGraduated(apprentice, false);
                          }}
                          style={{
                            padding: '0.75rem',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'rgba(0, 38, 66, 0.6)',
                            background: 'white',
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
                            e.currentTarget.style.background = '#FEF3C7';
                            e.currentTarget.style.color = '#D97706';
                            e.currentTarget.style.borderColor = '#FCD34D';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#6B7280';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                          }}
                          title="Restore to active"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

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
              fontFamily: "'Lora', Georgia, serif",
              fontSize: '22px',
              fontWeight: 700,
              color: isDarkMode ? '#F9FAFB' : '#002642',
              margin: 0
            }}>
              Apps & Resources
            </h2>
          </div>

          <div style={{
            background: isDarkMode ? '#1E293B' : 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)'
          }}>
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
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'rgba(0, 38, 66, 0.6)',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Oclef Professor Academy
      </footer>

      {/* Add Apprentice Modal */}
      {showAddModal && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}>
          <div
            className="modal-content"
            style={{
              background: isDarkMode ? '#1E293B' : 'white',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              animation: 'modalSlideIn 0.3s ease-out'
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
                  fontFamily: "'Lora', Georgia, serif",
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
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: '18px',
                    fontWeight: 600,
                    color: isDarkMode ? '#F9FAFB' : '#002642',
                    textAlign: 'center',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Apprentice Added!
                  </h4>

                  <p style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)',
                    textAlign: 'center',
                    margin: '0 0 1.5rem 0'
                  }}>
                    {addSuccess.email} can now register and access their dashboard.
                  </p>

                  <div style={{
                    background: isDarkMode ? '#374151' : '#F9FAFB',
                    border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isDarkMode ? '#E5E7EB' : '#002642',
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
                          border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                          borderRadius: '8px',
                          background: isDarkMode ? '#1F2937' : 'white',
                          color: isDarkMode ? '#D1D5DB' : '#4B5563'
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
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #1E3A5F 0%, #1E293B 100%)'
                      : 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                    border: '2px solid #0066A2',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: isDarkMode ? '#E5E7EB' : '#002642',
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
                    color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)',
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
                      color: isDarkMode ? '#E5E7EB' : '#002642',
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
                        border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                        borderRadius: '10px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease',
                        background: isDarkMode ? '#374151' : 'white',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0066A2'}
                      onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#4B5563' : '#E5E7EB'}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDarkMode ? '#E5E7EB' : '#002642',
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
                        border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
                        borderRadius: '10px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease',
                        background: isDarkMode ? '#374151' : 'white',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0066A2'}
                      onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#4B5563' : '#E5E7EB'}
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
                        color: isDarkMode ? '#E5E7EB' : '#002642',
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
                          : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                        border: isDarkMode ? '2px solid #4B5563' : '2px solid #E5E7EB',
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

      {/* Follow Apprentice Search Modal */}
      {showFollowModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) resetFollowModal();
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            animation: 'modalSlideIn 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Search size={24} color="white" />
                <h2 style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'white',
                  margin: 0
                }}>
                  Follow an Apprentice
                </h2>
              </div>
              <button
                onClick={resetFollowModal}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                }}
              >
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 300, lineHeight: 1 }}>×</span>
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #E5E7EB' }}>
              <p style={{
                fontSize: '14px',
                color: 'rgba(0, 38, 66, 0.6)',
                margin: '0 0 1rem 0'
              }}>
                Search for apprentices from other professors to follow and track their progress.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#F9FAFB',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                transition: 'all 0.2s ease'
              }}>
                <Search size={20} color="#9CA3AF" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchApprentices(e.target.value);
                  }}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '15px',
                    color: '#002642',
                    outline: 'none'
                  }}
                />
                {searching && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #E5E7EB',
                    borderTopColor: '#004A69',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                )}
              </div>
            </div>

            {/* Search Results */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem 2rem 2rem'
            }}>
              {searchQuery && searchResults.length === 0 && !searching && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'rgba(0, 38, 66, 0.5)'
                }}>
                  <Users size={48} color="rgba(0, 38, 66, 0.2)" style={{ marginBottom: '1rem' }} />
                  <p style={{ margin: 0, fontSize: '15px' }}>
                    No apprentices found matching "{searchQuery}"
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '13px' }}>
                    Try a different search term
                  </p>
                </div>
              )}

              {!searchQuery && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'rgba(0, 38, 66, 0.5)'
                }}>
                  <Search size={48} color="rgba(0, 38, 66, 0.2)" style={{ marginBottom: '1rem' }} />
                  <p style={{ margin: 0, fontSize: '15px' }}>
                    Start typing to search for apprentices
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchResults.map((apprentice) => (
                    <div
                      key={apprentice.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: '#F9FAFB',
                        borderRadius: '14px',
                        border: '2px solid #E5E7EB',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <span style={{
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 700
                          }}>
                            {apprentice.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 style={{
                            fontFamily: "'Lora', Georgia, serif",
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#002642',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {apprentice.name}
                          </h4>
                          <p style={{
                            fontSize: '12px',
                            color: 'rgba(0, 38, 66, 0.5)',
                            margin: 0
                          }}>
                            Professor: {apprentice.professorEmail || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => followApprentice(apprentice)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.5rem 1rem',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'white',
                          background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Plus size={16} />
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Graduation Success Modal */}
      {graduationSuccess && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setGraduationSuccess(null);
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
            animation: 'modalSlideIn 0.4s ease-out',
            position: 'relative'
          }}>
            {/* Confetti Background Animation */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'][i % 6],
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    left: `${Math.random() * 100}%`,
                    animation: `confettiFall 3s ease-in-out ${Math.random() * 2}s infinite`,
                    opacity: 0.8
                  }}
                />
              ))}
            </div>

            {/* Modal Header */}
            <div style={{
              position: 'relative',
              padding: '2.5rem 2rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 40px rgba(255, 215, 0, 0.4)',
                animation: 'pulse-ring-caught-up 2s ease-out infinite'
              }}>
                <GraduationCap size={48} color="#1a1a2e" />
              </div>
              <h2 style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: '28px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                margin: '0 0 0.5rem 0'
              }}>
                Congratulations!
              </h2>
              <p style={{
                fontSize: '18px',
                color: 'white',
                margin: '0 0 0.25rem 0',
                fontWeight: 600
              }}>
                {graduationSuccess.name}
              </p>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
                margin: 0
              }}>
                has graduated from the Professor Academy!
              </p>
            </div>

            {/* Celebration Link Section */}
            <div style={{
              padding: '0 2rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  margin: '0 0 1rem 0'
                }}>
                  Share this celebration page with {graduationSuccess.name}:
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'stretch'
                }}>
                  <input
                    type="text"
                    value={`${window.location.origin}/celebrate/${graduationSuccess.token}`}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '0.875rem 1rem',
                      fontSize: '13px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.2)',
                      color: 'white',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/celebrate/${graduationSuccess.token}`);
                      setGraduationLinkCopied(true);
                      setTimeout(() => setGraduationLinkCopied(false), 2000);
                    }}
                    style={{
                      padding: '0.875rem 1.25rem',
                      background: graduationLinkCopied
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {graduationLinkCopied ? <Check size={18} /> : <Copy size={18} />}
                    {graduationLinkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem'
              }}>
                <button
                  onClick={() => {
                    window.open(`/celebrate/${graduationSuccess.token}`, '_blank');
                  }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#1a1a2e',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)'
                  }}
                >
                  <ExternalLink size={18} />
                  View Celebration
                </button>
                <button
                  onClick={() => setGraduationSuccess(null)}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
        }
        @keyframes float-empty {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes pulse-empty {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0.4; }
        }
        @keyframes bounce-empty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sparkle-empty {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }
        @keyframes float-caught-up {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes pulse-ring-caught-up {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes bounce-caught-up {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes sparkle-caught-up {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.3) rotate(15deg); opacity: 0.7; }
        }
        @keyframes pulse-dot-caught-up {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
        @media (max-width: 480px) {
          .profile-name-text {
            display: none !important;
          }
        }
      `}</style>
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
  const { isDarkMode } = useDarkMode();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        background: isDarkMode
          ? 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        border: `2px solid ${isHovered ? color : isDarkMode ? '#4B5563' : '#E5E7EB'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 24px ${color}18` : isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)'
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
            color: isDarkMode ? '#F9FAFB' : '#002642',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h3>
          <p style={{ fontSize: '12px', color: isDarkMode ? '#9CA3AF' : 'rgba(0, 38, 66, 0.6)', margin: '0.15rem 0 0 0' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <p style={{
        fontSize: '13px',
        color: isDarkMode ? '#D1D5DB' : '#4B5563',
        margin: 0,
        lineHeight: '1.6'
      }}>
        {description}
      </p>
    </a>
  );
};

export default ProfessorDashboard;
