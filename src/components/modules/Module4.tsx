import { useState } from 'react';
import { Upload, CheckCircle, Circle, CheckSquare, Play, AlertCircle, Loader } from 'lucide-react';
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

const Module4Documentation = () => {
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
      id: "lesson-notes",
      title: "Writing Professional Lesson Notes",
      description: "Lesson notes are your professional documentation of each teaching session. Parents read these. Professors review them for quality. Future instructors reference them for continuity. Clear, detailed, consistent notes demonstrate professionalism, track student progress, and ensure every lesson builds on the previous one.",
      detailedSteps: [
        {
          step: "Navigate to Lesson Notes",
          detail: "During or immediately after the lesson, find the 'Lesson Notes,' 'Documentation,' or notepad icon in the student's lesson interface. This should be easily accessible without leaving the main teaching screen."
        },
        {
          step: "Use the structured template",
          detail: "Follow this consistent format every time: (1) What We Covered: List pieces/exercises worked on, (2) Specific Accomplishments: Celebrate concrete wins (e.g., 'mastered measures 1-8'), (3) Challenges: Note struggles without judgment, (4) Homework Assigned: Clear, actionable tasks, (5) Next Lesson Focus: Brief preview."
        },
        {
          step: "Be specific and actionable",
          detail: "Bad: 'Worked on piece.' Good: 'Completed Sonata measures 1-8 with correct fingering. Still developing left-hand coordination in measures 9-12. Practice these at 60 BPM.' Specificity helps everyone—parents, students, professors, and future you."
        },
        {
          step: "Balance honesty with encouragement",
          detail: "Parents read these notes. Frame challenges as learning opportunities: 'Working on smoother transitions between chords' beats 'struggling with chord changes.' Celebrate progress: 'Great improvement on rhythm accuracy this week!'"
        },
        {
          step: "Write immediately after lessons",
          detail: "Do not delay. Memory fades fast. Write notes within 5 minutes of lesson ending while details are vivid. Set a timer if needed. This becomes automatic with practice."
        },
        {
          step: "Save and verify",
          detail: "Click 'Save' or 'Submit Notes.' Confirm the note appears in the lesson history with correct timestamp. Check that it's visible to parents (if applicable) and properly associated with today's date."
        }
      ],
      tips: [
        "Keep a notes template handy—copy/paste structure, fill in specifics",
        "Note 'aha moments' and breakthroughs—these motivate families",
        "Be honest but kind about challenges",
        "Include concrete practice instructions parents can help with",
        "Consistency in format makes notes easy to scan later"
      ],
      practice: "Write a complete lesson note in your development system for a practice student. Include all template sections: pieces covered, specific accomplishments, challenges framed constructively, clear homework, and next lesson focus. Screenshot your completed note showing proper structure, specificity, and professional tone."
    },
    {
      id: "homework-assignments",
      title: "Assigning Practice Tasks & Homework",
      description: "Clear homework assignments are essential for student progress. Between lessons, students practice what you assign. Vague assignments lead to wasted practice time. Specific, measurable tasks ensure focused work. You'll assign homework at the end of every lesson—this skill must be automatic.",
      detailedSteps: [
        {
          step: "Access the Homework Assignment section",
          detail: "From the student's lesson interface, find 'Assign Homework,' 'Practice Tasks,' or a clipboard/checklist icon. This is typically in the same area as lesson notes and quizzes."
        },
        {
          step: "Be specific about what to practice",
          detail: "Bad: 'Practice Sonata.' Good: 'Practice Sonata measures 9-16, focusing on left-hand chord transitions. Slow tempo (60 BPM), 5 repetitions per day. Record yourself on Day 3 and listen back.' Specificity = results."
        },
        {
          step: "Assign realistic quantities",
          detail: "Don't overload. 2-3 focused tasks are better than 10 vague ones. Consider the student's age, skill level, and weekly schedule. A 7-year-old gets different homework than a 14-year-old."
        },
        {
          step: "Include practice instructions",
          detail: "Tell students HOW to practice, not just WHAT. 'Play measures 1-4 slowly, hands separately, 3 times each hand. Then together at 70 BPM, 5 repetitions. Focus on smooth finger transitions.'"
        },
        {
          step: "Set deadlines",
          detail: "Homework due before next lesson. If you meet Tuesday, homework is due Monday night. This creates accountability and gives you time to review practice logs before teaching."
        },
        {
          step: "Confirm visibility",
          detail: "Check that homework appears in the student's dashboard. They should see exactly what to do, when it's due, and how to complete it. Test the student interface yourself."
        }
      ],
      tips: [
        "Assign homework at the END of lessons, not the beginning",
        "Quality over quantity—better to master one task than poorly practice five",
        "Include one 'fun' task if possible (improvisation, ear training game)",
        "Check previous homework completion before assigning more",
        "Be consistent with assignment format—students learn your system"
      ],
      practice: "Assign detailed practice homework to a student in your dev system. Include: (1) Specific piece and measures, (2) Clear practice instructions (tempo, repetitions, focus points), (3) Due date, (4) Any supplementary resources (metronome settings, reference recordings). Screenshot showing complete assignment with all details visible in student's dashboard."
    },
    {
      id: "lesson-closure",
      title: "Professional Lesson Closure Protocol",
      description: "Properly closing a lesson ensures all administrative tasks are complete before your next student. This professional routine prevents missed documentation, ensures accurate records, builds trust with families, and signals that the lesson has officially ended. Rushed closures lead to errors and unprofessionalism.",
      detailedSteps: [
        {
          step: "Final 60-second wrap-up",
          detail: "With 1 minute left in the 15-minute lesson, transition to closure. Summarize: 'Today we worked on X, you did great with Y, keep practicing Z. I'm assigning ABC for homework. See you next time!' This verbal summary primes your note-writing."
        },
        {
          step: "Verify lesson notes are saved",
          detail: "Immediately after the student leaves (or disconnects), re-check that your lesson notes are complete and saved. Don't trust auto-save—manually confirm. Look for the green checkmark, timestamp, or confirmation message."
        },
        {
          step: "Confirm homework is assigned",
          detail: "Check the student's dashboard view. Homework should be visible with: task descriptions, due date, and any attached resources. If it's not there, the student won't do it."
        },
        {
          step: "Mark attendance accurately",
          detail: "Mark: Present (full lesson), Tardy (late arrival), Partial (left early), Absent (no-show), or Excused (sick/emergency). Accurate attendance is critical for billing, scheduling, and tracking engagement."
        },
        {
          step: "Complete any required forms",
          detail: "Check for: progress report requests, parent communication flags, incident reports (behavioral issues, technical problems), or professor check-ins. Don't skip these—they matter."
        },
        {
          step: "Close the lesson session",
          detail: "Click 'Complete Lesson,' 'End Session,' or the equivalent button. This timestamps the lesson end, locks your documentation, and moves the student to 'completed' status. You cannot edit after this."
        },
        {
          step: "Prepare for next student",
          detail: "Take 2-3 minutes to open next student's profile and lesson plan. Scan their last lesson notes. Review homework completion. Check for professor comments. This prep time is non-negotiable."
        }
      ],
      tips: [
        "Build a closure checklist—same steps, every lesson, every time",
        "Set a 2-minute timer after each lesson for closure tasks",
        "Don't let students linger if your next lesson is starting",
        "Professional closure builds trust with parents and supervisors",
        "If you're behind schedule, do NOT skip closure steps—quality matters"
      ],
      practice: "Complete a full lesson closure workflow in your development system. Execute all closure steps: write/save notes, assign and confirm homework, mark attendance, check for additional forms, and formally close the session. Screenshot the final closure confirmation page showing: (1) Saved lesson notes, (2) Visible homework assignment, (3) Attendance marked, (4) Session status 'Closed' or 'Complete' with timestamp."
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
        moduleName: 'Documentation & Lesson Closure',
        moduleNumber: '2.4',
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
            All Training Complete! 🎉
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            lineHeight: '1.6',
            marginBottom: '0.5rem'
          }}>
            Congratulations, {studentName}!
          </p>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            You've completed all Phase 2 modules! Your professor has been notified and will review your submissions.
            Check your dashboard for feedback and next steps.
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
            color: '#F6AE00',
            background: 'white',
            border: '2px solid #F6AE00',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(246,174,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F6AE00';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#F6AE00';
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
              background: 'linear-gradient(135deg, #F6AE00 0%, #F59E0B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(246,174,0,0.3)',
              flexShrink: 0
            }}>
              <CheckSquare size={32} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0'
              }}>
                2.4 - Documentation & Lesson Closure
              </h1>
              <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
                Professional record-keeping and communication
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
            border: '2px solid rgba(246,174,0,0.15)'
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
                color: '#92400E',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckSquare size={18} color="#F6AE00" />
                Module Progress
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #F6AE00 0%, #F59E0B 100%)',
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
                background: 'linear-gradient(90deg, #F6AE00 0%, #F59E0B 100%)',
                borderRadius: '50px',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: calculateProgress() > 0 ? '0 0 12px rgba(246,174,0,0.4)' : 'none'
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
                Final module complete - ready to submit!
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
              borderLeft: '3px solid #F6AE00'
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
                    background: 'linear-gradient(135deg, rgba(246,174,0,0.2) 0%, rgba(245,158,11,0.4) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#F6AE00'
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
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(246,174,0,0.3)'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#92400E',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Pro Tips
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#78350F'
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
                        color: '#F6AE00',
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
              ? 'Submitting Final Module...' 
              : calculateProgress() === 100 
                ? 'Submit Final Module & Notify Professor' 
                : `Complete All Tasks (${calculateProgress()}%)`}
          </button>
          <p style={{
            marginTop: '1rem',
            color: '#4B5563',
            fontSize: '14px'
          }}>
            {calculateProgress() === 100 
              ? 'Ready to submit your final module! Your professor will be notified via email.'
              : 'Complete all tasks and upload screenshots to proceed'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Module4Documentation;