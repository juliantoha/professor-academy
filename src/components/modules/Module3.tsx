import { useState } from 'react';
import { Upload, CheckCircle, Circle, FileText, Play, AlertCircle, Loader } from 'lucide-react';
import { submitModule } from '../../services/submissionService';

interface StepObject {
  step: string;
  detail: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  detailedSteps: StepObject[];
  tips: string[];
  practice: string;
}

const VideoPlaceholder = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #F0F9FF 0%, #DBEAFE 100%)',
      borderRadius: '16px',
      padding: '3rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '240px',
      border: '2px dashed rgba(0,102,162,0.4)'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        boxShadow: '0 8px 24px rgba(0,102,162,0.3)'
      }}>
        <Play size={36} color="white" fill="white" />
      </div>
      <span style={{
        color: '#004A69',
        fontWeight: 600,
        fontSize: '17px'
      }}>
        Video Tutorial Coming Soon
      </span>
      <span style={{
        color: '#4B5563',
        fontSize: '16px',
        marginTop: '0.5rem'
      }}>
        Follow the written instructions above
      </span>
    </div>
  );
};

const Module3SystemNavigation = () => {
  // Get ALL parameters from URL including dashboard token
  const urlParams = new URLSearchParams(window.location.search);
  const nameFromUrl = urlParams.get('name') || '';
  const emailFromUrl = urlParams.get('email') || '';
  const professorFromUrl = urlParams.get('professor') || '';
  const tokenFromUrl = urlParams.get('token') || '';
  
  // Student Information State - Auto-populated from URL
  const [studentName] = useState(nameFromUrl);
  const [apprenticeEmail] = useState(emailFromUrl);
  const [professorEmail] = useState(professorFromUrl);
  const [dashboardToken] = useState(tokenFromUrl);
  
  // Module State
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [uploadedScreenshots, setUploadedScreenshots] = useState<Record<string, string>>({});
  const [activeUploadBox, setActiveUploadBox] = useState<string | null>(null);
  
  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tasks: Task[] = [
    {
      id: "oclef-pro-dashboard",
      title: "Navigating Oclef Pro Dashboard",
      description: "Oclef Pro is your command center for teaching. This comprehensive platform consolidates everything you need: student profiles, lesson plans, assignment tracking, practice logs, and communication tools. Mastering efficient navigation is essential for professional, organized instruction.",
      detailedSteps: [
        {
          step: "Access Oclef Pro",
          detail: "Navigate to studio.oclef.com and sign in with your instructor credentials provided by your Professor. Bookmark this URL—you'll visit it before every lesson."
        },
        {
          step: "Understand the Dashboard Layout",
          detail: "Top Navigation: Quick access to Students, Schedule, Reports, and Resources. Left Sidebar: Your active student list and upcoming lessons sorted chronologically. Main Panel: Detailed lesson view, current assignments, and practice logs."
        },
        {
          step: "Explore the Student List",
          detail: "The left sidebar shows all your assigned students. Students with upcoming lessons appear at the top. Click any student name to open their complete profile and lesson history."
        },
        {
          step: "Review Today's Schedule",
          detail: "Your dashboard highlights today's lessons in chronological order. Each entry shows: student name, lesson time, current piece, and any professor notes. Scan this before your teaching block starts."
        },
        {
          step: "Practice Quick Navigation",
          detail: "Time yourself: From login to viewing a specific student's profile should take ≤20 seconds. From dashboard to today's lesson plan should take ≤15 seconds. Speed = professionalism."
        }
      ],
      tips: [
        "Log in 10 minutes before your first lesson to review the day",
        "Keep Oclef Pro open in a dedicated browser window (not buried in tabs)",
        "Use keyboard shortcuts (press '?' to view shortcut menu)",
        "Refresh your dashboard between lessons to sync latest updates"
      ],
      practice: "Take a screenshot of your Oclef Pro dashboard showing: (1) Student list in the sidebar, (2) Today's schedule visible, (3) Your name/account info confirming you're logged in, (4) At least one student profile preview."
    },
    {
      id: "student-profiles",
      title: "Accessing Student Profiles & History",
      description: "Student profiles contain critical teaching information: skill level, learning style, parent contacts, lesson history, practice habits, and progress notes. You'll reference profiles constantly before and during lessons. Efficient access to this data keeps your teaching informed and personalized.",
      detailedSteps: [
        {
          step: "Navigate to Student Profiles",
          detail: "From your dashboard, click on any student name in your sidebar or schedule. Their profile loads in the main panel with tabs for different information sections."
        },
        {
          step: "Review the Profile Overview",
          detail: "The first tab shows: (1) Student name, age, instrument, (2) Current skill level and grade, (3) Learning goals and preferences, (4) Parent/guardian contact information, (5) Start date and tenure with Oclef."
        },
        {
          step: "Check Lesson History",
          detail: "Click the 'History' or 'Past Lessons' tab. Review: (1) Previous lesson notes from you and other instructors, (2) Attendance record, (3) Completed pieces and assessments, (4) Milestones achieved."
        },
        {
          step: "View Practice Logs",
          detail: "The 'Practice' tab shows: (1) Daily practice minutes logged by the student, (2) Practice streaks and consistency patterns, (3) Specific pieces practiced and repetition counts, (4) Practice quality ratings."
        },
        {
          step: "Note Special Accommodations",
          detail: "Check for flags or notes about: learning differences, health considerations, preferred communication styles, or family circumstances that inform your teaching approach."
        }
      ],
      tips: [
        "Review student profiles the night before teaching them",
        "Look for patterns in lesson notes—recurring challenges, breakthrough moments",
        "Check practice logs to see if homework was completed",
        "Update parent contact info if it seems outdated"
      ],
      practice: "Navigate to a student profile in your system. Take a screenshot showing: (1) Complete profile overview with student info, (2) Visible lesson history section, (3) Practice logs or activity data, (4) Any special notes or accommodations clearly displayed."
    },
    {
      id: "lesson-plans-pieces",
      title: "Lesson Plans & Assigned Repertoire",
      description: "Lesson plans outline what you'll teach in each session: warm-ups, technical focus, repertoire, theory concepts, and homework assignments. Quick access to today's plan and assigned pieces ensures smooth, organized, purposeful teaching. This is your roadmap for every 15-minute lesson.",
      detailedSteps: [
        {
          step: "Access Today's Lesson Plan",
          detail: "From the dashboard or student profile, click 'Today's Lesson,' 'Lesson Plan,' or the calendar icon. The plan for your current session loads immediately."
        },
        {
          step: "Review Lesson Structure",
          detail: "Scan the plan sections: (1) Warm-up activities (2-3 minutes), (2) Technical exercises (3-4 minutes), (3) Repertoire/pieces (6-8 minutes), (4) Theory or musicianship (2 minutes), (5) Homework assignment and wrap-up (1 minute)."
        },
        {
          step: "Open Assigned Pieces",
          detail: "Click on any piece title in the lesson plan to open: (1) PDF sheet music, (2) Reference recordings for student listening, (3) Practice instructions and focus areas, (4) Difficulty rating and learning objectives."
        },
        {
          step: "Check Professor Notes",
          detail: "Look for annotations from your supervising professor: focus areas, pacing adjustments, specific technical issues to address, or suggestions for differentiation."
        },
        {
          step: "Prepare Resources",
          detail: "Before the lesson starts, open all necessary resources in separate tabs: sheet music PDFs, reference recordings, practice exercise links, and any visual aids or rhythm charts."
        },
        {
          step: "Navigate Between Students Quickly",
          detail: "Practice switching from one student's lesson plan to another's. Use the student dropdown, sidebar navigation, or keyboard shortcuts. Goal: ≤10 seconds to switch contexts."
        }
      ],
      tips: [
        "Open lesson plans 5 minutes before each student arrives",
        "Keep the plan visible (second monitor or split screen) during teaching",
        "Mark completed activities in real-time as you progress",
        "Note pacing—if you run behind, adjust future plans accordingly"
      ],
      practice: "Navigate to a complete lesson plan for any student. Take a screenshot showing: (1) Full lesson plan with all sections visible (warm-up, technical, repertoire, theory, homework), (2) At least one piece title linked and clickable, (3) Any professor notes or instructions, (4) Time allocations or pacing guides if present."
    }
  ];

  const toggleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleFileUpload = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedScreenshots(prev => ({
          ...prev,
          [taskId]: dataUrl
        }));
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (taskId: string, event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          if (blob.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setUploadedScreenshots(prev => ({
              ...prev,
              [taskId]: dataUrl
            }));
            setError(null);
          };
          reader.readAsDataURL(blob);
          event.preventDefault();
        }
      }
    }
  };

  const handleDeleteScreenshot = (taskId: string) => {
    setUploadedScreenshots(prev => {
      const newScreenshots = { ...prev };
      delete newScreenshots[taskId];
      return newScreenshots;
    });
  };

  const calculateProgress = (): number => {
    let completedCount = 0;
    tasks.forEach(task => {
      if (completedTasks[task.id] && uploadedScreenshots[task.id]) {
        completedCount++;
      }
    });
    return tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  };

  const handleSubmit = async () => {
    // Validation
    if (!studentName.trim() || !apprenticeEmail.trim() || !professorEmail.trim()) {
      setError('Please fill in all required fields in the student information section');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(apprenticeEmail) || !emailRegex.test(professorEmail)) {
      setError('Please enter valid email addresses');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (calculateProgress() < 100) {
      setError('Please complete all tasks and upload screenshots before submitting');
      return;
    }

    if (!dashboardToken) {
      setError('Dashboard token missing. Please access this module from your dashboard.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        studentName: studentName.trim(),
        apprenticeEmail: apprenticeEmail.trim().toLowerCase(),
        professorEmail: professorEmail.trim().toLowerCase(),
        operatingSystem: 'windows' as const,
        moduleName: 'System Navigation',
        moduleNumber: '2.3',
        phase: 'Phase 2',
        completedTasks,
        uploadedScreenshots
      };

      await submitModule(submissionData);
      setSubmitSuccess(true);

      // Redirect back to dashboard with token after 3 seconds
      setTimeout(() => {
        window.location.href = `/dashboard/${dashboardToken}`;
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      console.error('Submission error:', err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '600px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00952E 0%, #10B981 100%)',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,149,46,0.3)'
          }}>
            <CheckCircle size={48} color="white" />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 1rem 0'
          }}>
            Module Complete! 🎉
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            lineHeight: '1.6',
            marginBottom: '0.5rem'
          }}>
            Great job, {studentName}!
          </p>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            Your professor has been notified and will review your submission soon.
            You'll receive feedback on your dashboard once the review is complete.
          </p>
          <div style={{
            fontSize: '14px',
            color: '#9CA3AF'
          }}>
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back to Dashboard Button */}
        <button
          onClick={() => {
            if (dashboardToken) {
              window.location.href = `/dashboard/${dashboardToken}`;
            } else {
              window.history.back();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '14px',
            fontWeight: 600,
            color: '#0066A2',
            background: 'white',
            border: '2px solid #0066A2',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,102,162,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0066A2';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#0066A2';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span>
          Back to Dashboard
        </button>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '2px solid #DC2626',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} color="#DC2626" />
            <span style={{ color: '#991B1B', fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0,102,162,0.3)',
              flexShrink: 0
            }}>
              <FileText size={32} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0'
              }}>
                2.3 - System Navigation
              </h1>
              <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
                Navigate Oclef systems efficiently and professionally
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Progress Bar */}
        <div style={{
          position: 'sticky',
          top: '1rem',
          zIndex: 100,
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '2px solid rgba(0,102,162,0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#004A69',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FileText size={18} color="#0066A2" />
                Module Progress
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {calculateProgress()}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: '#E5E7EB',
              borderRadius: '50px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${calculateProgress()}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0066A2 0%, #004A69 100%)',
                borderRadius: '50px',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: calculateProgress() > 0 ? '0 0 12px rgba(0,102,162,0.4)' : 'none'
              }} />
            </div>
            {calculateProgress() > 0 && calculateProgress() < 100 && (
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                {tasks.filter(t => completedTasks[t.id] && uploadedScreenshots[t.id]).length} of {tasks.length} tasks completed
              </div>
            )}
            {calculateProgress() === 100 && (
              <div style={{
                fontSize: '12px',
                color: '#00952E',
                marginTop: '0.5rem',
                textAlign: 'center',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={14} color="#00952E" />
                Ready to submit!
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        {tasks.map((task) => (
          <div key={task.id} style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#004A69',
              margin: '0 0 1rem 0'
            }}>
              {task.title}
            </h3>

            <p style={{
              color: '#374151',
              fontSize: '15px',
              lineHeight: '1.7',
              margin: '0 0 2rem 0',
              paddingLeft: '1rem',
              borderLeft: '3px solid #0066A2'
            }}>
              {task.description}
            </p>

            {/* Steps */}
            <div style={{
              background: '#F9FAFB',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid #E5E7EB'
            }}>
              <h5 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#004A69',
                margin: '0 0 1.5rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Step-by-Step Instructions
              </h5>
              {task.detailedSteps.map((stepObj, i) => (
                <div key={i} style={{
                  marginBottom: i < task.detailedSteps.length - 1 ? '1.5rem' : '0',
                  paddingLeft: '2.5rem',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.25rem',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0,102,162,0.2) 0%, rgba(0,74,105,0.4) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0066A2'
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '0.5rem',
                    fontSize: '14px'
                  }}>
                    {stepObj.step}
                  </div>
                  <div style={{
                    color: '#4B5563',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {stepObj.detail}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div style={{
              background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(0,102,162,0.3)'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#0369A1',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Pro Tips
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#0C4A6E'
              }}>
                {task.tips.map((tip, i) => (
                  <li key={i} style={{ 
                    marginBottom: i < task.tips.length - 1 ? '0.5rem' : '0',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <VideoPlaceholder />

            {/* Practice Task */}
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '2px solid rgba(0,149,46,0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontWeight: 600,
                color: '#065F46',
                margin: '0 0 0.75rem 0',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Practice Task
              </div>
              <p style={{
                color: '#047857',
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {task.practice}
              </p>
            </div>

            {/* Completion Checkbox */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                cursor: 'pointer',
                padding: '1rem',
                borderRadius: '10px',
                background: completedTasks[task.id] ? 'rgba(0,149,46,0.05)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
              onClick={() => toggleTaskComplete(task.id)}
            >
              {completedTasks[task.id] ? (
                <CheckCircle size={24} color="#00952E" />
              ) : (
                <Circle size={24} color="#9CA3AF" />
              )}
              <span style={{
                color: completedTasks[task.id] ? '#00952E' : '#6B7280',
                fontWeight: completedTasks[task.id] ? 600 : 400,
                fontSize: '14px'
              }}>
                I understand and have practiced this task
              </span>
            </div>

            {/* Screenshot Upload */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: 600,
                color: '#004A69',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Upload Screenshot
              </label>
              
              {uploadedScreenshots[task.id] ? (
                <div style={{
                  border: '3px solid #00952E',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #00952E 0%, #10B981 100%)',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle size={24} color="white" />
                      <div>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'white',
                          letterSpacing: '0.5px'
                        }}>
                          SCREENSHOT ACCEPTED
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.9)',
                          marginTop: '2px'
                        }}>
                          Ready for submission
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteScreenshot(task.id)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Replace
                    </button>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'white' }}>
                    <img 
                      src={uploadedScreenshots[task.id]} 
                      alt="Uploaded screenshot"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div 
                  style={{
                    border: activeUploadBox === task.id ? '3px solid #0066A2' : '2px dashed #D1D5DB',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    background: activeUploadBox === task.id 
                      ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' 
                      : 'linear-gradient(135deg, #FAFBFC 0%, #F3F4F6 100%)',
                    cursor: 'text',
                    transition: 'all 0.3s ease',
                    boxShadow: activeUploadBox === task.id ? '0 0 0 4px rgba(0,102,162,0.1)' : 'none'
                  }}
                  onClick={(e) => {
                    e.currentTarget.focus();
                    setActiveUploadBox(task.id);
                  }}
                  onFocus={() => setActiveUploadBox(task.id)}
                  onBlur={() => setActiveUploadBox(null)}
                  onPaste={(e) => handlePaste(task.id, e)}
                  tabIndex={0}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileUpload(task.id, e)}
                    style={{ display: 'none' }}
                    id={`upload-${task.id}`}
                  />
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: activeUploadBox === task.id
                      ? 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)'
                      : 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    transition: 'all 0.3s ease',
                    transform: activeUploadBox === task.id ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    <Upload size={32} color={activeUploadBox === task.id ? 'white' : '#6B7280'} />
                  </div>
                  
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: activeUploadBox === task.id ? '#0066A2' : '#374151',
                    marginBottom: '1rem',
                    transition: 'color 0.3s ease'
                  }}>
                    {activeUploadBox === task.id ? '✓ Ready to Paste Screenshot!' : 'Paste Screenshot Here'}
                  </div>
                  
                  <div style={{
                    background: activeUploadBox === task.id ? '#DBEAFE' : '#EFF6FF',
                    border: activeUploadBox === task.id ? '2px solid #0066A2' : '1px solid #BFDBFE',
                    borderRadius: '10px',
                    padding: '1rem 1.5rem',
                    maxWidth: '400px',
                    margin: '0 auto 1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: activeUploadBox === task.id ? '#004A69' : '#1E40AF',
                      marginBottom: '0.5rem',
                      transition: 'color 0.3s ease'
                    }}>
                      {activeUploadBox === task.id ? '🎯 Paste Now (Cmd/Ctrl+V):' : 'Quick Paste Instructions:'}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#1E3A8A',
                      lineHeight: '1.6',
                      textAlign: 'left'
                    }}>
                      <div>1. Take your screenshot</div>
                      <div>2. Click in this box</div>
                      <div>3. Press Ctrl/Cmd+V to paste</div>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    or{' '}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(`upload-${task.id}`)?.click();
                      }}
                      style={{
                        color: '#0066A2',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      browse files
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <button
            disabled={calculateProgress() < 100 || submitting}
            onClick={handleSubmit}
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              background: calculateProgress() === 100 && !submitting
                ? 'linear-gradient(135deg, #00952E 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 3rem',
              cursor: calculateProgress() === 100 && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: calculateProgress() === 100 && !submitting ? '0 8px 24px rgba(0,149,46,0.4)' : 'none',
              transition: 'all 0.3s ease',
              opacity: calculateProgress() === 100 && !submitting ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              margin: '0 auto'
            }}
          >
            {submitting && <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />}
            {submitting 
              ? 'Submitting Module...' 
              : calculateProgress() === 100 
                ? 'Submit Module & Notify Professor' 
                : `Complete All Tasks (${calculateProgress()}%)`}
          </button>
          <p style={{
            marginTop: '1rem',
            color: '#4B5563',
            fontSize: '14px'
          }}>
            {calculateProgress() === 100 
              ? 'Ready to submit! Your professor will be notified via email.'
              : 'Complete all tasks and upload screenshots to proceed'}
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
};

export default Module3SystemNavigation;