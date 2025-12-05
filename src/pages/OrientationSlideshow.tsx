import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Award, Target, TrendingUp, Users, Zap, Book, Maximize, Minimize } from 'lucide-react';

interface OrientationProps {
  apprenticeName?: string;
  apprenticeEmail?: string;
  professorEmail?: string;
  dashboardToken?: string; // Added to redirect back to dashboard
}

const OrientationSlideshow = ({ apprenticeName, apprenticeEmail, professorEmail, dashboardToken }: OrientationProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if orientation is already completed on mount
  useEffect(() => {
    const checkOrientationStatus = async () => {
      if (!apprenticeEmail) {
        setCheckingStatus(false);
        return;
      }

      try {
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
        const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

        const response = await fetch(
          `https://api.airtable.com/v0/${baseId}/Progress?filterByFormula=AND({apprenticeEmail}='${apprenticeEmail}',{phase}='Phase 1',{module}='Orientation')`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.records && data.records.length > 0) {
            const orientationRecord = data.records[0];
            if (orientationRecord.fields.Status === 'Completed') {
              setAlreadyCompleted(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking orientation status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkOrientationStatus();
  }, [apprenticeEmail]);

  const slides = [
    {
      id: 'welcome',
      icon: Award,
      title: 'Welcome to Oclef',
      subtitle: 'Reinventing Piano Education',
      content: [
        "You're not here to run through scales or check boxes on a lesson plan.",
        "You're here because you have the ability to shape how a young person thinks, grows, and takes on challenges.",
        "At Oclef, piano is just the starting point. The real mission is helping kids become confident, disciplined, and curious—people who know how to learn and aren't afraid of hard work."
      ],
      color: '#0066A2'
    },
    {
      id: 'problem',
      icon: Target,
      title: 'Why Most Piano Students Quit',
      subtitle: '83% quit within 3 years',
      content: [
        "Weekly lessons = zero real accountability",
        "Students cram or avoid practice",
        "Parents can't help or feel uncomfortable",
        "Teachers waste time fixing the same habits, week after week",
        "This is where YOU come in—you're the difference between wasted potential and real growth."
      ],
      color: '#eb6a18'
    },
    {
      id: 'model',
      icon: Zap,
      title: 'The Oclef Model',
      subtitle: 'Piano Every Day',
      content: [
        "15-minute daily lessons, fully remote",
        "Professors design; Instructors deliver; Students thrive",
        "Oclef Portal tracks every lesson, quiz, and breakthrough",
        "No commute, no wasted time—just daily momentum",
        "You are the engine of this system"
      ],
      color: '#F6AE00'
    },
    {
      id: 'mission',
      icon: Users,
      title: 'Join the Movement',
      subtitle: 'Not Just a Job — A Mission',
      content: [
        "Become part of America's best online piano school",
        "Work with world-class Professors and mentors",
        "Impact real students, every day",
        "You're not another cog in the machine—you're the one driving change",
        "If you want a mission that matters, you're in the right place"
      ],
      color: '#00952E'
    },
    {
      id: 'role',
      icon: Book,
      title: 'What an Oclef Instructor Does',
      subtitle: 'Your Daily Impact',
      content: [
        "Teach 1:1 daily lessons via Zoom (usually 15 mins)",
        "Follow the Professor's strategy: coach and mentor kids",
        "Use Oclef's proprietary curriculum and software",
        "Track progress, communicate wins/challenges",
        "You are the difference—every student moves forward because of you"
      ],
      color: '#004A69'
    },
    {
      id: 'roadmap',
      icon: TrendingUp,
      title: 'Your Career Roadmap',
      subtitle: 'From Apprentice to Professor',
      content: [
        "Apprentice (Start-Month 3): Shadow, learn, assist & daily lessons",
        "Instructor (Month 3—12): Teach daily, support professor",
        "Senior Instructor (Month 12-24): Lead groups, mentor others",
        "Professor (Year 2+): Design curriculum, manage a studio",
        "Managing Professor (Year 3+): Run a micro-franchise, earn six figures"
      ],
      color: '#8B5CF6'
    },
    {
      id: 'values',
      icon: CheckCircle,
      title: 'The Oclef Way',
      subtitle: 'How We Operate',
      content: [
        "Kids first. Every decision, every lesson.",
        "Relentless innovation. Always question, always improve.",
        "Collaboration: Professors, instructors, parents, tech — one team.",
        "Data-driven: We don't guess. We measure and adapt.",
        "If this sounds like you, you'll thrive here."
      ],
      color: '#0066A2'
    },
    {
      id: 'complete',
      icon: Award,
      title: 'Ready to Begin',
      subtitle: 'Your Journey Starts Now',
      content: [
        "You've completed Phase 1 Orientation",
        "Next: Complete Phase 2 Training",
        "Your Professor will guide you through shadowing sessions",
        "Remember: You're here to make a difference",
        "Let's transform piano education—together"
      ],
      color: '#00952E'
    }
  ];

  const currentSlideData = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') previousSlide();
    if (e.key === ' ') {
      e.preventDefault();
      nextSlide();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleComplete = async () => {
    if (!apprenticeEmail || !professorEmail) {
      alert('❌ Missing required information. Please return to dashboard.');
      return;
    }

    setSubmitting(true);
    
    try {
      const { markOrientationComplete } = await import('../services/submissionService');
      
      await markOrientationComplete({
        apprenticeName: apprenticeName || 'Apprentice',
        apprenticeEmail,
        professorEmail
      });
      
      setCompleted(true);
      setAlreadyCompleted(true); // Mark as completed in state
      alert('✅ Orientation marked complete! Redirecting to your dashboard...');
      
      // Redirect back to the apprentice's dashboard
      setTimeout(() => {
        if (dashboardToken) {
          window.location.href = `/dashboard/${dashboardToken}`;
        } else {
          // Fallback: try to get token from URL params
          const urlParams = new URLSearchParams(window.location.search);
          const tokenFromUrl = urlParams.get('token');
          if (tokenFromUrl) {
            window.location.href = `/dashboard/${tokenFromUrl}`;
          } else {
            // Last resort: go to home and show message
            alert('⚠️ Dashboard token not found. Please check your email for the dashboard link.');
            window.location.href = '/';
          }
        }
      }, 2000);
    } catch (error) {
      console.error('Error marking complete:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let helpText = '\n\nPossible issues:\n';
      helpText += '• Airtable tables not set up correctly\n';
      helpText += '• Missing environment variables (.env file)\n';
      helpText += '• No Progress record exists for this apprentice\n';
      helpText += '• Network connection issue\n\n';
      helpText += 'Check the browser console for details.';
      
      alert(`❌ Failed to mark complete.\n\nError: ${errorMessage}${helpText}`);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem',
      background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
      overflow: 'hidden',
      transition: 'background 2s ease'
    }}>
      <style>{`
        @keyframes plasmaBlob1 {
          0%, 100% { 
            transform: translate(0%, 0%) scale(1) rotate(0deg);
          }
          33% { 
            transform: translate(40%, 30%) scale(1.3) rotate(120deg);
          }
          66% { 
            transform: translate(-30%, 40%) scale(0.8) rotate(240deg);
          }
        }

        @keyframes plasmaBlob2 {
          0%, 100% { 
            transform: translate(0%, 0%) scale(1) rotate(0deg);
          }
          33% { 
            transform: translate(-40%, -30%) scale(1.2) rotate(-120deg);
          }
          66% { 
            transform: translate(30%, -40%) scale(0.9) rotate(-240deg);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .slide-content {
          animation: fadeIn 0.6s ease-out;
        }

        .content-item {
          animation: slideInUp 0.5s ease-out backwards;
        }

        .content-item:nth-child(1) { animation-delay: 0.1s; }
        .content-item:nth-child(2) { animation-delay: 0.2s; }
        .content-item:nth-child(3) { animation-delay: 0.3s; }
        .content-item:nth-child(4) { animation-delay: 0.4s; }
        .content-item:nth-child(5) { animation-delay: 0.5s; }

        .nav-button svg {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Lava Lamp Blobs */}
      <div style={{
        content: '',
        position: 'absolute',
        width: '900px',
        height: '900px',
        borderRadius: '50%',
        filter: 'blur(100px)',
        mixBlendMode: 'screen',
        opacity: 0.85,
        pointerEvents: 'none',
        background: `radial-gradient(circle, ${currentSlideData.color} 0%, ${currentSlideData.color}dd 40%, transparent 70%)`,
        top: '-250px',
        left: '-150px',
        animation: 'plasmaBlob1 25s ease-in-out infinite',
        transition: 'background 1s ease',
        zIndex: 0
      }} />

      <div style={{
        content: '',
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        filter: 'blur(100px)',
        mixBlendMode: 'screen',
        opacity: 0.85,
        pointerEvents: 'none',
        background: `radial-gradient(circle, #F6AE00 0%, #eb6a18 40%, transparent 70%)`,
        bottom: '-200px',
        right: '-150px',
        animation: 'plasmaBlob2 20s ease-in-out infinite',
        zIndex: 0
      }} />

      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: 'rgba(0, 0, 0, 0.2)',
        zIndex: 50
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #F6AE00 0%, #eb6a18 100%)',
          transition: 'width 0.5s ease',
          boxShadow: '0 0 10px rgba(246, 174, 0, 0.5)'
        }} />
      </div>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          outline: 'none',
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.3s ease',
          boxShadow: '0 6px 20px rgba(0, 102, 162, 0.5), 0 0 30px rgba(0, 102, 162, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0080CC 0%, #0066A2 100%)';
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(0, 102, 162, 0.7), 0 0 40px rgba(0, 102, 162, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 162, 0.5), 0 0 30px rgba(0, 102, 162, 0.3)';
        }}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize size={30} strokeWidth={2.5} /> : <Maximize size={30} strokeWidth={2.5} />}
      </button>

      {/* Main Slide Card */}
      <div className="slide-content" style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        padding: '4rem',
        borderRadius: '24px',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        width: '100%',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Slide Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${currentSlideData.color} 0%, ${currentSlideData.color}dd 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${currentSlideData.color}40`
            }}>
              <currentSlideData.icon size={40} color="white" />
            </div>
            <div>
              <h1 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '3rem',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-1px'
              }}>
                {currentSlideData.title}
              </h1>
              <p style={{
                fontSize: '1.5rem',
                color: currentSlideData.color,
                margin: 0,
                fontWeight: 600
              }}>
                {currentSlideData.subtitle}
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {currentSlideData.content.map((item, index) => (
              <div 
                key={index}
                className="content-item"
                style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
                  borderRadius: '16px',
                  borderLeft: `4px solid ${currentSlideData.color}`,
                  fontSize: '1.25rem',
                  lineHeight: '1.8',
                  color: '#1F2937',
                  fontWeight: 400,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Complete Button or Back to Dashboard (on last slide) */}
        {currentSlide === slides.length - 1 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            {checkingStatus ? (
              <div style={{
                fontSize: '1.2rem',
                color: '#6B7280',
                fontStyle: 'italic'
              }}>
                Checking orientation status...
              </div>
            ) : alreadyCompleted ? (
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.5rem 3rem',
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  borderRadius: '14px',
                  marginBottom: '1.5rem',
                  border: '2px solid #00952E'
                }}>
                  <CheckCircle size={32} color="#00952E" />
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#00952E'
                  }}>
                    ✓ Orientation Already Completed
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => {
                      if (dashboardToken) {
                        window.location.href = `/dashboard/${dashboardToken}`;
                      } else {
                        window.history.back();
                      }
                    }}
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      color: 'white',
                      background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '1.25rem 3.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 8px 32px rgba(0,102,162,0.4)',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,102,162,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,102,162,0.4)';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>←</span>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : !completed ? (
              <button
                onClick={handleComplete}
                disabled={submitting}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'white',
                  background: submitting 
                    ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                    : 'linear-gradient(135deg, #00952E 0%, #10B981 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '1.5rem 4rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: submitting ? 'none' : '0 8px 32px rgba(0,149,46,0.4)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,149,46,0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,149,46,0.4)';
                }}
              >
                <CheckCircle size={28} />
                {submitting ? 'Marking Complete...' : 'Mark Orientation Complete'}
              </button>
            ) : null}
          </div>
        )}

        {/* Slide Counter */}
        <div style={{
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '1rem',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          marginTop: '2rem'
        }}>
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        display: 'flex',
        gap: '1.5rem',
        zIndex: 9999
      }}>
        <button
          onClick={previousSlide}
          disabled={currentSlide === 0}
          className="nav-button"
          style={{
            background: currentSlide === 0 
              ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.6) 0%, rgba(209, 213, 219, 0.5) 100%)'
              : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
            color: '#FFFFFF',
            border: currentSlide === 0 ? '3px solid rgba(255,255,255,0.3)' : '3px solid rgba(255,255,255,0.5)',
            outline: 'none',
            width: '85px',
            height: '85px',
            borderRadius: '50%',
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: currentSlide === 0 
              ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
              : '0 10px 40px rgba(235, 106, 24, 0.7), 0 0 50px rgba(235, 106, 24, 0.5)',
            transition: 'all 0.3s ease',
            opacity: currentSlide === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={48} strokeWidth={3} color="#FFFFFF" />
        </button>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="nav-button"
          style={{
            background: currentSlide === slides.length - 1
              ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.6) 0%, rgba(209, 213, 219, 0.5) 100%)'
              : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
            color: '#FFFFFF',
            border: currentSlide === slides.length - 1 ? '3px solid rgba(255,255,255,0.3)' : '3px solid rgba(255,255,255,0.5)',
            outline: 'none',
            width: '85px',
            height: '85px',
            borderRadius: '50%',
            cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: currentSlide === slides.length - 1 
              ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
              : '0 10px 40px rgba(235, 106, 24, 0.7), 0 0 50px rgba(235, 106, 24, 0.5)',
            transition: 'all 0.3s ease',
            opacity: currentSlide === slides.length - 1 ? 0.5 : 1
          }}
        >
          <ChevronRight size={48} strokeWidth={3} color="#FFFFFF" />
        </button>
      </div>

      {/* Keyboard Hint */}
      {currentSlide < 2 && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          left: '40px',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '20px',
          fontSize: '0.9rem',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          animation: 'fadeIn 0.5s ease-out'
        }}>
          Use ← → arrow keys or spacebar to navigate
        </div>
      )}
    </div>
  );
};

export default OrientationSlideshow;