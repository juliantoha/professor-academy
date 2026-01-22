import { useState } from 'react';
import { Upload, CheckCircle, Circle, Monitor, Play, AlertCircle, Loader } from 'lucide-react';
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

const Module1ComputerEssentials = () => {
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
  const [operatingSystem, setOperatingSystem] = useState<'mac' | 'windows'>('mac');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [uploadedScreenshots, setUploadedScreenshots] = useState<Record<string, string>>({});
  const [activeUploadBox, setActiveUploadBox] = useState<string | null>(null);
  
  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMacTasks = (): Task[] => {
    return [
      {
        id: "mac-screenshot-1",
        title: "Screenshot Method 1: Command+Shift+5 (Full Control)",
        description: "This is the most versatile screenshot method, giving you complete control over capture options and settings. You'll use this initially to configure your preferences, then switch to faster methods for daily use.",
        detailedSteps: [
          {
            step: "Press Command+Shift+5 simultaneously",
            detail: "This opens the Screenshot toolbar at the bottom of your screen with all capture options visible."
          },
          {
            step: "Click 'Capture Selected Portion'",
            detail: "This is typically the fourth icon from the left. It allows you to drag and select any area of your screen to capture."
          },
          {
            step: "Navigate to 'Options' in the toolbar",
            detail: "Located in the middle of the toolbar. This is where you'll configure important settings."
          },
          {
            step: "Select 'Save to Clipboard'",
            detail: "This is crucial – it copies your screenshot to clipboard instead of saving as a file, allowing instant pasting into documents, emails, or Zoom chat."
          },
          {
            step: "Close the toolbar (press Escape)",
            detail: "Your settings are now saved. You won't need to configure this again."
          }
        ],
        tips: [
          "This method is perfect for initial setup",
          "Once configured, you'll switch to Command+Shift+4 for speed",
          "The toolbar appears briefly – don't worry if it disappears"
        ],
        practice: "Take a screenshot of your desktop using Command+Shift+5, ensuring you've set 'Save to Clipboard' in Options. Paste the result into a document to verify it works."
      },
      {
        id: "mac-screenshot-2",
        title: "Screenshot Method 2: Command+Shift+4 (Quick Select)",
        description: "This is your go-to screenshot method for daily use. It's fast, efficient, and automatically uses the settings you configured in Method 1. You'll use this constantly during lessons to capture student work, lesson notes, and teaching moments.",
        detailedSteps: [
          {
            step: "Press Command+Shift+4",
            detail: "Your cursor immediately changes to a crosshair (+). No toolbar appears – this is the quick method."
          },
          {
            step: "Click and drag to select your area",
            detail: "Position the crosshair at one corner of what you want to capture, hold down the mouse button, and drag to the opposite corner. A translucent blue overlay shows your selection."
          },
          {
            step: "Release to capture",
            detail: "The screenshot is instantly copied to your clipboard (because you configured this in Method 1)."
          },
          {
            step: "Press Command+V to paste",
            detail: "Paste into Zoom chat, Google Docs, email, or any application. The screenshot appears immediately."
          }
        ],
        tips: [
          "This becomes muscle memory – you'll use it dozens of times daily",
          "Practice until you can do it without thinking",
          "If you need to cancel mid-capture, press Escape"
        ],
        practice: "Take 3 screenshots of different parts of your screen using Command+Shift+4. Paste them into a document to demonstrate your proficiency with this essential workflow."
      },
      {
        id: "mac-screenshot-3",
        title: "Screenshot Method 3: Command+Shift+3 (Full Desktop)",
        description: "Use this method when you need to capture your entire screen quickly – ideal for showing your complete workspace, demonstrating multi-window setups, or troubleshooting technical issues with your tech team.",
        detailedSteps: [
          {
            step: "Press Command+Shift+3",
            detail: "Instantly captures your entire desktop – all monitors if you have multiple displays."
          },
          {
            step: "The screenshot is copied to clipboard",
            detail: "No selection needed, no confirmation. It happens immediately and silently."
          },
          {
            step: "Press Command+V to paste",
            detail: "Paste anywhere you need to share your full desktop view."
          }
        ],
        tips: [
          "Less common than Command+Shift+4, but valuable for specific situations",
          "Close unnecessary windows before capturing for professionalism",
          "Useful for technical support requests"
        ],
        practice: "Capture your full desktop with Command+Shift+3 and paste it to demonstrate you can execute a complete screen capture."
      }
    ];
  };

  const getWindowsTasks = (): Task[] => {
    return [
      {
        id: "windows-screenshot-1",
        title: "Screenshot Method 1: Windows+Shift+S (Snipping Tool)",
        description: "This is the modern Windows screenshot tool (Windows 10/11), giving you precise control over what you capture. It's fast, intuitive, and automatically copies to your clipboard—perfect for pasting into Zoom chat, emails, or documents during lessons.",
        detailedSteps: [
          {
            step: "Press Windows+Shift+S simultaneously",
            detail: "Your screen dims slightly and a small toolbar appears at the top. This is Snipping Tool's quick capture mode."
          },
          {
            step: "Select 'Rectangular Snip' (default)",
            detail: "The first icon in the toolbar. This lets you click and drag to select any rectangular area. Most common choice for capturing lesson content."
          },
          {
            step: "Click and drag to select your area",
            detail: "Your cursor becomes a crosshair. Click at one corner, hold, and drag to the opposite corner. The selected area is highlighted."
          },
          {
            step: "Release to capture",
            detail: "The screenshot is instantly copied to your clipboard. A notification appears briefly in the bottom-right confirming the capture."
          },
          {
            step: "Press Ctrl+V to paste",
            detail: "Paste into any application—Zoom chat, Word, Google Docs, email. The screenshot appears immediately."
          }
        ],
        tips: [
          "This is your primary screenshot method—you'll use it constantly",
          "The notification is clickable for quick editing/annotation",
          "Works across all applications without setup",
          "If this shortcut doesn't work, update to Windows 10 (1809+) or Windows 11"
        ],
        practice: "Take a screenshot of a portion of your screen using Windows+Shift+S. Paste it into a document to verify clipboard functionality."
      },
      {
        id: "windows-screenshot-2",
        title: "Screenshot Method 2: Windows+Print Screen (Full Screen Auto-Save)",
        description: "Use this method when you need to capture your entire screen and automatically save it as a file—ideal for documentation, technical support requests, or creating training materials. Unlike clipboard methods, this creates a permanent file instantly.",
        detailedSteps: [
          {
            step: "Press Windows+Print Screen (PrtScn)",
            detail: "Your screen flashes briefly (dims for a split second). This confirms the screenshot was taken."
          },
          {
            step: "Screenshot is auto-saved to Pictures folder",
            detail: "Navigate to This PC > Pictures > Screenshots. The file is named with the date and time (e.g., 'Screenshot 2025-10-01 143022.png')."
          },
          {
            step: "Access the file for sharing",
            detail: "Open the Screenshots folder to find your image. You can now attach it to emails, upload to cloud storage, or share with your tech support team."
          }
        ],
        tips: [
          "Perfect for troubleshooting—captures everything visible",
          "Creates a permanent file (not just clipboard)",
          "Files organize chronologically by timestamp",
          "Close sensitive windows before capturing full screen"
        ],
        practice: "Capture your full screen with Windows+Print Screen, then navigate to Pictures > Screenshots to verify the file was saved."
      },
      {
        id: "windows-screenshot-3",
        title: "Screenshot Method 3: Alt+Print Screen (Active Window Only)",
        description: "This method captures only the window currently in focus—nothing else on your screen. Essential for clean, professional screenshots that show only Oclef Pro or specific applications without exposing your taskbar, desktop, or other windows.",
        detailedSteps: [
          {
            step: "Click on the window you want to capture",
            detail: "Make sure the target window is active (in focus). The title bar should be highlighted, indicating it's the active window."
          },
          {
            step: "Press Alt+Print Screen",
            detail: "No visual confirmation—it happens silently. Only the active window (not the entire screen) is copied to clipboard."
          },
          {
            step: "Press Ctrl+V to paste",
            detail: "Paste into your destination. The screenshot shows only the captured window with its exact dimensions—no background, taskbar, or other elements."
          }
        ],
        tips: [
          "Cleanest method for application screenshots",
          "Great for sharing Oclef Pro views without desktop clutter",
          "Make sure the right window is focused before capturing",
          "More professional than full-screen captures for training"
        ],
        practice: "Open Oclef Pro (or any application), make it active, press Alt+Print Screen, and paste to demonstrate window-specific capture."
      }
    ];
  };

  const tasks = operatingSystem === 'mac' ? getMacTasks() : getWindowsTasks();

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
    // Validation - only check progress and token, emails come from URL params
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
        operatingSystem,
        moduleName: 'Computer Essentials',
        moduleNumber: '2.1',
        phase: 'Phase 2',
        completedTasks,
        uploadedScreenshots,
        dashboardToken
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
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0,74,105,0.3)',
              flexShrink: 0
            }}>
              <Monitor size={32} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0'
              }}>
                2.1 - Computer Essentials
              </h1>
              <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
                Master screenshot techniques for {operatingSystem === 'mac' ? 'macOS' : 'Windows'}
              </p>
            </div>
          </div>

          {/* OS Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#004A69',
              marginBottom: '0.75rem'
            }}>
              Your Operating System
            </label>
            <div style={{
              display: 'flex',
              background: '#F3F4F6',
              borderRadius: '12px',
              padding: '4px',
              gap: '4px',
              width: 'fit-content'
            }}>
              <button
                onClick={() => setOperatingSystem('mac')}
                style={{
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: operatingSystem === 'mac' 
                    ? 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)' 
                    : 'transparent',
                  color: operatingSystem === 'mac' ? 'white' : '#6B7280',
                  boxShadow: operatingSystem === 'mac' ? '0 4px 12px rgba(0,74,105,0.3)' : 'none'
                }}
              >
                macOS
              </button>
              <button
                onClick={() => setOperatingSystem('windows')}
                style={{
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: operatingSystem === 'windows' 
                    ? 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)' 
                    : 'transparent',
                  color: operatingSystem === 'windows' ? 'white' : '#6B7280',
                  boxShadow: operatingSystem === 'windows' ? '0 4px 12px rgba(0,74,105,0.3)' : 'none'
                }}
              >
                Windows
              </button>
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
                <Monitor size={18} color="#0066A2" />
                Module Progress
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
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
                background: 'linear-gradient(90deg, #004A69 0%, #0066A2 100%)',
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
                    background: 'linear-gradient(135deg, rgba(0,74,105,0.2) 0%, rgba(0,102,162,0.4) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#004A69'
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
                      <div>1. Take your screenshot ({operatingSystem === 'mac' ? 'Command+Shift+4' : 'Windows+Shift+S'})</div>
                      <div>2. Click in this box</div>
                      <div>3. Press {operatingSystem === 'mac' ? 'Command+V' : 'Ctrl+V'} to paste</div>
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

export default Module1ComputerEssentials;