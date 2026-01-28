import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface GraduateData {
  name: string;
  email: string;
  graduatedAt: string;
  professorEmail: string;
}

// Custom SVG Icons
const GradCapIcon = ({ size = 72, color = "#002642" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8L4 22L32 36L60 22L32 8Z" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M14 28V42C14 42 22 50 32 50C42 50 50 42 50 42V28" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M56 24V40" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <circle cx="56" cy="42" r="3" fill={color}/>
    <path d="M54 44L52 52H60L58 44" fill={color}/>
  </svg>
);

const TrophyIcon = ({ size = 24, color = "#FFD700" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4H18V10C18 13.3137 15.3137 16 12 16C8.68629 16 6 13.3137 6 10V4Z" fill={color} stroke={color} strokeWidth="1.5"/>
    <path d="M6 6H4C3.44772 6 3 6.44772 3 7V9C3 10.6569 4.34315 12 6 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 6H20C20.5523 6 21 6.44772 21 7V9C21 10.6569 19.6569 12 18 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 16V18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 21H16L15 18H9L8 21Z" fill={color}/>
    <path d="M12 8L12.5 9.5H14L12.75 10.5L13.25 12L12 11L10.75 12L11.25 10.5L10 9.5H11.5L12 8Z" fill="#002642"/>
  </svg>
);

const MusicNoteIcon = ({ size = 28, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="18" r="3" fill={color}/>
    <path d="M10 18V6L20 4V16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17" cy="16" r="3" fill={color}/>
  </svg>
);

const PianoIcon = ({ size = 28, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M6 6V14" stroke={color} strokeWidth="1.5"/>
    <path d="M10 6V14" stroke={color} strokeWidth="1.5"/>
    <path d="M14 6V14" stroke={color} strokeWidth="1.5"/>
    <path d="M18 6V14" stroke={color} strokeWidth="1.5"/>
    <rect x="5" y="6" width="2" height="6" fill={color}/>
    <rect x="9" y="6" width="2" height="6" fill={color}/>
    <rect x="13" y="6" width="2" height="6" fill={color}/>
    <rect x="17" y="6" width="2" height="6" fill={color}/>
  </svg>
);

const ViolinIcon = ({ size = 28, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="8" cy="16" rx="4" ry="5" stroke={color} strokeWidth="2"/>
    <path d="M12 11V3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 3H14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 14H10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="16" r="1" fill={color}/>
    <path d="M12 16L20 8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MicrophoneIcon = ({ size = 28, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="2" width="6" height="11" rx="3" stroke={color} strokeWidth="2"/>
    <path d="M5 10C5 13.866 8.13401 17 12 17C15.866 17 19 13.866 19 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 17V21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 21H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const StarburstIcon = ({ size = 32, color = "#FFD700" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L18 12L28 10L20 16L28 22L18 20L16 30L14 20L4 22L12 16L4 10L14 12L16 2Z" fill={color}/>
  </svg>
);

const SparkleIcon = ({ size = 16, color = "#FFD700" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0L9 6L16 8L9 10L8 16L7 10L0 8L7 6L8 0Z" fill={color}/>
  </svg>
);

const CopyIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ShareIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

// Confetti particle with varied shapes
const ConfettiParticle = ({ delay, left, color, shape }: { delay: number; left: number; color: string; shape: 'circle' | 'square' | 'triangle' | 'star' }) => {
  const shapeStyles: Record<string, React.CSSProperties> = {
    circle: { borderRadius: '50%' },
    square: { borderRadius: '2px', transform: `rotate(${Math.random() * 45}deg)` },
    triangle: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: `12px solid ${color}`
    },
    star: { borderRadius: '1px' }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '-20px',
        left: `${left}%`,
        width: shape === 'triangle' ? 0 : '10px',
        height: shape === 'triangle' ? 0 : '10px',
        backgroundColor: shape === 'triangle' ? 'transparent' : color,
        animation: `confettiFall ${3 + Math.random() * 2}s ease-in-out ${delay}s infinite`,
        opacity: 0.9,
        ...shapeStyles[shape]
      }}
    />
  );
};

// Laser beam component
const LaserBeam = ({ angle, delay, color }: { angle: number; delay: number; color: string }) => (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '200vw',
      height: '3px',
      background: `linear-gradient(90deg, transparent 0%, ${color} 20%, ${color} 80%, transparent 100%)`,
      transformOrigin: 'center center',
      transform: `rotate(${angle}deg)`,
      animation: `laserPulse 2s ease-in-out ${delay}s infinite`,
      opacity: 0.6,
      filter: `blur(1px) drop-shadow(0 0 10px ${color})`,
    }}
  />
);

// Spotlight component for name
const Spotlight = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: 'relative' }}>
    {/* Spotlight cone effect */}
    <div style={{
      position: 'absolute',
      top: '-100px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '300px',
      height: '150px',
      background: 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(255,215,0,0.1) 45%, rgba(255,215,0,0.2) 50%, rgba(255,215,0,0.1) 55%, transparent 70%)',
      animation: 'spotlightFlicker 3s ease-in-out infinite',
      pointerEvents: 'none',
    }} />
    {/* Name with glow */}
    <div style={{
      position: 'relative',
      zIndex: 1,
      textShadow: '0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.3), 0 0 60px rgba(255,215,0,0.2)',
    }}>
      {children}
    </div>
  </div>
);

// Dancing music note
const DancingNote = ({ left, delay, size }: { left: number; delay: number; size: number }) => (
  <div
    style={{
      position: 'absolute',
      left: `${left}%`,
      bottom: '10%',
      animation: `danceNote 4s ease-in-out ${delay}s infinite`,
      opacity: 0.6,
    }}
  >
    <MusicNoteIcon size={size} color="#FFD700" />
  </div>
);

const GraduationCelebration = () => {
  const { graduationToken } = useParams<{ graduationToken: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [graduate, setGraduate] = useState<GraduateData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEffects, setShowEffects] = useState(true);
  const [effectMode, setEffectMode] = useState<'confetti' | 'lasers'>('confetti');

  useEffect(() => {
    const fetchGraduate = async () => {
      if (!graduationToken) {
        setError('Invalid graduation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('apprentices')
          .select('name, email, graduatedAt, professorEmail')
          .eq('graduation_token', graduationToken)
          .eq('graduated', true)
          .single();

        if (fetchError || !data) {
          setError('Graduation record not found or link has expired');
          setLoading(false);
          return;
        }

        setGraduate(data);
      } catch {
        setError('Failed to load graduation details');
      } finally {
        setLoading(false);
      }
    };

    fetchGraduate();
  }, [graduationToken]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Oclef brand colors
  const brandColors = {
    primary: '#004A69',
    secondary: '#0066A2',
    dark: '#002642',
    accent: '#eb6a18',
    accentLight: '#ff8c3d',
    gold: '#FFD700',
  };

  // Confetti colors matching the brand
  const confettiColors = ['#eb6a18', '#ff8c3d', '#FFD700', '#004A69', '#0066A2', '#10B981', '#F472B6', '#A78BFA'];
  const shapes: Array<'circle' | 'square' | 'triangle' | 'star'> = ['circle', 'square', 'triangle', 'star'];

  // Generate confetti particles
  const confettiParticles = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    left: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)]
  })), []);

  // Generate laser beams
  const laserBeams = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: i * 45,
    delay: i * 0.2,
    color: i % 2 === 0 ? brandColors.accent : brandColors.gold
  })), []);

  // Dancing notes
  const dancingNotes = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: 10 + i * 15,
    delay: i * 0.5,
    size: 20 + Math.random() * 20
  })), []);

  // Floating sparkles
  const sparkles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4,
    size: 12 + Math.random() * 16
  })), []);

  // Instrument icons with their colors
  const instruments = [
    { Icon: MusicNoteIcon, color: '#eb6a18' },
    { Icon: PianoIcon, color: '#0066A2' },
    { Icon: ViolinIcon, color: '#10B981' },
    { Icon: MicrophoneIcon, color: '#A78BFA' },
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${brandColors.dark} 0%, ${brandColors.primary} 50%, ${brandColors.secondary} 100%)`
      }}>
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite', textAlign: 'center' }}>
          <GradCapIcon size={80} color={brandColors.gold} />
          <p style={{ color: 'white', fontSize: '1.25rem', marginTop: '1.5rem', fontFamily: "'Lora', Georgia, serif" }}>
            Preparing your celebration...
          </p>
        </div>
      </div>
    );
  }

  if (error || !graduate) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${brandColors.dark} 0%, ${brandColors.primary} 50%, ${brandColors.secondary} 100%)`,
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <GradCapIcon size={80} color="rgba(255,255,255,0.3)" />
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', marginTop: '1.5rem', fontFamily: "'Lora', Georgia, serif" }}>
          Oops!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>{error || 'Something went wrong'}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.875rem 1.75rem',
            background: `linear-gradient(135deg, ${brandColors.accent} 0%, ${brandColors.accentLight} 100%)`,
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'Inter', sans-serif",
            boxShadow: `0 8px 24px rgba(235, 106, 24, 0.4)`
          }}
        >
          <ArrowLeftIcon size={18} />
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
        }

        @keyframes laserPulse {
          0%, 100% { opacity: 0; transform: rotate(var(--angle)) scaleX(0.5); }
          50% { opacity: 0.6; transform: rotate(var(--angle)) scaleX(1); }
        }

        @keyframes spotlightFlicker {
          0%, 100% { opacity: 0.8; }
          25% { opacity: 1; }
          50% { opacity: 0.9; }
          75% { opacity: 1; }
        }

        @keyframes danceNote {
          0%, 100% { transform: translateY(0) rotate(-10deg); }
          25% { transform: translateY(-30px) rotate(10deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-40px) rotate(15deg); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.3; transform: scale(0.5) rotate(180deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.8)); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-25px); }
          60% { transform: translateY(-12px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes curtainWave {
          0%, 100% { transform: skewY(0deg); }
          50% { transform: skewY(2deg); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${brandColors.dark} 0%, ${brandColors.primary} 40%, ${brandColors.secondary} 100%)`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Stage Curtain Effect - Left */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '80px',
          background: `linear-gradient(90deg, rgba(139, 0, 0, 0.3) 0%, transparent 100%)`,
          animation: 'curtainWave 8s ease-in-out infinite',
          zIndex: 2,
        }} />

        {/* Stage Curtain Effect - Right */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '80px',
          background: `linear-gradient(-90deg, rgba(139, 0, 0, 0.3) 0%, transparent 100%)`,
          animation: 'curtainWave 8s ease-in-out infinite reverse',
          zIndex: 2,
        }} />

        {/* Effects Layer */}
        {showEffects && (
          <>
            {effectMode === 'confetti' ? (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
                {confettiParticles.map(particle => (
                  <ConfettiParticle key={particle.id} {...particle} />
                ))}
              </div>
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
                {laserBeams.map(beam => (
                  <LaserBeam key={beam.id} {...beam} />
                ))}
              </div>
            )}

            {/* Dancing Music Notes */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 8 }}>
              {dancingNotes.map(note => (
                <DancingNote key={note.id} {...note} />
              ))}
            </div>

            {/* Floating Sparkles */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 6 }}>
              {sparkles.map(sparkle => (
                <div
                  key={sparkle.id}
                  style={{
                    position: 'absolute',
                    left: `${sparkle.left}%`,
                    top: `${sparkle.top}%`,
                    animation: `twinkle 2.5s ease-in-out ${sparkle.delay}s infinite`,
                  }}
                >
                  <SparkleIcon size={sparkle.size} color={brandColors.gold} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Main Content */}
        <div style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
        }}>
          {/* Graduation Cap with Trophy */}
          <div style={{
            animation: 'bounce 2.5s ease-in-out infinite, slideUp 0.8s ease-out',
            marginBottom: '1.5rem',
            position: 'relative',
          }}>
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${brandColors.gold} 0%, #FFA500 50%, ${brandColors.accent} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'glow 2s ease-in-out infinite',
              boxShadow: `0 0 60px rgba(255, 215, 0, 0.5), 0 0 100px rgba(235, 106, 24, 0.3)`,
            }}>
              <GradCapIcon size={80} color={brandColors.dark} />
            </div>
            {/* Mini trophies orbiting */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              animation: 'float 3s ease-in-out infinite',
            }}>
              <TrophyIcon size={36} color={brandColors.gold} />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              left: '-15px',
              animation: 'float 3s ease-in-out 1s infinite',
            }}>
              <TrophyIcon size={28} color={brandColors.gold} />
            </div>
          </div>

          {/* Congratulations with Shimmer */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 700,
            fontFamily: "'Lora', Georgia, serif",
            background: `linear-gradient(90deg, ${brandColors.gold}, ${brandColors.accentLight}, ${brandColors.gold}, ${brandColors.accentLight}, ${brandColors.gold})`,
            backgroundSize: '200% auto',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem',
            animation: 'slideUp 0.8s ease-out 0.2s both, shimmer 3s linear infinite',
            letterSpacing: '-0.02em',
          }}>
            Congratulations!
          </h1>

          {/* Graduate Name with Spotlight */}
          <Spotlight>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              fontFamily: "'Lora', Georgia, serif",
              color: 'white',
              marginBottom: '1rem',
              animation: 'slideUp 0.8s ease-out 0.4s both',
              letterSpacing: '-0.01em',
            }}>
              {graduate.name}
            </h2>
          </Spotlight>

          {/* Achievement Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 2.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '60px',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            marginBottom: '2rem',
            animation: 'slideUp 0.8s ease-out 0.6s both',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}>
            <TrophyIcon size={28} color={brandColors.gold} />
            <span style={{
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 600,
              fontFamily: "'Lora', Georgia, serif",
            }}>
              Oclef Professor Academy Graduate
            </span>
            <TrophyIcon size={28} color={brandColors.gold} />
          </div>

          {/* Graduation Date */}
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.15rem',
            marginBottom: '2.5rem',
            animation: 'slideUp 0.8s ease-out 0.8s both',
            fontFamily: "'Inter', sans-serif",
          }}>
            Graduated on {formatDate(graduate.graduatedAt)}
          </p>

          {/* Instrument Icons */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '3rem',
            animation: 'slideUp 0.8s ease-out 1s both',
          }}>
            {instruments.map(({ Icon, color }, index) => (
              <div
                key={index}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: `float 3s ease-in-out ${index * 0.4}s infinite`,
                  boxShadow: `0 12px 40px ${color}40`,
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Icon size={32} color="white" />
              </div>
            ))}
          </div>

          {/* Inspirational Message */}
          <div style={{
            maxWidth: '620px',
            padding: '2rem 2.5rem',
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2.5rem',
            animation: 'slideUp 0.8s ease-out 1.2s both',
            position: 'relative',
          }}>
            <StarburstIcon size={40} color={brandColors.gold} />
            <p style={{
              color: 'white',
              fontSize: '1.25rem',
              lineHeight: 1.7,
              fontStyle: 'italic',
              marginTop: '1rem',
              fontFamily: "'Lora', Georgia, serif",
            }}>
              "You've completed all requirements and demonstrated excellence in music education.
              You're now ready to inspire the next generation of musicians!"
            </p>
          </div>

          {/* Share Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            animation: 'slideUp 0.8s ease-out 1.4s both',
          }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem' }}>
              Share this achievement
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={copyLink}
                style={{
                  padding: '1rem 2rem',
                  background: copied
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : `linear-gradient(135deg, ${brandColors.accent} 0%, ${brandColors.accentLight} 100%)`,
                  border: 'none',
                  borderRadius: '14px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  transition: 'all 0.3s ease',
                  boxShadow: copied
                    ? '0 12px 32px rgba(16, 185, 129, 0.4)'
                    : `0 12px 32px rgba(235, 106, 24, 0.4)`,
                  fontSize: '1rem',
                }}
              >
                {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${graduate.name} - Oclef Graduate`,
                      text: `${graduate.name} has graduated from the Oclef Professor Academy!`,
                      url: shareUrl,
                    });
                  } else {
                    copyLink();
                  }
                }}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '14px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                }}
              >
                <ShareIcon size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Effect Controls */}
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            gap: '0.75rem',
            zIndex: 100,
          }}>
            <button
              onClick={() => setEffectMode(effectMode === 'confetti' ? 'lasers' : 'confetti')}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50px',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <SparkleIcon size={14} color="white" />
              {effectMode === 'confetti' ? 'Lasers' : 'Confetti'}
            </button>
            <button
              onClick={() => setShowEffects(!showEffects)}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50px',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <StarburstIcon size={14} color="white" />
              {showEffects ? 'Hide' : 'Show'} Effects
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GraduationCelebration;
