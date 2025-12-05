import { Monitor, Video, Navigation, FileText, CheckCircle, UserPlus, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onNavigateToAdmin: () => void;
}

const LandingPage = ({ onNavigateToAdmin }: LandingPageProps) => {
  const phases = [
    {
      number: 1,
      title: "Orientation & Admin Setup",
      icon: UserPlus,
      description: "Learn about Oclef's mission and complete administrative onboarding",
      color: "#004A69",
      highlights: ["Company Vision & Values", "Instructor Role Overview", "Administrative Setup"]
    },
    {
      number: 2,
      title: "Training Period",
      icon: Video,
      description: "Master technical tools and develop teaching skills through practice",
      color: "#eb6a18",
      highlights: ["Tech Stack Mastery", "Teaching Presence", "Coaching Techniques"]
    },
    {
      number: 3,
      title: "Employment & Growth",
      icon: CheckCircle,
      description: "Begin teaching independently while advancing toward Assistant Professor",
      color: "#0066A2",
      highlights: ["Independent Lessons", "Continuous Development", "Career Advancement"]
    }
  ];

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      padding: '0'
    }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
        padding: '6rem 3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'inline-block',
            marginBottom: '2rem'
          }}>
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Oclef Training Program
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '56px',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 1.5rem 0',
            letterSpacing: '-2px',
            lineHeight: '1.1'
          }}>
            Professor Academy
          </h1>

          <p style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.9)',
            margin: '0 0 1rem 0',
            fontWeight: 300,
            maxWidth: '800px',
            lineHeight: '1.5'
          }}>
            Transform Apprentices into Expert Online Music Instructors
          </p>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            margin: '0 0 3rem 0',
            maxWidth: '700px',
            lineHeight: '1.6'
          }}>
            Create personalized training dashboards that guide apprentices through a comprehensive three-phase journey—from technical foundations to independent teaching.
          </p>

          <button
            onClick={onNavigateToAdmin}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
              border: 'none',
              borderRadius: '14px',
              padding: '1.25rem 3rem',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(235,106,24,0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(235,106,24,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(235,106,24,0.4)';
            }}
          >
            <UserPlus size={22} />
            Launch Apprentice Dashboard
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Three-Phase Training Path */}
      <section style={{
        padding: '5rem 3rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '36px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 1rem 0',
            letterSpacing: '-1px'
          }}>
            Three-Phase Development Journey
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            margin: 0,
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            A structured pathway that combines technical mastery, pedagogical training, and real-world teaching experience. Each phase includes multiple modules, tasks, and dedicated resources.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {phases.map((phase, index) => {
            const IconComponent = phase.icon;
            return (
              <div
                key={phase.number}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '2px solid #F3F4F6',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = phase.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#F3F4F6';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  fontSize: '120px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  color: `${phase.color}08`,
                  lineHeight: 1,
                  pointerEvents: 'none'
                }}>
                  {phase.number}
                </div>

                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${phase.color}15 0%, ${phase.color}25 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <IconComponent size={32} color={phase.color} strokeWidth={2} />
                </div>

                <div style={{
                  background: `${phase.color}12`,
                  padding: '0.4rem 0.9rem',
                  borderRadius: '8px',
                  display: 'inline-block',
                  marginBottom: '1rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: phase.color,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Phase {phase.number}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#1F2937',
                  margin: '0 0 1rem 0',
                  position: 'relative',
                  zIndex: 1,
                  lineHeight: '1.3'
                }}>
                  {phase.title}
                </h3>

                <p style={{
                  fontSize: '15px',
                  color: '#6B7280',
                  margin: '0 0 1.5rem 0',
                  lineHeight: '1.6',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {phase.description}
                </p>

                <div style={{
                  borderTop: '1px solid #E5E7EB',
                  paddingTop: '1.25rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {phase.highlights.map((highlight, highlightIndex) => (
                    <div
                      key={highlightIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        marginBottom: highlightIndex < phase.highlights.length - 1 ? '0.6rem' : '0'
                      }}
                    >
                      <CheckCircle size={16} color={phase.color} strokeWidth={2.5} />
                      <span style={{
                        fontSize: '14px',
                        color: '#4B5563',
                        fontWeight: 500
                      }}>
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Apps & Resources Section */}
      <section style={{
        background: 'white',
        padding: '5rem 3rem',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '36px',
            fontWeight: 700,
            color: '#004A69',
            margin: '0 0 1rem 0',
            letterSpacing: '-1px'
          }}>
            Comprehensive Training Ecosystem
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            margin: '0 0 2.5rem 0',
            maxWidth: '650px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Access a full suite of specialized apps, interactive modules, training videos, practice tools, and teaching resources designed to support every stage of apprentice development.
          </p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem 3rem 3rem',
        color: '#6B7280',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Oclef Professor Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;