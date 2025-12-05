import { useState } from 'react';
import { Upload, CheckCircle, Circle, Video, Play, FileImage, AlertCircle, Loader } from 'lucide-react';
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
  imagePlaceholder?: boolean;
  imageDescription?: string;
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

const ImagePlaceholder = ({ description }: { description?: string }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF6ED 0%, #FFE0BA 100%)',
      borderRadius: '16px',
      padding: '3rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '240px',
      border: '2px dashed rgba(235,106,24,0.4)'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        boxShadow: '0 8px 24px rgba(235,106,24,0.3)'
      }}>
        <FileImage size={40} color="white" />
      </div>
      <span style={{
        color: '#d05510',
        fontWeight: 600,
        fontSize: '17px',
        textAlign: 'center'
      }}>
        {description || "Reference Image Coming Soon"}
      </span>
    </div>
  );
};

const Module2ZoomConfiguration = () => {
  // Get ALL parameters from URL including dashboard token
  const urlParams = new URLSearchParams(window.location.search);
  const nameFromUrl = urlParams.get('name') || '';
  const emailFromUrl = urlParams.get('email') || '';
  const professorFromUrl = urlParams.get('professor') || '';
  const tokenFromUrl = urlParams.get('token') || '';
  
  // Student Information State - Auto-populated from URL
  const [studentName, setStudentName] = useState(nameFromUrl);
  const [apprenticeEmail, setApprenticeEmail] = useState(emailFromUrl);
  const [professorEmail, setProfessorEmail] = useState(professorFromUrl);
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
      id: "zoom-install",
      title: "Zoom Installation & Room Assignment",
      description: "Proper Zoom setup is critical for teaching. You'll be assigned a specific 'room' (virtual meeting space) that matches your teaching schedule. This room is yours – students will join you here for all lessons.",
      detailedSteps: [
        {
          step: "Download Zoom Desktop Application",
          detail: "Visit zoom.us/download and install the desktop client (not the web version). The desktop app provides superior audio quality essential for music instruction."
        },
        {
          step: "Sign in with your Oclef credentials",
          detail: "Use the account credentials provided by your Professor. You'll receive a unique sign-in link that connects you to your assigned room."
        },
        {
          step: "Verify your Room assignment",
          detail: "Check that your Room name (visible in the Zoom window title) matches your teaching schedule. Example: 'Professor Smith - Room A' should align with your scheduled room."
        },
        {
          step: "Bookmark your Personal Room URL",
          detail: "Save this link – you'll use it to start every lesson. It never changes."
        }
      ],
      tips: [
        "Always use the desktop app, never the browser version for lessons",
        "Test joining your room before your first lesson",
        "Your room link stays the same – students use it repeatedly"
      ],
      practice: "Take a screenshot of your Zoom home screen clearly showing: (1) Your assigned room name, (2) Your personal meeting ID, (3) Confirmation you're using the desktop application."
    },
    {
      id: "zoom-audio",
      title: "Audio Settings for Music Instruction",
      description: "Standard Zoom audio is designed for speech and compresses music severely. These specific settings disable audio processing to preserve the full frequency range and dynamics essential for music instruction. This configuration is non-negotiable.",
      detailedSteps: [
        {
          step: "Open Zoom Settings",
          detail: "Click the gear icon (⚙️) in the top-right corner of Zoom, then select the 'Audio' tab from the left sidebar."
        },
        {
          step: "Click 'Advanced' button at the bottom",
          detail: "This reveals critical settings hidden from standard users. You must access this section."
        },
        {
          step: "Enable 'Show in-meeting option to enable Original Sound'",
          detail: "Check this box. This adds a button to your meeting controls that says 'Turn On Original Sound.' You'll click this at the start of every lesson."
        },
        {
          step: "Configure Echo Cancellation",
          detail: "Set to 'Auto' initially. This algorithm tries to remove audio feedback. Only upgrade to 'Aggressive' if you experience echo issues with specific students."
        },
        {
          step: "Set Suppress Background Noise to 'Low'",
          detail: "Higher settings remove musical nuance. 'Low' preserves the full frequency spectrum while minimizing non-musical sounds."
        },
        {
          step: "Select your Microphone Input",
          detail: "If you have an external audio interface or USB microphone, select it here. Built-in mics work but external devices provide superior quality."
        },
        {
          step: "Select Output (Headphones)",
          detail: "Always choose your headphones, never speakers. Speakers create audio feedback loops. Headphones are mandatory for all lessons."
        }
      ],
      tips: [
        "These settings preserve music quality – don't skip this configuration",
        "Test your audio with a colleague before teaching",
        "Click 'Turn On Original Sound' at the start of EVERY lesson",
        "If you hear echo, escalate Echo Cancellation to Aggressive"
      ],
      practice: "Take a detailed screenshot of your Audio Settings page showing: Advanced settings panel open, Original Sound enabled, Echo Cancellation set to Auto, Background Noise Suppression on Low, and your selected microphone/headphones."
    },
    {
      id: "zoom-video",
      title: "Video Quality Settings",
      description: "Professional video presentation is essential for building rapport with students. These settings ensure you appear clear, professional, and properly lit during all lessons.",
      detailedSteps: [
        {
          step: "Open Zoom Settings → Video",
          detail: "Access the Video tab from Zoom settings. This controls all camera and video quality options."
        },
        {
          step: "Enable HD Video",
          detail: "Check 'Enable HD' to transmit at 720p quality. Students see you more clearly, which improves communication and connection."
        },
        {
          step: "Adjust lighting in your space",
          detail: "Face a window or lamp. Never sit with a window behind you (you'll appear as a dark silhouette). Your face should be well-lit and clearly visible."
        },
        {
          step: "Position your camera at eye level",
          detail: "Use books or a laptop stand. Camera should be at or slightly above eye level – not looking up at you from below (unflattering) or down from above (distant)."
        },
        {
          step: "Test your background",
          detail: "What's visible behind you? Keep it tidy, professional, and uncluttered. Virtual backgrounds are acceptable but can be distracting with poor lighting."
        },
        {
          step: "Enable 'Touch up my appearance'",
          detail: "This subtle filter softens your image slightly. Optional but makes most people look better on camera."
        }
      ],
      tips: [
        "Good lighting is more important than an expensive camera",
        "Test your video setup before your first lesson",
        "Dress professionally from the waist up (yes, really)",
        "Keep your background simple and professional"
      ],
      practice: "Take a screenshot of your Video Settings showing HD enabled and Touch up my appearance checked. Also capture a screenshot of your video preview showing good lighting and camera positioning."
    },
    {
      id: "zoom-screenshare",
      title: "Professional Screen Sharing",
      description: "Screen sharing is how you'll display Oclef Pro to students during lessons. Proper technique ensures students see only relevant content – nothing distracting, nothing private. This is a core teaching skill you'll use constantly.",
      detailedSteps: [
        {
          step: "Practice tab hygiene before lessons",
          detail: "Close all browser tabs except Oclef Pro and any lesson-specific resources (YouTube videos, sheet music, etc.). Students don't need to see your email, personal tabs, or 47 open windows."
        },
        {
          step: "Position Oclef Pro in a dedicated browser window",
          detail: "Don't bury Oclef Pro among tabs. Open it in its own window for clean, professional sharing."
        },
        {
          step: "Click 'Share Screen' in Zoom controls",
          detail: "Green button at the bottom of your Zoom window. A selection dialog appears showing all open windows and applications."
        },
        {
          step: "Select the specific Oclef Pro window",
          detail: "Click on the thumbnail showing Oclef Pro – NOT 'Entire Screen' or your browser with multiple tabs. Share only what students need to see."
        },
        {
          step: "Verify the green border",
          detail: "A green border appears around the shared window. This confirms what students see. If the border encompasses more than Oclef Pro, stop sharing and reselect."
        }
      ],
      tips: [
        "Never share 'Entire Screen' – too risky for privacy",
        "Keep your desktop organized – students notice clutter",
        "Practice sharing/unsharing until it feels natural",
        "You can switch what you're sharing mid-lesson if needed"
      ],
      practice: "Set up your Oclef Pro window cleanly, share only that specific window in Zoom, and take a screenshot showing the green share border around ONLY the Oclef Pro window (not your entire desktop).",
      imagePlaceholder: true,
      imageDescription: "Example: Clean screen share with green border around Oclef Pro window only"
    },
    {
      id: "zoom-annotation",
      title: "Annotation Tools for Music Instruction",
      description: "Zoom's annotation tools let you draw on shared screens in real-time – crucial for marking beats, circling notes, highlighting passages, and visual teaching. Master these tools to communicate visually during lessons.",
      detailedSteps: [
        {
          step: "Start screen sharing (as learned previously)",
          detail: "Annotations only work when you're actively sharing your screen."
        },
        {
          step: "Click 'Annotate' in the screen share toolbar",
          detail: "Appears at the top of your screen when sharing. The annotation toolbar expands with all available tools."
        },
        {
          step: "Master the Draw tool",
          detail: "Freehand drawing for circling notes, marking passages, or sketching musical concepts. Click and drag to draw."
        },
        {
          step: "Use the Text tool for labels",
          detail: "Click where you want text to appear, type your message. Perfect for adding measure numbers, finger positions, or quick notes."
        },
        {
          step: "Spotlight to highlight specific areas",
          detail: "Creates a focused circle of light – everything else dims. Excellent for directing student attention to one specific note or measure."
        },
        {
          step: "Arrow tool for pointing",
          detail: "Draw arrows to indicate direction, flow, or connections between musical elements."
        },
        {
          step: "Eraser to clean up",
          detail: "Remove specific annotations without clearing everything. Click on what you want to erase."
        },
        {
          step: "Clear All to reset",
          detail: "Nuclear option – removes all annotations at once. Use when moving to a new section."
        }
      ],
      tips: [
        "Keep annotations clean – too many marks create confusion",
        "Use different colors to distinguish different concepts",
        "Practice on sheet music before lessons",
        "Clear annotations when transitioning between pieces"
      ],
      practice: "Share your screen with a music document or image, use annotation tools to circle, draw arrows, add text, and use spotlight. Take a screenshot showing your annotations.",
      imagePlaceholder: true,
      imageDescription: "Annotation Practice: Sheet music with circles, arrows, text, and spotlight examples"
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
        moduleName: 'Zoom Configuration',
        moduleNumber: '2.2',
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
            color: '#eb6a18',
            background: 'white',
            border: '2px solid #eb6a18',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(235,106,24,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eb6a18';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#eb6a18';
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
              background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(235,106,24,0.3)',
              flexShrink: 0
            }}>
              <Video size={32} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0'
              }}>
                2.2 - Zoom Configuration
              </h1>
              <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
                Professional audio and video setup for music instruction
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
            border: '2px solid rgba(235,106,24,0.15)'
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
                color: '#d05510',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Video size={18} color="#eb6a18" />
                Module Progress
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
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
                background: 'linear-gradient(90deg, #eb6a18 0%, #ff8c3d 100%)',
                borderRadius: '50px',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: calculateProgress() > 0 ? '0 0 12px rgba(235,106,24,0.4)' : 'none'
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
              borderLeft: '3px solid #eb6a18'
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
                    background: 'linear-gradient(135deg, rgba(235,106,24,0.2) 0%, rgba(255,140,61,0.4) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#eb6a18'
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
              background: 'linear-gradient(135deg, #FFF6ED 0%, #FFE0BA 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(246,174,0,0.3)'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#d05510',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Pro Tips
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#92400E'
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

            {task.imagePlaceholder && (
              <ImagePlaceholder description={task.imageDescription} />
            )}

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
                        color: '#eb6a18',
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

export default Module2ZoomConfiguration;