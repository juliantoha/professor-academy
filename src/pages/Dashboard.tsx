import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Clock, XCircle, Award, ArrowRight, Eye, AlertCircle, Play, BookOpen, Video, FileText, CheckSquare, Download, MessageSquare, Smartphone, Music2, Theater, Piano, PenLine, Target, Sparkles, Star, Lock, Unlock, MapPin, Flag, Rocket } from 'lucide-react';
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

const MODULE_ICONS: Record<string, React.ComponentType<{size?: number; color?: string}>> = {
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

// Premium Module Card with 3D parallax effect
const PremiumModuleCard = ({
  moduleNumber,
  moduleName,
  description,
  status,
  submissionStatus,
  submittedAt,
  professorNotes,
  onStartClick,
  onViewSubmission,
  hasSubmission,
  isPhase1 = false,
  gradientFrom,
  gradientTo,
  accentColor
}: {
  moduleNumber: string;
  moduleName: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  submissionStatus?: 'Pending' | 'Approved' | 'Needs Work';
  submittedAt?: string;
  professorNotes?: string;
  onStartClick: () => void;
  onViewSubmission?: () => void;
  hasSubmission: boolean;
  isPhase1?: boolean;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const ModuleIcon = MODULE_ICONS[moduleName] || BookOpen;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  }, []);

  const getStatusDisplay = () => {
    if (submissionStatus === 'Pending') {
      return { bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#92400E', icon: Clock, text: 'Under Review', glow: 'rgba(245, 158, 11, 0.3)' };
    }
    if (submissionStatus === 'Needs Work') {
      return { bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', color: '#B91C1C', icon: AlertCircle, text: 'Needs Revision', glow: 'rgba(239, 68, 68, 0.3)' };
    }
    if (submissionStatus === 'Approved') {
      return { bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', color: '#047857', icon: CheckCircle, text: 'Approved', glow: 'rgba(16, 185, 129, 0.3)' };
    }
    switch (status) {
      case 'Completed': return { bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', color: '#047857', icon: CheckCircle, text: 'Completed', glow: 'rgba(16, 185, 129, 0.3)' };
      case 'In Progress': return { bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#92400E', icon: Clock, text: 'In Progress', glow: 'rgba(245, 158, 11, 0.3)' };
      default: return { bg: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', color: '#6B7280', icon: XCircle, text: 'Not Started', glow: 'rgba(107, 114, 128, 0.2)' };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  const isCompleted = submissionStatus === 'Approved' || (status === 'Completed' && !hasSubmission);
  const needsRevision = submissionStatus === 'Needs Work';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'white',
        border: needsRevision ? '2px solid #FCA5A5' : '2px solid transparent',
        boxShadow: isHovered
          ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px ${statusDisplay.glow}`
          : '0 10px 40px rgba(0, 0, 0, 0.08)',
        transform: isHovered
          ? `perspective(1000px) rotateX(${mousePosition.y * -8}deg) rotateY(${mousePosition.x * 8}deg) scale(1.02)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onClick={onStartClick}
    >
      {/* Animated gradient background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '140px',
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        opacity: isHovered ? 1 : 0.95,
        transition: 'opacity 0.3s ease'
      }}>
        {/* Decorative pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        {/* Floating light effect on hover */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            top: `${50 + mousePosition.y * 50}%`,
            left: `${50 + mousePosition.x * 50}%`,
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            transition: 'all 0.1s ease'
          }} />
        )}
      </div>

      {/* Module Icon with glow */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '1.5rem 1.5rem 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isHovered
              ? '0 8px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
              : '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
            transition: 'all 0.3s ease'
          }}>
            <ModuleIcon size={28} color="white" />
          </div>

          {/* Module number badge */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: accentColor
            }}>
              {moduleNumber}
            </span>
            {isCompleted && <CheckCircle size={16} color="#059669" />}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '1.5rem',
        paddingTop: '4.5rem',
        background: 'white'
      }}>
        <h3 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '18px',
          fontWeight: 700,
          color: '#1F2937',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-0.02em'
        }}>
          {moduleName}
        </h3>

        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          margin: '0 0 1.25rem 0',
          lineHeight: 1.6
        }}>
          {description}
        </p>

        {/* Status badge with animation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: statusDisplay.bg,
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 2px 10px ${statusDisplay.glow}`,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)'
          }}>
            <StatusIcon size={16} color={statusDisplay.color} />
            <span style={{
              fontWeight: 600,
              color: statusDisplay.color,
              fontSize: '13px'
            }}>
              {statusDisplay.text}
            </span>
          </div>

          {submittedAt && (
            <span style={{
              fontSize: '12px',
              color: '#9CA3AF'
            }}>
              {new Date(submittedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Professor feedback */}
        {professorNotes && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#1D4ED8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '0.5rem'
            }}>
              Professor Feedback
            </div>
            <p style={{
              fontSize: '13px',
              color: '#1E40AF',
              margin: 0,
              lineHeight: 1.5
            }}>
              {professorNotes}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          {hasSubmission && onViewSubmission && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewSubmission();
              }}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: accentColor,
                background: 'white',
                border: `2px solid ${accentColor}`,
                borderRadius: '10px',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Eye size={16} />
              View Submission
            </button>
          )}

          {(!hasSubmission || needsRevision) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartClick();
              }}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'white',
                background: needsRevision
                  ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
                  : `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                border: 'none',
                borderRadius: '10px',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isHovered
                  ? needsRevision
                    ? '0 8px 25px rgba(220, 38, 38, 0.4)'
                    : `0 8px 25px ${statusDisplay.glow}`
                  : 'none'
              }}
            >
              {needsRevision ? 'Revise & Resubmit' : isPhase1 ? 'Start Orientation' : 'Start Module'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Completion glow effect */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '20px',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          pointerEvents: 'none',
          animation: 'pulse-border 2s ease-in-out infinite'
        }} />
      )}
    </div>
  );
};

// Phase 2 locked state card
const LockedPhase2Card = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
        borderRadius: '20px',
        border: '2px solid rgba(14, 165, 233, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isHovered
          ? '0 20px 50px rgba(14, 165, 233, 0.15)'
          : '0 10px 30px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 40%)
        `,
        animation: 'float-bg 8s ease-in-out infinite'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }}>
          {isHovered ? (
            <Unlock size={36} color="white" />
          ) : (
            <Lock size={36} color="white" />
          )}
        </div>

        <h3 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#0C4A6E',
          margin: '0 0 0.75rem 0'
        }}>
          Phase 2 Awaits
        </h3>

        <p style={{
          fontSize: '15px',
          color: '#0369A1',
          margin: '0 0 1.5rem 0',
          maxWidth: '350px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6
        }}>
          Complete your Orientation to unlock Phase 2 training modules
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.8)',
          padding: '0.75rem 1.25rem',
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <Clock size={18} color="#0284C7" />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#0284C7'
          }}>
            4 modules ready to unlock
          </span>
        </div>
      </div>
    </div>
  );
};

// Animated Journey Timeline Component
const JourneyTimeline = ({
  progress,
  submissions
}: {
  progress: ProgressItem[];
  submissions: Record<string, SubmissionData>;
}) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const journeySteps = CURRICULUM.map((item, index) => {
    const progressItem = progress.find(p => p.phase === item.phase && p.module === item.module);
    const submission = progressItem?.submissionId ? submissions[progressItem.submissionId] : null;

    let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
    if (submission?.status === 'Approved' || (progressItem?.Status === 'Completed' && !progressItem?.submissionId)) {
      status = 'completed';
    } else if (progressItem?.Status === 'In Progress' || progressItem?.Status === 'Completed') {
      status = 'current';
    }

    return {
      number: item.number,
      name: item.module,
      phase: item.phase,
      status,
      icon: MODULE_ICONS[item.module] || BookOpen
    };
  });

  const completedCount = journeySteps.filter(s => s.status === 'completed').length;
  const progressPercent = (completedCount / journeySteps.length) * 100;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Rocket size={24} color="#FBBF24" />
          <h3 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: 'white',
            margin: 0
          }}>
            Your Learning Journey
          </h3>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          padding: '0.5rem 1rem',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Flag size={16} color="#10B981" />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'white'
          }}>
            {completedCount} of {journeySteps.length} milestones
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem'
      }}>
        {/* Progress line background */}
        <div style={{
          position: 'absolute',
          left: '2.5rem',
          right: '2.5rem',
          top: '50%',
          height: '4px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '2px',
          transform: 'translateY(-50%)'
        }} />

        {/* Animated progress line */}
        <div style={{
          position: 'absolute',
          left: '2.5rem',
          top: '50%',
          height: '4px',
          width: `calc(${progressPercent}% * 0.85)`,
          background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
          borderRadius: '2px',
          transform: 'translateY(-50%)',
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
        }} />

        {/* Steps */}
        {journeySteps.map((step, index) => {
          const StepIcon = step.icon;
          const isHovered = hoveredStep === index;
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10,
                cursor: 'pointer'
              }}
            >
              {/* Tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '0.75rem',
                  background: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  whiteSpace: 'nowrap',
                  animation: 'tooltip-appear 0.2s ease-out',
                  zIndex: 100
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#002642',
                    marginBottom: '0.25rem'
                  }}>
                    {step.number} - {step.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isCompleted ? '#059669' : isCurrent ? '#D97706' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {isCompleted && <><CheckCircle size={12} /> Completed</>}
                    {isCurrent && <><Clock size={12} /> In Progress</>}
                    {!isCompleted && !isCurrent && <><MapPin size={12} /> Upcoming</>}
                  </div>
                  {/* Tooltip arrow */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid white'
                  }} />
                </div>
              )}

              {/* Step circle */}
              <div style={{
                width: isHovered ? '60px' : '50px',
                height: isHovered ? '60px' : '50px',
                borderRadius: '50%',
                background: isCompleted
                  ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                  : isCurrent
                    ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
                    : 'rgba(255,255,255,0.1)',
                border: isCompleted || isCurrent
                  ? '3px solid rgba(255,255,255,0.9)'
                  : '3px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isCompleted
                  ? '0 0 25px rgba(16, 185, 129, 0.5)'
                  : isCurrent
                    ? '0 0 25px rgba(251, 191, 36, 0.5)'
                    : 'none',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
              }}>
                {isCompleted ? (
                  <CheckCircle size={24} color="white" strokeWidth={2.5} />
                ) : isCurrent ? (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'white',
                    animation: 'pulse-dot 1.5s ease-in-out infinite'
                  }} />
                ) : (
                  <StepIcon size={20} color="rgba(255,255,255,0.5)" />
                )}
              </div>

              {/* Step label (mobile-hidden) */}
              <span style={{
                marginTop: '0.75rem',
                fontSize: '11px',
                fontWeight: 600,
                color: isCompleted ? '#10B981' : isCurrent ? '#FBBF24' : 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                maxWidth: '80px',
                display: window.innerWidth > 768 ? 'block' : 'none'
              }}>
                {step.number}
              </span>
            </div>
          );
        })}
      </div>

      {/* Journey status message */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {completedCount === journeySteps.length ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Sparkles size={18} color="#34D399" />
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#34D399'
            }}>
              Congratulations! Journey Complete!
            </span>
          </div>
        ) : (
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            {completedCount === 0
              ? 'Start your journey by completing the Orientation module'
              : `${journeySteps.length - completedCount} milestone${journeySteps.length - completedCount > 1 ? 's' : ''} remaining`
            }
          </div>
        )}
      </div>
    </div>
  );
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
  const [isScrolled, setIsScrolled] = useState(false);
  const hasInitialized = useRef(false);

  // Scroll detection for compact header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (hasInitialized.current) {
      console.log('Dashboard already initialized, skipping...');
      return;
    }
    hasInitialized.current = true;

    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardToken]);

  const initializeProgress = async (apprenticeEmail: string) => {
    console.log('initializeProgress called for:', apprenticeEmail);

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

      console.log('Found', existingProgress?.length || 0, 'existing progress records');

      const existingModulesMap = new Map<string, ProgressItem>();
      existingProgress?.forEach((r: ProgressItem) => {
        const key = `${r.phase}-${r.module}`;
        if (!existingModulesMap.has(key) || r.submissionId) {
          existingModulesMap.set(key, r);
        }
      });

      console.log('Unique modules already in Supabase:', Array.from(existingModulesMap.keys()));

      const missingModules = CURRICULUM.filter(
        module => !existingModulesMap.has(`${module.phase}-${module.module}`)
      );

      if (missingModules.length > 0) {
        console.log('Creating', missingModules.length, 'missing progress records:', missingModules.map(m => m.module));

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
          console.log('Progress initialization complete');
        }
      } else {
        console.log('All progress records already exist for', apprenticeEmail, '- no action needed');
      }
    } catch (error) {
      console.error('Error initializing progress:', error);
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

      progressData?.forEach((r: ProgressItem) => {
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
          submissionsData.forEach((sub: SubmissionData) => {
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
        console.log('Saved', field, '=', value);
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        fontFamily: "'Inter', system-ui, sans-serif"
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
            width: '70px',
            height: '70px'
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
              borderTopColor: '#004A69',
              borderRightColor: '#0066A2',
              animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,74,105,0.3)'
            }}>
              <Award size={24} color="white" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#002642',
              margin: '0 0 0.5rem 0'
            }}>
              Loading Your Journey
            </p>
            <p style={{
              fontSize: '14px',
              color: 'rgba(0, 38, 66, 0.6)',
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
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          padding: '3rem',
          background: '#FFF6ED',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 38, 66, 0.08)'
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
            <XCircle size={32} color="#B9314F" />
          </div>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '22px',
            fontWeight: 600,
            color: '#B9314F',
            margin: '0 0 0.5rem 0'
          }}>
            Dashboard Not Found
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(0, 38, 66, 0.6)',
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
      fontFamily: "'Inter', system-ui, sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      padding: '2rem'
    }}>
      {/* Compact Sticky Header - appears on scroll */}
      {isScrolled && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #002642 0%, #004A69 100%)',
          boxShadow: '0 4px 20px rgba(0, 38, 66, 0.2)',
          zIndex: 100,
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Award size={18} color="white" />
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'white',
                  margin: 0
                }}>
                  {apprentice.name}'s Journey
                </h2>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '120px',
                height: '8px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${overallProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #eb6a18 0%, #ff8c3d 100%)',
                  borderRadius: '50px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#FBBF24'
              }}>
                {overallProgress}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Card */}
        <div style={{
          background: '#FFF6ED',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0, 38, 66, 0.06)'
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
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                color: '#002642',
                margin: '0 0 0.5rem 0'
              }}>
                {apprentice.name}'s Training Journey
              </h1>
              <p style={{ color: 'rgba(0, 38, 66, 0.6)', fontSize: '15px', margin: 0 }}>
                Professor: {apprentice.professorEmail}
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #C4E5F4 100%)',
            borderRadius: '16px',
            padding: '1.75rem',
            border: '2px solid rgba(0,74,105,0.15)'
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
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '17px',
                fontWeight: 600,
                color: '#002642'
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

        {/* Journey Timeline */}
        <JourneyTimeline progress={progress} submissions={submissions} />

        {/* Pre-Orientation Checklist */}
        <div style={{
          background: '#FFF6ED',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 4px 16px rgba(0, 38, 66, 0.06)',
          marginBottom: '2rem',
          border: preOrientationComplete ? '2px solid #00952E' : '2px solid #F6AE00'
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
                  ? 'linear-gradient(135deg, #00952E 0%, #C3D366 100%)'
                  : 'linear-gradient(135deg, #F6AE00 0%, #eb6a18 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: preOrientationComplete
                  ? '0 4px 12px rgba(0,149,46,0.3)'
                  : '0 4px 12px rgba(246,174,0,0.3)'
              }}>
                {preOrientationComplete ? (
                  <CheckCircle size={28} color="white" />
                ) : (
                  <Clock size={28} color="white" />
                )}
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#002642',
                  margin: '0 0 0.25rem 0'
                }}>
                  Pre-Orientation Setup
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(0, 38, 66, 0.6)',
                  margin: 0
                }}>
                  Complete these items before your orientation session
                </p>
              </div>
            </div>

            {!preOrientationComplete && (
              <div style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '1px solid #F6AE00',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <AlertCircle size={20} color="#F6AE00" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{
                  fontSize: '14px',
                  color: '#002642',
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
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1px solid #00952E',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <CheckCircle size={20} color="#00952E" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{
                  fontSize: '14px',
                  color: '#002642',
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
                    border: `3px solid ${preOrientationChecks.zoomDownloaded ? '#00952E' : '#D1D5DB'}`,
                    background: preOrientationChecks.zoomDownloaded ? '#00952E' : 'white',
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
                    <Download size={20} color="#004A69" />
                    <h3 style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#002642',
                      margin: 0
                    }}>
                      Zoom Desktop App
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(0, 38, 66, 0.6)',
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
                        color: '#004A69',
                        background: 'white',
                        border: '2px solid #004A69',
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
                        color: '#004A69',
                        background: 'white',
                        border: '2px solid #004A69',
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
                  <strong>Note:</strong> Google Chat requires a Gmail account. If you don't have one, please{' '}
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
                    border: `3px solid ${preOrientationChecks.gchatBrowser ? '#00952E' : '#D1D5DB'}`,
                    background: preOrientationChecks.gchatBrowser ? '#00952E' : 'white',
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
                    <MessageSquare size={20} color="#004A69" />
                    <h3 style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#002642',
                      margin: 0
                    }}>
                      Google Chat - Desktop Browser
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(0, 38, 66, 0.6)',
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
                      color: '#004A69',
                      background: 'white',
                      border: '2px solid #004A69',
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
                    border: `3px solid ${preOrientationChecks.gchatPhone ? '#00952E' : '#D1D5DB'}`,
                    background: preOrientationChecks.gchatPhone ? '#00952E' : 'white',
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
                    <Smartphone size={20} color="#004A69" />
                    <h3 style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#002642',
                      margin: 0
                    }}>
                      Google Chat - Mobile App
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(0, 38, 66, 0.6)',
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
                      color: '#004A69',
                      background: 'white',
                      border: '2px solid #004A69',
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
          background: '#FFF6ED',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 4px 16px rgba(0, 38, 66, 0.06)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#002642',
            margin: '0 0 2rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Star size={24} color="#eb6a18" fill="#eb6a18" />
            Training Modules
          </h2>

          {/* Phase 1 */}
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#eb6a18',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '40px',
              height: '3px',
              background: 'linear-gradient(90deg, #eb6a18 0%, #ff8c3d 100%)',
              borderRadius: '2px'
            }} />
            Phase 1 - Foundation
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <PremiumModuleCard
              moduleNumber="1.1"
              moduleName="Orientation"
              description={MODULE_DESCRIPTIONS['Orientation']}
              status={orientationStatus}
              onStartClick={() => {
                window.location.href = getModuleUrl('Phase 1', 'Orientation');
              }}
              hasSubmission={false}
              isPhase1={true}
              gradientFrom="#eb6a18"
              gradientTo="#ff8c3d"
              accentColor="#eb6a18"
            />
          </div>

          {/* Phase 2 */}
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#0066A2',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '40px',
              height: '3px',
              background: 'linear-gradient(90deg, #0066A2 0%, #004A69 100%)',
              borderRadius: '2px'
            }} />
            Phase 2 - Core Skills
          </div>

          {!hasPhase2Progress ? (
            <LockedPhase2Card />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {phase2Progress.map((item, index) => {
                const submission = item.submissionId ? submissions[item.submissionId] : null;

                return (
                  <PremiumModuleCard
                    key={index}
                    moduleNumber={MODULE_NUMBERS[item.module] || ''}
                    moduleName={item.module}
                    description={MODULE_DESCRIPTIONS[item.module] || 'Complete this training module'}
                    status={item.Status}
                    submissionStatus={submission?.status}
                    submittedAt={submission?.submittedAt}
                    professorNotes={submission?.professorNotes}
                    onStartClick={() => {
                      window.location.href = getModuleUrl(item.phase, item.module);
                    }}
                    onViewSubmission={item.submissionId ? () => {
                      window.location.href = `/review/${item.submissionId}`;
                    } : undefined}
                    hasSubmission={!!item.submissionId}
                    gradientFrom="#0066A2"
                    gradientTo="#004A69"
                    accentColor="#0066A2"
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Apps & Resources */}
        <div style={{
          background: '#FFF6ED',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 4px 16px rgba(0, 38, 66, 0.06)'
        }}>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '22px',
            fontWeight: 700,
            color: '#002642',
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

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes float-bg {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes tooltip-appear {
          from { opacity: 0; transform: translateX(-50%) translateY(5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF6ED 100%)',
        border: `2px solid ${isHovered ? color : '#E5E7EB'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 24px ${color}18` : '0 2px 8px rgba(0, 38, 66, 0.04)'
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
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            color: '#002642',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h3>
          <p style={{ fontSize: '12px', color: 'rgba(0, 38, 66, 0.6)', margin: '0.15rem 0 0 0' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <p style={{
        fontSize: '13px',
        color: 'rgba(0, 38, 66, 0.7)',
        margin: 0,
        lineHeight: '1.6'
      }}>
        {description}
      </p>
    </a>
  );
};

export default Dashboard;
