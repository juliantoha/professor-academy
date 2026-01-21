import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, Circle, BookOpen, Users, Music, Save } from 'lucide-react';

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
  icon: React.ReactNode;
  color: string;
  skills: Skill[];
}

const SKILLS_DATA: Category[] = [
  {
    id: 'student-checkin',
    name: '1. Student Check-In & Workflow',
    icon: <Users size={22} color="white" />,
    color: '#004A69',
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
    icon: <BookOpen size={22} color="white" />,
    color: '#eb6a18',
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
    icon: <Music size={22} color="white" />,
    color: '#471657',
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

const SkillsChecklist = () => {
  const { dashboardToken } = useParams<{ dashboardToken: string }>();
  const navigate = useNavigate();

  const [apprentice, setApprentice] = useState<Apprentice | null>(null);
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (dashboardToken) {
      fetchApprentice();
    }
  }, [dashboardToken]);

  const fetchApprentice = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('apprentices')
        .select('*')
        .eq('dashboardToken', dashboardToken)
        .single();

      if (fetchError) throw fetchError;

      setApprentice(data);

      // Load existing skills checklist if available
      if (data?.skillsChecklist) {
        setCheckedSkills(data.skillsChecklist);
      }
    } catch (err: any) {
      console.error('Error fetching apprentice:', err);
      setError(err.message || 'Failed to load apprentice data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSkill = (skillId: string) => {
    setCheckedSkills(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
    setSaveSuccess(false);
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
    } catch (err: any) {
      console.error('Error saving skills:', err);
      setError(err.message || 'Failed to save skills');
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
        fontFamily: 'Lato, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#0066A2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#004A69', fontWeight: 500 }}>Loading skills checklist...</span>
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
        fontFamily: 'Lato, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            color: '#DC2626',
            marginBottom: '1rem'
          }}>
            {error || 'Apprentice not found'}
          </h2>
          <button
            onClick={() => navigate('/professor')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
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
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
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
          maxWidth: '900px',
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
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 0.25rem 0',
                  letterSpacing: '-0.5px'
                }}>
                  Skills Checklist
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0
                }}>
                  {apprentice.name}
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
                padding: '0.75rem 1.25rem',
                background: saveSuccess
                  ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                  : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(235,106,24,0.3)',
                transition: 'all 0.3s ease',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle size={16} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Progress
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Progress Summary */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: '#004A69',
                margin: '0 0 0.25rem 0'
              }}>
                Training Progress
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: 0
              }}>
                Initial 10-hour shadowing period
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem'
            }}>
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: completedSkills === totalSkills ? '#059669' : '#004A69'
              }}>
                {completedSkills}
              </span>
              <span style={{
                fontSize: '16px',
                color: '#6B7280'
              }}>
                / {totalSkills} skills
              </span>
            </div>
          </div>

          <div style={{
            width: '100%',
            height: '12px',
            background: '#E5E7EB',
            borderRadius: '50px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: completedSkills === totalSkills
                ? 'linear-gradient(90deg, #059669 0%, #10B981 100%)'
                : 'linear-gradient(90deg, #004A69 0%, #0066A2 100%)',
              borderRadius: '50px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <p style={{
            fontSize: '13px',
            color: '#6B7280',
            margin: '0.75rem 0 0 0',
            textAlign: 'right'
          }}>
            {progressPercent}% complete
          </p>
        </div>

        {/* Skills Categories */}
        {SKILLS_DATA.map((category) => {
          const categoryCompleted = category.skills.filter(s => checkedSkills[s.id]).length;

          return (
            <div
              key={category.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                overflow: 'hidden'
              }}
            >
              {/* Category Header */}
              <div style={{
                background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {category.icon}
                  </div>
                  <h3 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0
                  }}>
                    {category.name}
                  </h3>
                </div>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white'
                }}>
                  {categoryCompleted} / {category.skills.length}
                </span>
              </div>

              {/* Skills List */}
              <div style={{ padding: '0.5rem' }}>
                {category.skills.map((skill, index) => (
                  <div
                    key={skill.id}
                    onClick={() => handleToggleSkill(skill.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      background: checkedSkills[skill.id]
                        ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                        : 'transparent',
                      borderBottom: index < category.skills.length - 1
                        ? '1px solid #F3F4F6'
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!checkedSkills[skill.id]) {
                        e.currentTarget.style.background = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checkedSkills[skill.id]) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {checkedSkills[skill.id] ? (
                        <CheckCircle size={24} color="#059669" />
                      ) : (
                        <Circle size={24} color="#D1D5DB" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: checkedSkills[skill.id] ? '#059669' : '#1F2937',
                        margin: '0 0 0.35rem 0',
                        textDecoration: checkedSkills[skill.id] ? 'line-through' : 'none'
                      }}>
                        {skill.name}
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
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Completion Message */}
        {completedSkills === totalSkills && (
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '2px solid #10B981',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
            }}>
              <CheckCircle size={32} color="white" />
            </div>
            <h3 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#059669',
              margin: '0 0 0.5rem 0'
            }}>
              All Skills Completed!
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#047857',
              margin: 0
            }}>
              {apprentice.name} has demonstrated proficiency in all instructor skills.
            </p>
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
      `}</style>
    </div>
  );
};

export default SkillsChecklist;
