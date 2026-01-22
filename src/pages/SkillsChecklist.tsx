import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, BookOpen, Users, Music, Save, Star, Sparkles, Trophy, Zap, MousePointerClick } from 'lucide-react';

interface Apprentice {
  id: string;
  name: string;
  email: string;
  dashboardToken: string;
  skillsChecklist?: Record<string, boolean>;
}

interface Skill {
  id: string;
  name: string;
  aim: string;
}

interface Category {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  glowColor: string;
  skills: Skill[];
}

const SKILLS_DATA: Category[] = [
  {
    id: 'student-checkin',
    name: '1. Student Check-In & Workflow',
    shortName: 'Workflow',
    icon: <Users size={22} color="white" />,
    color: '#002642',
    gradient: 'linear-gradient(135deg, #002642 0%, #004A69 100%)',
    glowColor: 'rgba(0, 74, 105, 0.5)',
    skills: [
      {
        id: 'system-navigation',
        name: 'System Navigation Efficiency',
        aim: 'Locates student profile, lesson plan, and opens assigned piece ≤ 30 sec.'
      },
      {
        id: 'lesson-plan-adherence',
        name: 'Lesson Plan Adherence',
        aim: 'Follows the structured lesson plan step-by-step with clear progression.'
      },
      {
        id: 'documentation-notes',
        name: 'Documentation & Notes',
        aim: 'Writes clear, helpful lesson notes and submits them properly.'
      },
      {
        id: 'quiz-assignment',
        name: 'Quiz Assignment Workflow',
        aim: 'Efficiently assigns theory quiz, sends link, confirms student access.'
      },
      {
        id: 'lesson-closure',
        name: 'Professional Lesson Closure',
        aim: 'Smooth, timely lesson ending with appropriate student transition to quiz.'
      }
    ]
  },
  {
    id: 'lesson-evaluation',
    name: '2. Lesson Evaluation',
    shortName: 'Teaching',
    icon: <BookOpen size={22} color="white" />,
    color: '#eb6a18',
    gradient: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
    glowColor: 'rgba(235, 106, 24, 0.5)',
    skills: [
      {
        id: 'issue-diagnosis',
        name: 'Student Issue Diagnosis',
        aim: 'Quickly identifies core technical/musical issues; precise understanding.'
      },
      {
        id: 'coaching-effectiveness',
        name: 'Coaching Effectiveness',
        aim: 'Student shows clear improvement; engaging, supportive instruction.'
      },
      {
        id: 'tool-application',
        name: 'Oclef Tool Application',
        aim: 'Expertly uses multiple Oclef tools; perfect tool-to-problem matching.'
      },
      {
        id: 'assignment-updates',
        name: 'Assignment Updates',
        aim: 'Thoughtful, appropriate assignment modifications; clear progression path.'
      },
      {
        id: 'teaching-presence',
        name: 'Teaching Presence',
        aim: 'Confident, enthusiastic, maintains excellent student engagement.'
      }
    ]
  },
  {
    id: 'notation-mastery',
    name: '3. Oclef Notation Mastery',
    shortName: 'Notation',
    icon: <Music size={22} color="white" />,
    color: '#471657',
    gradient: 'linear-gradient(135deg, #471657 0%, #6B2C7B 100%)',
    glowColor: 'rgba(71, 22, 87, 0.5)',
    skills: [
      {
        id: 'symbol-knowledge',
        name: 'Symbol Knowledge & Recall',
        aim: 'Demonstrates comprehensive knowledge of Oclef movement symbols and their meanings.'
      },
      {
        id: 'movement-analysis',
        name: 'Movement Analysis',
        aim: 'Accurately identifies required physical movements from the musical score.'
      },
      {
        id: 'symbol-application',
        name: 'Symbol Application',
        aim: 'Correctly applies appropriate symbols to map physical movements in the passage.'
      },
      {
        id: 'annotation-clarity',
        name: 'Annotation Clarity',
        aim: 'Marks are clean, legible, well-placed, and follow Oclef notation standards.'
      }
    ]
  }
];

// Particle burst component for celebrations
const ParticleBurst = ({ active, color }: { active: boolean; color: string }) => {
  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            animation: `particle-burst-${i % 4} 0.6s ease-out forwards`,
            opacity: 0
          }}
        />
      ))}
    </div>
  );
};

// Skill Node Component
const SkillNode = ({
  skill,
  isCompleted,
  onClick,
  color,
  gradient,
  glowColor,
  index,
  totalInCategory
}: {
  skill: Skill;
  isCompleted: boolean;
  onClick: () => void;
  color: string;
  gradient: string;
  glowColor: string;
  index: number;
  totalInCategory: number;
}) => {
  const [showBurst, setShowBurst] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleClick = () => {
    if (!isCompleted) {
      setShowBurst(true);
      setJustCompleted(true);
      setTimeout(() => {
        setShowBurst(false);
        setJustCompleted(false);
      }, 700);
    }
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem',
        cursor: 'pointer',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isCompleted
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)'
          : isHovered
            ? 'rgba(0, 0, 0, 0.03)'
            : 'transparent',
        transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
        boxShadow: isCompleted
          ? '0 4px 20px rgba(16, 185, 129, 0.15)'
          : isHovered
            ? '0 4px 20px rgba(0, 0, 0, 0.08)'
            : 'none'
      }}
    >
      {/* Connection line to next skill */}
      {index < totalInCategory - 1 && (
        <div
          style={{
            position: 'absolute',
            left: '2.25rem',
            top: '100%',
            width: '2px',
            height: '0.5rem',
            background: isCompleted
              ? 'linear-gradient(180deg, #10B981 0%, rgba(16, 185, 129, 0.3) 100%)'
              : '#E5E7EB',
            transition: 'background 0.3s ease'
          }}
        />
      )}

      {/* Skill Node Circle */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ParticleBurst active={showBurst} color={color} />
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isCompleted
              ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
              : gradient,
            boxShadow: isCompleted
              ? '0 0 20px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(16, 185, 129, 0.3)'
              : isHovered
                ? `0 0 25px ${glowColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: justCompleted
              ? 'scale(1.2)'
              : isHovered
                ? 'scale(1.1)'
                : 'scale(1)',
            border: isCompleted
              ? '3px solid rgba(255, 255, 255, 0.9)'
              : '3px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {isCompleted ? (
            <CheckCircle size={24} color="white" strokeWidth={2.5} />
          ) : (
            <span style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: "'Montserrat', sans-serif"
            }}>
              {index + 1}
            </span>
          )}
        </div>

        {/* Completion sparkle */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            animation: 'sparkle 2s ease-in-out infinite'
          }}>
            <Sparkles size={16} color="#FBBF24" fill="#FBBF24" />
          </div>
        )}

        {/* Tap indicator for uncompleted skills */}
        {!isCompleted && (
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: color,
            color: 'white',
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            opacity: isHovered ? 1 : 0.85,
            transition: 'opacity 0.2s ease'
          }}>
            tap
          </div>
        )}
      </div>

      {/* Skill Content */}
      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: isCompleted ? '#059669' : '#1F2937',
          margin: '0 0 0.35rem 0',
          transition: 'color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {skill.name}
          {isCompleted && (
            <span style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Mastered
            </span>
          )}
        </h4>
        <p style={{
          fontSize: '13px',
          color: '#6B7280',
          margin: 0,
          lineHeight: 1.5
        }}>
          {skill.aim}
        </p>
      </div>

      {/* Hover indicator */}
      {!isCompleted && isHovered && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: color,
          fontSize: '13px',
          fontWeight: 600,
          animation: 'pulse-opacity 1.5s ease-in-out infinite'
        }}>
          <Zap size={16} />
          Click to complete
        </div>
      )}
    </div>
  );
};

// Category Progress Ring
const ProgressRing = ({ progress, color, size = 80 }: { progress: number; color: string; size?: number }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))'
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <span style={{
          fontSize: size > 60 ? '20px' : '16px',
          fontWeight: 700,
          color: 'white',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Achievement Badge for completed category
const AchievementBadge = ({ category }: { category: Category }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)',
    animation: 'badge-appear 0.5s ease-out'
  }}>
    <Trophy size={20} color="#FBBF24" fill="#FBBF24" />
    <span style={{
      color: 'white',
      fontSize: '13px',
      fontWeight: 600
    }}>
      {category.shortName} Mastery Achieved!
    </span>
  </div>
);

const SkillsChecklist = () => {
  const { dashboardToken } = useParams<{ dashboardToken: string }>();
  const navigate = useNavigate();

  const [apprentice, setApprentice] = useState<Apprentice | null>(null);
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchApprentice = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('apprentices')
        .select('*')
        .eq('dashboardToken', dashboardToken)
        .single();

      if (fetchError) throw fetchError;

      setApprentice(data);

      if (data?.skillsChecklist) {
        setCheckedSkills(data.skillsChecklist);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load apprentice data';
      console.error('Error fetching apprentice:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dashboardToken]);

  useEffect(() => {
    if (dashboardToken) {
      fetchApprentice();
    }
  }, [dashboardToken, fetchApprentice]);

  const handleToggleSkill = (skillId: string) => {
    const wasCompleted = checkedSkills[skillId];
    const newCheckedSkills = {
      ...checkedSkills,
      [skillId]: !wasCompleted
    };

    setCheckedSkills(newCheckedSkills);
    setSaveSuccess(false);

    // Check if all skills just got completed
    const totalSkills = SKILLS_DATA.reduce((acc, cat) => acc + cat.skills.length, 0);
    const newCompletedCount = Object.values(newCheckedSkills).filter(Boolean).length;

    if (newCompletedCount === totalSkills && !wasCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const handleSave = async () => {
    if (!apprentice) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('apprentices')
        .update({ skillsChecklist: checkedSkills })
        .eq('dashboardToken', dashboardToken);

      if (updateError) throw updateError;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save skills';
      console.error('Error saving skills:', err);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const totalSkills = SKILLS_DATA.reduce((acc, cat) => acc + cat.skills.length, 0);
  const completedSkills = Object.values(checkedSkills).filter(Boolean).length;
  const progressPercent = Math.round((completedSkills / totalSkills) * 100);

  if (loading) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)'
      }}>
        {/* Skeleton Header */}
        <header style={{
          background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '1.5rem 2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.15)',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite'
                }} />
                <div>
                  <div style={{
                    width: '120px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.2)',
                    marginBottom: '0.5rem',
                    animation: 'skeleton-pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{
                    width: '180px',
                    height: '14px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.15)',
                    animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.1s'
                  }} />
                </div>
              </div>
              <div style={{
                width: '130px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.2s'
              }} />
            </div>
          </div>
        </header>

        <main style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {/* Skeleton Progress Hero */}
          <div style={{
            background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 60px rgba(0, 50, 80, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{
                  width: '150px',
                  height: '20px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.2)',
                  marginBottom: '0.75rem',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite'
                }} />
                <div style={{
                  width: '200px',
                  height: '14px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.15)',
                  marginBottom: '1.5rem',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.1s'
                }} />
                <div style={{
                  width: '100%',
                  height: '12px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '50px',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.2s'
                }} />
              </div>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.3s'
              }} />
            </div>
          </div>

          {/* Skeleton Category Cards */}
          {[0, 1, 2].map((categoryIndex) => (
            <div
              key={categoryIndex}
              style={{
                background: 'white',
                borderRadius: '24px',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Skeleton Category Header */}
              <div style={{
                background: categoryIndex === 0
                  ? 'linear-gradient(135deg, #002642 0%, #004A69 100%)'
                  : categoryIndex === 1
                    ? 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)'
                    : 'linear-gradient(135deg, #471657 0%, #6B2C7B 100%)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.2)',
                    animation: 'skeleton-pulse 1.5s ease-in-out infinite'
                  }} />
                  <div>
                    <div style={{
                      width: '180px',
                      height: '17px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.25)',
                      marginBottom: '0.5rem',
                      animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.1s'
                    }} />
                    <div style={{
                      width: '120px',
                      height: '13px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.15)',
                      animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.2s'
                    }} />
                  </div>
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  animation: 'skeleton-pulse 1.5s ease-in-out infinite 0.3s'
                }} />
              </div>

              {/* Skeleton Skills */}
              <div style={{ padding: '1rem' }}>
                {[0, 1, 2, 3, 4].slice(0, categoryIndex === 2 ? 4 : 5).map((skillIndex) => (
                  <div
                    key={skillIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.25rem',
                      borderRadius: '16px'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#E5E7EB',
                      flexShrink: 0,
                      animation: `skeleton-pulse 1.5s ease-in-out infinite ${skillIndex * 0.1}s`
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        width: `${60 + Math.random() * 30}%`,
                        height: '15px',
                        borderRadius: '4px',
                        background: '#E5E7EB',
                        marginBottom: '0.5rem',
                        animation: `skeleton-pulse 1.5s ease-in-out infinite ${skillIndex * 0.1 + 0.05}s`
                      }} />
                      <div style={{
                        width: `${70 + Math.random() * 25}%`,
                        height: '13px',
                        borderRadius: '4px',
                        background: '#F3F4F6',
                        animation: `skeleton-pulse 1.5s ease-in-out infinite ${skillIndex * 0.1 + 0.1}s`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>

        <style>{`
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (error || !apprentice) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <span style={{ fontSize: '40px' }}>!</span>
          </div>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#B9314F',
            marginBottom: '1rem'
          }}>
            {error || 'Apprentice not found'}
          </h2>
          <button
            onClick={() => navigate('/professor')}
            style={{
              padding: '0.875rem 2rem',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 74, 105, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)'
    }}>
      {/* Confetti overlay for full completion */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: ['#10B981', '#FBBF24', '#3B82F6', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 5)],
                animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header - Sticky */}
      <header style={{
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: 0,
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
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate('/professor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.625rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 0.25rem 0',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <Star size={24} color="#FBBF24" fill="#FBBF24" />
                  Skill Tree
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0
                }}>
                  {apprentice.name}'s Journey to Mastery
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.5rem',
                background: saveSuccess
                  ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                  : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saveSuccess
                  ? '0 4px 20px rgba(16, 185, 129, 0.4)'
                  : '0 4px 20px rgba(235,106,24,0.4)',
                transition: 'all 0.3s ease',
                opacity: saving ? 0.7 : 1,
                transform: saveSuccess ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle size={18} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Progress
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Overall Progress Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0, 50, 80, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '40%',
            background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                color: 'white',
                margin: '0 0 0.5rem 0'
              }}>
                Training Progress
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
                margin: '0 0 1.5rem 0'
              }}>
                Initial 10-hour shadowing period
              </p>

              {/* Progress bar with glow */}
              <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: completedSkills === totalSkills
                    ? 'linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 100%)'
                    : 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
                  borderRadius: '50px',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: completedSkills === totalSkills
                    ? '0 0 20px rgba(16, 185, 129, 0.6)'
                    : '0 0 20px rgba(251, 191, 36, 0.6)'
                }} />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '0.75rem'
              }}>
                <span style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  {completedSkills} of {totalSkills} skills mastered
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: completedSkills === totalSkills ? '#34D399' : '#FBBF24'
                }}>
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Large progress ring */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                position: 'relative'
              }}>
                <ProgressRing progress={progressPercent} color="#FBBF24" size={100} />
                {completedSkills === totalSkills && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    animation: 'bounce 1s ease-in-out infinite'
                  }}>
                    <Trophy size={28} color="#FBBF24" fill="#FBBF24" />
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Overall
              </span>
            </div>
          </div>
        </div>

        {/* Instruction hint */}
        {completedSkills < totalSkills && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            border: '2px dashed rgba(251, 191, 36, 0.4)',
            animation: 'subtle-pulse 3s ease-in-out infinite'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
              animation: 'tap-hint 2s ease-in-out infinite'
            }}>
              <MousePointerClick size={20} color="white" />
            </div>
            <p style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#92400E',
              margin: 0
            }}>
              <strong>Tap the numbered circles</strong> to confirm each skill as the apprentice demonstrates mastery
            </p>
          </div>
        )}

        {/* Skills Categories */}
        {SKILLS_DATA.map((category) => {
          const categoryCompleted = category.skills.filter(s => checkedSkills[s.id]).length;
          const categoryProgress = (categoryCompleted / category.skills.length) * 100;
          const isCategoryComplete = categoryCompleted === category.skills.length;

          return (
            <div
              key={category.id}
              style={{
                background: 'white',
                borderRadius: '24px',
                marginBottom: '1.5rem',
                boxShadow: isCategoryComplete
                  ? '0 20px 60px rgba(16, 185, 129, 0.2)'
                  : '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: isCategoryComplete
                  ? '2px solid rgba(16, 185, 129, 0.3)'
                  : '2px solid transparent'
              }}
            >
              {/* Category Header */}
              <div style={{
                background: category.gradient,
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background glow for completed categories */}
                {isCategoryComplete && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, transparent 60%)',
                    animation: 'pulse-opacity 2s ease-in-out infinite'
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    {isCategoryComplete ? (
                      <Trophy size={26} color="#FBBF24" fill="#FBBF24" />
                    ) : (
                      category.icon
                    )}
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '17px',
                      fontWeight: 600,
                      color: 'white',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {category.name}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.8)',
                      margin: 0
                    }}>
                      {categoryCompleted} of {category.skills.length} skills completed
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {isCategoryComplete && (
                    <AchievementBadge category={category} />
                  )}
                  <ProgressRing progress={categoryProgress} color="white" size={56} />
                </div>
              </div>

              {/* Skills List */}
              <div style={{ padding: '1rem' }}>
                {category.skills.map((skill, index) => (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    isCompleted={!!checkedSkills[skill.id]}
                    onClick={() => handleToggleSkill(skill.id)}
                    color={category.color}
                    gradient={category.gradient}
                    glowColor={category.glowColor}
                    index={index}
                    totalInCategory={category.skills.length}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Completion Celebration */}
        {completedSkills === totalSkills && (
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center',
            marginTop: '1rem',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'slide-up 0.5s ease-out'
          }}>
            {/* Decorative stars */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <Sparkles size={24} color="rgba(255,255,255,0.4)" />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '25%',
              right: '15%',
              animation: 'float 3s ease-in-out infinite 1s'
            }}>
              <Star size={20} color="rgba(255,255,255,0.3)" />
            </div>

            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 40px rgba(255,255,255,0.3)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <Trophy size={50} color="white" />
            </div>
            <h3 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '28px',
              fontWeight: 700,
              color: 'white',
              margin: '0 0 0.75rem 0'
            }}>
              Mastery Achieved!
            </h3>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.9)',
              margin: '0 0 1.5rem 0',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              {apprentice.name} has demonstrated proficiency in all {totalSkills} instructor skills.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)'
            }}>
              <CheckCircle size={20} color="white" />
              <span style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}>
                Ready for Independent Teaching
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#6B7280',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Oclef Professor Academy
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes pulse-opacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badge-appear {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes particle-burst-0 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 30px), calc(-50% - 30px)) scale(1); opacity: 0; }
        }
        @keyframes particle-burst-1 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 30px), calc(-50% - 20px)) scale(1); opacity: 0; }
        }
        @keyframes particle-burst-2 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 25px), calc(-50% + 25px)) scale(1); opacity: 0; }
        }
        @keyframes particle-burst-3 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 25px), calc(-50% + 30px)) scale(1); opacity: 0; }
        }
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes tap-hint {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default SkillsChecklist;
