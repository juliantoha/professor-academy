import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Award, Target, TrendingUp, Users, Zap, Book, Maximize, Minimize, Briefcase, DollarSign, Clock, Shield, FileText, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrientationProps {
  apprenticeName?: string;
  apprenticeEmail?: string;
  professorEmail?: string;
  dashboardToken?: string;
}

const OrientationSlideshow = ({ apprenticeName, apprenticeEmail, professorEmail, dashboardToken }: OrientationProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [employmentType, setEmploymentType] = useState<'1099' | 'part-time' | null>(null);

  // Check if orientation is already completed on mount
  useEffect(() => {
    const checkOrientationStatus = async () => {
      if (!apprenticeEmail) {
        setCheckingStatus(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .eq('apprenticeEmail', apprenticeEmail)
          .eq('phase', 'Phase 1')
          .eq('module', 'Orientation')
          .single();

        if (!error && data && data.Status === 'Completed') {
          setAlreadyCompleted(true);
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
        "You're not here because you can teach scales and follow a lesson plan.",
        "You're here as a collaborator—someone who shapes how a young person thinks, grows, and takes on challenges.",
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
      id: 'employment',
      icon: Briefcase,
      title: 'Choose Your Path',
      subtitle: 'Employment Type Selection',
      content: [],
      isEmploymentSlide: true,
      color: '#8B5CF6'
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

    if (!employmentType) {
      alert('❌ Please select your preferred employment type before completing orientation.');
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

      // Save employment type preference to apprentice record
      const { error: updateError } = await supabase
        .from('apprentices')
        .update({ employmentType })
        .eq('email', apprenticeEmail);

      if (updateError) {
        console.warn('Could not save employment type preference:', updateError);
        // Don't block completion if this fails - it's not critical
      }
      
      setCompleted(true);
      setAlreadyCompleted(true);
      alert('✅ Orientation marked complete! Redirecting to your dashboard...');
      
      setTimeout(() => {
        if (dashboardToken) {
          window.location.href = `/dashboard/${dashboardToken}`;
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const tokenFromUrl = urlParams.get('token');
          if (tokenFromUrl) {
            window.location.href = `/dashboard/${tokenFromUrl}`;
          } else {
            alert('⚠️ Dashboard token not found. Please check your email for the dashboard link.');
            window.location.href = '/';
          }
        }
      }, 2000);
    } catch (error) {
      console.error('Error marking complete:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let helpText = '\n\nPossible issues:\n';
      helpText += '• Database tables not set up correctly\n';
      helpText += '• Missing environment variables\n';
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
            transform: translate(-50%, -20%) scale(1.2) rotate(-120deg);
          }
          66% { 
            transform: translate(20%, -40%) scale(0.9) rotate(-240deg);
          }
        }

        @keyframes plasmaBlob3 {
          0%, 100% { 
            transform: translate(0%, 0%) scale(1) rotate(0deg);
          }
          33% { 
            transform: translate(30%, -30%) scale(0.7) rotate(90deg);
          }
          66% { 
            transform: translate(-40%, 20%) scale(1.4) rotate(180deg);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Animated plasma background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          top: '-25%',
          left: '-25%',
          background: `radial-gradient(ellipse at 30% 20%, ${currentSlideData.color}40 0%, transparent 50%)`,
          animation: 'plasmaBlob1 20s ease-in-out infinite',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          top: '-25%',
          left: '-25%',
          background: `radial-gradient(ellipse at 70% 80%, ${currentSlideData.color}30 0%, transparent 50%)`,
          animation: 'plasmaBlob2 25s ease-in-out infinite',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          top: '-25%',
          left: '-25%',
          background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 40%)`,
          animation: 'plasmaBlob3 30s ease-in-out infinite',
          filter: 'blur(40px)'
        }} />
      </div>

      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
          padding: '0.75rem',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
        }}
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: 'rgba(255,255,255,0.2)',
        zIndex: 10000
      }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, ${currentSlideData.color} 0%, ${currentSlideData.color}dd 100%)`,
          width: `${progress}%`,
          transition: 'width 0.5s ease, background 0.5s ease',
          boxShadow: `0 0 20px ${currentSlideData.color}80`
        }} />
      </div>

      {/* Main Content */}
      <div style={{
        background: 'white',
        borderRadius: '32px',
        padding: '4rem',
        maxWidth: '900px',
        width: '100%',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${currentSlideData.color} 0%, ${currentSlideData.color}cc 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 12px 32px ${currentSlideData.color}50`,
            transition: 'all 0.5s ease'
          }}>
            {(() => {
              const IconComponent = currentSlideData.icon;
              return <IconComponent size={40} color="white" strokeWidth={2} />;
            })()}
          </div>
          <div>
            <h1 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#004A69',
              margin: 0,
              letterSpacing: '-1px'
            }}>
              {currentSlideData.title}
            </h1>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: currentSlideData.color,
              margin: '0.25rem 0 0 0',
              transition: 'color 0.5s ease'
            }}>
              {currentSlideData.subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '2rem' }}>
          {currentSlideData.id === 'employment' ? (
            // Employment Type Selection UI
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <p style={{
                fontSize: '1.1rem',
                color: '#374151',
                lineHeight: '1.7',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                At Oclef, you can choose how you'd like to work with us. Please select your preferred employment arrangement:
              </p>

              {/* Selection Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* 1099 Contractor Option */}
                <div
                  onClick={() => setEmploymentType('1099')}
                  style={{
                    background: employmentType === '1099'
                      ? 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
                      : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                    border: employmentType === '1099'
                      ? '3px solid #8B5CF6'
                      : '2px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: employmentType === '1099' ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: employmentType === '1099' ? '0 8px 24px rgba(139,92,246,0.25)' : 'none'
                  }}
                >
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
                      background: employmentType === '1099'
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                        : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#004A69',
                        margin: 0
                      }}>
                        1099 Contractor
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#6B7280',
                        margin: '0.25rem 0 0 0'
                      }}>
                        Independent contractor status
                      </p>
                    </div>
                    {employmentType === '1099' && (
                      <CheckCircle size={28} color="#8B5CF6" style={{ marginLeft: 'auto' }} />
                    )}
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: '#059669'
                    }}>
                      <DollarSign size={16} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pros:</span>
                    </div>
                    <ul style={{
                      margin: '0 0 1rem 0',
                      paddingLeft: '1.5rem',
                      fontSize: '0.85rem',
                      color: '#374151',
                      lineHeight: '1.6'
                    }}>
                      <li>Higher per-hour pay rate</li>
                      <li>Flexibility in scheduling</li>
                      <li>Tax deductions for work expenses</li>
                      <li>Work with multiple clients</li>
                    </ul>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: '#DC2626'
                    }}>
                      <Clock size={16} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Considerations:</span>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      fontSize: '0.85rem',
                      color: '#374151',
                      lineHeight: '1.6'
                    }}>
                      <li>Responsible for self-employment taxes (~15.3%)</li>
                      <li>No employer-provided benefits</li>
                      <li>Must file quarterly estimated taxes</li>
                      <li>No paid time off</li>
                    </ul>
                  </div>
                </div>

                {/* Part-Time Employee Option */}
                <div
                  onClick={() => setEmploymentType('part-time')}
                  style={{
                    background: employmentType === 'part-time'
                      ? 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
                      : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                    border: employmentType === 'part-time'
                      ? '3px solid #0066A2'
                      : '2px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: employmentType === 'part-time' ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: employmentType === 'part-time' ? '0 8px 24px rgba(0,102,162,0.25)' : 'none'
                  }}
                >
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
                      background: employmentType === 'part-time'
                        ? 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)'
                        : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#004A69',
                        margin: 0
                      }}>
                        Part-Time Employee
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#6B7280',
                        margin: '0.25rem 0 0 0'
                      }}>
                        W-2 employee status
                      </p>
                    </div>
                    {employmentType === 'part-time' && (
                      <CheckCircle size={28} color="#0066A2" style={{ marginLeft: 'auto' }} />
                    )}
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: '#059669'
                    }}>
                      <Shield size={16} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pros:</span>
                    </div>
                    <ul style={{
                      margin: '0 0 1rem 0',
                      paddingLeft: '1.5rem',
                      fontSize: '0.85rem',
                      color: '#374151',
                      lineHeight: '1.6'
                    }}>
                      <li>Employer handles tax withholding</li>
                      <li>May qualify for benefits (health, etc.)</li>
                      <li>Simpler tax filing (W-2)</li>
                      <li>Stable, predictable pay schedule</li>
                    </ul>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: '#DC2626'
                    }}>
                      <Clock size={16} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Considerations:</span>
                    </div>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      fontSize: '0.85rem',
                      color: '#374151',
                      lineHeight: '1.6'
                    }}>
                      <li>Lower hourly rate than contractors</li>
                      <li>Set schedule requirements</li>
                      <li>Exclusivity requirements may apply</li>
                      <li>Fewer tax deduction opportunities</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Selection Status */}
              {employmentType && (
                <div style={{
                  background: employmentType === '1099'
                    ? 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
                    : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: employmentType === '1099'
                    ? '2px solid #8B5CF6'
                    : '2px solid #0066A2',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <CheckCircle size={24} color={employmentType === '1099' ? '#8B5CF6' : '#0066A2'} />
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: employmentType === '1099' ? '#6D28D9' : '#004A69'
                  }}>
                    You've selected: {employmentType === '1099' ? '1099 Contractor' : 'Part-Time Employee'}
                  </span>
                </div>
              )}

              <p style={{
                fontSize: '0.9rem',
                color: '#6B7280',
                textAlign: 'center',
                marginTop: '1.5rem',
                fontStyle: 'italic'
              }}>
                Note: This preference will be shared with your professor. You can discuss and finalize the arrangement with them.
              </p>
            </div>
          ) : (
            // Regular content for other slides
            currentSlideData.content.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                  borderRadius: '14px',
                  borderLeft: `5px solid ${currentSlideData.color}`,
                  transition: 'all 0.3s ease',
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <span style={{
                  fontSize: '1.15rem',
                  color: '#374151',
                  lineHeight: '1.7',
                  fontWeight: 500
                }}>
                  {item}
                </span>
              </div>
            ))
          )}
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
