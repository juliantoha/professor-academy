import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Apprentice {
  id: string;
  apprenticeId: string;
  name: string;
  email: string;
  dashboardToken: string;
  createdAt: string;
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
  status: string;
  submittedAt: string;
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

      // Fetch apprentices assigned to this professor
      const { data: apprenticesData, error: apprenticesError } = await supabase
        .from('apprentices')
        .select('*')
        .eq('professorEmail', user?.email)
        .order('createdAt', { ascending: false });

      if (apprenticesError) throw apprenticesError;
      setApprentices(apprenticesData || []);

      // Fetch progress for all apprentices
      if (apprenticesData && apprenticesData.length > 0) {
        const emails = apprenticesData.map(a => a.email);
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .in('apprenticeEmail', emails);

        if (progressError) throw progressError;

        // Group progress by apprentice email
        const progressMap: Record<string, Progress[]> = {};
        (progressData || []).forEach(p => {
          if (!progressMap[p.apprenticeEmail]) {
            progressMap[p.apprenticeEmail] = [];
          }
          progressMap[p.apprenticeEmail].push(p);
        });
        setProgress(progressMap);
      }

      // Fetch pending submissions for this professor
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className="shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Professor Dashboard</h1>
              <p className="text-blue-100 mt-1">Welcome back, {profile?.name || user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Pending Reviews Section */}
        {pendingSubmissions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Pending Reviews ({pendingSubmissions.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingSubmissions.map((submission) => (
                <div
                  key={submission.submissionId}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-orange-500"
                  onClick={() => navigate(`/review/${submission.submissionId}?review=true`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{submission.moduleName}</h3>
                      <p className="text-sm text-gray-500 mt-1">{submission.apprenticeEmail}</p>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Apprentices Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Apprentices ({apprentices.length})
          </h2>

          {apprentices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No apprentices yet</h3>
              <p className="text-gray-500">Apprentices assigned to you will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apprentices.map((apprentice) => {
                const summary = getProgressSummary(apprentice.email);
                return (
                  <div
                    key={apprentice.id}
                    className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{apprentice.name}</h3>
                        <p className="text-sm text-gray-500">{apprentice.email}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {apprentice.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{summary.completed} completed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${summary.total > 0 ? (summary.completed / 5) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      {summary.submitted > 0 && (
                        <span className="text-orange-600">
                          {summary.submitted} awaiting review
                        </span>
                      )}
                      {summary.completed > 0 && (
                        <span className="text-green-600">
                          {summary.completed} approved
                        </span>
                      )}
                    </div>

                    {/* View Dashboard Link */}
                    <button
                      onClick={() => window.open(`/dashboard/${apprentice.dashboardToken}`, '_blank')}
                      className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Apprentice Dashboard
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
