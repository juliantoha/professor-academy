import { useState, useEffect, useCallback } from 'react';
import { Check, Clock, AlertCircle, RotateCw, Sparkles, Star, Zap, Award, Flame, Target, Trophy, RefreshCw } from 'lucide-react';

// Confetti celebration effect
export const Confetti = ({ active }: { active: boolean }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    rotation: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: '10px',
            height: '10px',
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            animation: `confettiFall 3s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Status badge with animation
interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'completed' | 'rejected' | 'revision';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showIcon?: boolean;
  isDarkMode?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  'in-progress': {
    label: 'In Progress',
    icon: RotateCw,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  submitted: {
    label: 'Submitted',
    icon: Clock,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  approved: {
    label: 'Approved',
    icon: Check,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  completed: {
    label: 'Completed',
    icon: Check,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  revision: {
    label: 'Needs Revision',
    icon: RefreshCw,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  }
};

export const StatusBadge = ({
  status,
  size = 'md',
  animated = true,
  showIcon = true,
  isDarkMode = false
}: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizes = {
    sm: { padding: '4px 10px', fontSize: '11px', iconSize: 12, gap: '4px' },
    md: { padding: '6px 14px', fontSize: '13px', iconSize: 14, gap: '6px' },
    lg: { padding: '8px 18px', fontSize: '14px', iconSize: 16, gap: '8px' }
  };

  const s = sizes[size];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: s.gap,
      padding: s.padding,
      borderRadius: '20px',
      background: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      color: config.color,
      fontSize: s.fontSize,
      fontWeight: 600,
      animation: animated ? 'badgePop 0.3s ease' : undefined
    }}>
      {showIcon && (
        <Icon
          size={s.iconSize}
          style={{
            animation: status === 'in-progress' && animated ? 'spin 2s linear infinite' : undefined
          }}
        />
      )}
      {config.label}

      <style>{`
        @keyframes badgePop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Progress ring with milestones
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  milestones?: number[]; // Array of milestone percentages
  showLabel?: boolean;
  color?: string;
  isDarkMode?: boolean;
}

export const ProgressRing = ({
  progress,
  size = 80,
  strokeWidth = 8,
  milestones = [25, 50, 75, 100],
  showLabel = true,
  color = '#F97316',
  isDarkMode = false
}: ProgressRingProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />

        {/* Milestone markers */}
        {milestones.map(milestone => {
          const angle = ((milestone / 100) * 360 - 90) * (Math.PI / 180);
          const x = size / 2 + radius * Math.cos(angle);
          const y = size / 2 + radius * Math.sin(angle);
          const achieved = animatedProgress >= milestone;

          return (
            <circle
              key={milestone}
              cx={x}
              cy={y}
              r={achieved ? 6 : 4}
              fill={achieved ? color : (isDarkMode ? '#374151' : 'white')}
              stroke={achieved ? 'white' : (isDarkMode ? 'rgba(255,255,255,0.2)' : '#E2E8F0')}
              strokeWidth={2}
              style={{
                transform: 'rotate(90deg)',
                transformOrigin: `${size / 2}px ${size / 2}px`,
                transition: 'all 0.3s ease'
              }}
            />
          );
        })}
      </svg>

      {/* Center label */}
      {showLabel && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: size * 0.25,
            fontWeight: 700,
            color: isDarkMode ? '#F1F5F9' : '#1E293B'
          }}>
            {Math.round(animatedProgress)}%
          </div>
        </div>
      )}
    </div>
  );
};

// Achievement badge
interface AchievementBadgeProps {
  type: 'fast-learner' | 'perfect-submission' | 'streak' | 'mentor' | 'first-module' | 'graduate';
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isDarkMode?: boolean;
}

const achievementConfig = {
  'fast-learner': {
    label: 'Fast Learner',
    description: 'Completed a module in under 24 hours',
    icon: Zap,
    color: '#F59E0B'
  },
  'perfect-submission': {
    label: 'Perfect Submission',
    description: 'First submission approved without revisions',
    icon: Star,
    color: '#8B5CF6'
  },
  streak: {
    label: 'On Fire',
    description: '5-day learning streak',
    icon: Flame,
    color: '#EF4444'
  },
  mentor: {
    label: 'Mentor',
    description: 'Helped 10+ apprentices succeed',
    icon: Award,
    color: '#3B82F6'
  },
  'first-module': {
    label: 'First Steps',
    description: 'Completed your first module',
    icon: Target,
    color: '#10B981'
  },
  graduate: {
    label: 'Graduate',
    description: 'Completed all training modules',
    icon: Trophy,
    color: '#F97316'
  }
};

export const AchievementBadge = ({
  type,
  unlocked = true,
  size = 'md',
  showLabel = true,
  isDarkMode = false
}: AchievementBadgeProps) => {
  const config = achievementConfig[type];
  const Icon = config.icon;

  const sizes = {
    sm: { container: 40, icon: 20 },
    md: { container: 56, icon: 28 },
    lg: { container: 72, icon: 36 }
  };

  const s = sizes[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div style={{
        width: s.container,
        height: s.container,
        borderRadius: '50%',
        background: unlocked
          ? `linear-gradient(135deg, ${config.color}20, ${config.color}40)`
          : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
        border: `2px solid ${unlocked ? config.color : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0')}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        filter: unlocked ? 'none' : 'grayscale(1)',
        opacity: unlocked ? 1 : 0.5,
        transition: 'all 0.3s ease',
        animation: unlocked ? 'achievementUnlock 0.5s ease' : undefined
      }}>
        <Icon
          size={s.icon}
          color={unlocked ? config.color : (isDarkMode ? '#64748B' : '#94A3B8')}
        />
        {unlocked && (
          <div style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `2px solid ${config.color}`,
            animation: 'achievementGlow 2s ease-in-out infinite'
          }} />
        )}
      </div>

      {showLabel && (
        <span style={{
          fontSize: size === 'sm' ? '11px' : '12px',
          fontWeight: 600,
          color: unlocked
            ? (isDarkMode ? '#F1F5F9' : '#1E293B')
            : (isDarkMode ? '#64748B' : '#94A3B8'),
          textAlign: 'center'
        }}>
          {config.label}
        </span>
      )}

      <style>{`
        @keyframes achievementUnlock {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes achievementGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

// Status timeline
interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  reviewer?: string;
  feedback?: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  isDarkMode?: boolean;
}

export const StatusTimeline = ({ events, isDarkMode = false }: StatusTimelineProps) => {
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('approved') || lowerStatus.includes('completed')) return '#10B981';
    if (lowerStatus.includes('submitted') || lowerStatus.includes('pending')) return '#F59E0B';
    if (lowerStatus.includes('rejected') || lowerStatus.includes('revision')) return '#EF4444';
    if (lowerStatus.includes('progress')) return '#3B82F6';
    return '#64748B';
  };

  return (
    <div style={{ position: 'relative', paddingLeft: '24px' }}>
      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '7px',
        top: '8px',
        bottom: '8px',
        width: '2px',
        background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
      }} />

      {events.map((event, idx) => {
        const color = getStatusColor(event.status);
        const isFirst = idx === 0;

        return (
          <div
            key={event.id}
            style={{
              position: 'relative',
              paddingBottom: idx === events.length - 1 ? 0 : '1.5rem',
              animation: `timelineSlide 0.3s ease ${idx * 0.1}s both`
            }}
          >
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-24px',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isFirst ? color : (isDarkMode ? '#374151' : 'white'),
              border: `2px solid ${color}`,
              boxShadow: isFirst ? `0 0 0 4px ${color}20` : 'none'
            }} />

            {/* Content */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isDarkMode ? '#F1F5F9' : '#1E293B'
                }}>
                  {event.status}
                </span>
                {isFirst && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${color}20`,
                    color: color
                  }}>
                    Current
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '12px',
                color: isDarkMode ? '#64748B' : '#94A3B8'
              }}>
                {new Date(event.timestamp).toLocaleString()}
                {event.reviewer && ` by ${event.reviewer}`}
              </div>

              {event.feedback && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: isDarkMode ? '#94A3B8' : '#64748B',
                  fontStyle: 'italic'
                }}>
                  "{event.feedback}"
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes timelineSlide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

// Celebration animation when status changes to approved
export const CelebrationAnimation = ({ show }: { show: boolean }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 10000
    }}>
      {/* Expanding rings */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '3px solid #10B981',
            animation: `celebrationRing 1.5s ease-out ${i * 0.2}s forwards`
          }}
        />
      ))}

      {/* Center icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'celebrationPop 0.5s ease forwards',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
      }}>
        <Check size={40} color="white" strokeWidth={3} />
      </div>

      {/* Sparkles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sparkles
          key={i}
          size={20}
          color="#F59E0B"
          style={{
            position: 'absolute',
            animation: `sparkle 1s ease-out ${i * 0.1}s forwards`,
            transform: `rotate(${i * 45}deg) translateY(-80px)`
          }}
        />
      ))}

      <style>{`
        @keyframes celebrationRing {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes celebrationPop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes sparkle {
          0% {
            transform: rotate(var(--rotation)) translateY(0) scale(0);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation)) translateY(-100px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default StatusBadge;
