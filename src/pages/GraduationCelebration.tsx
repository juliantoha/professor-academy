import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Star, Award, Share2, Copy, Check, Sparkles, Music2, Theater, Piano, PenLine, ArrowLeft } from 'lucide-react';

interface GraduateData {
  name: string;
  email: string;
  graduatedAt: string;
  professorEmail: string;
}

// Confetti particle component
const ConfettiParticle = ({ delay, left, color }: { delay: number; left: number; color: string }) => (
  <div
    style={{
      position: 'absolute',
      top: '-20px',
      left: `${left}%`,
      width: '12px',
      height: '12px',
      backgroundColor: color,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      animation: `confettiFall 3s ease-in-out ${delay}s infinite`,
      opacity: 0.9,
      transform: `rotate(${Math.random() * 360}deg)`,
    }}
  />
);

// Floating star component
const FloatingStar = ({ delay, size, left, top }: { delay: number; size: number; left: number; top: number }) => (
  <Star
    size={size}
    style={{
      position: 'absolute',
      left: `${left}%`,
      top: `${top}%`,
      color: '#FFD700',
      animation: `twinkle 2s ease-in-out ${delay}s infinite`,
      filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))',
    }}
    fill="#FFD700"
  />
);

const GraduationCelebration = () => {
  const { graduationToken } = useParams<{ graduationToken: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [graduate, setGraduate] = useState<GraduateData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFireworks, setShowFireworks] = useState(true);

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
      } catch (err) {
        setError('Failed to load graduation details');
      } finally {
        setLoading(false);
      }
    };

    fetchGraduate();
  }, [graduationToken]);

  // Auto-hide fireworks after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowFireworks(false), 10000);
    return () => clearTimeout(timer);
  }, []);

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

  // Generate confetti colors
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF'];

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
  }));

  // Generate floating stars
  const floatingStars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    size: 12 + Math.random() * 24,
    left: Math.random() * 100,
    top: 10 + Math.random() * 80
  }));

  // Oclef instrument icons
  const instrumentIcons = [Music2, Theater, Piano, PenLine];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}>
        <div style={{
          color: 'white',
          fontSize: '1.5rem',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <Sparkles size={48} style={{ marginBottom: '1rem' }} />
          <p>Loading celebration...</p>
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <GraduationCap size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h1>
        <p style={{ color: '#a0aec0', marginBottom: '2rem' }}>{error || 'Something went wrong'}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowLeft size={18} />
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      {/* CSS Keyframe animations */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 215, 0, 0.3);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}>
        {/* Confetti Layer */}
        {showFireworks && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
            {confettiParticles.map(particle => (
              <ConfettiParticle key={particle.id} {...particle} />
            ))}
          </div>
        )}

        {/* Floating Stars Layer */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 5 }}>
          {floatingStars.map(star => (
            <FloatingStar key={star.id} {...star} />
          ))}
        </div>

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
          {/* Graduation Cap with Glow */}
          <div style={{
            animation: 'bounce 2s ease-in-out infinite, slideUp 0.8s ease-out',
            marginBottom: '2rem',
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'glow 2s ease-in-out infinite',
              boxShadow: '0 0 60px rgba(255, 215, 0, 0.5)',
            }}>
              <GraduationCap size={72} color="#1a1a2e" strokeWidth={1.5} />
            </div>
          </div>

          {/* Congratulations Text */}
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B, #FF8C00)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '1rem',
            animation: 'slideUp 0.8s ease-out 0.2s both',
            textShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
          }}>
            Congratulations!
          </h1>

          {/* Graduate Name */}
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '0.5rem',
            animation: 'slideUp 0.8s ease-out 0.4s both',
          }}>
            {graduate.name}
          </h2>

          {/* Achievement Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '2rem',
            animation: 'slideUp 0.8s ease-out 0.6s both',
          }}>
            <Award size={24} color="#FFD700" />
            <span style={{
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}>
              Oclef Professor Academy Graduate
            </span>
            <Award size={24} color="#FFD700" />
          </div>

          {/* Graduation Date */}
          <p style={{
            color: '#a0aec0',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            animation: 'slideUp 0.8s ease-out 0.8s both',
          }}>
            Graduated on {formatDate(graduate.graduatedAt)}
          </p>

          {/* Oclef Instruments - Animated */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginBottom: '3rem',
            animation: 'slideUp 0.8s ease-out 1s both',
          }}>
            {instrumentIcons.map((Icon, index) => (
              <div
                key={index}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${confettiColors[index]} 0%, ${confettiColors[index + 4]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: `float 3s ease-in-out ${index * 0.5}s infinite`,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Icon size={28} color="white" />
              </div>
            ))}
          </div>

          {/* Inspirational Message */}
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2rem',
            animation: 'slideUp 0.8s ease-out 1.2s both',
          }}>
            <Sparkles size={32} color="#FFD700" style={{ marginBottom: '1rem' }} />
            <p style={{
              color: 'white',
              fontSize: '1.2rem',
              lineHeight: 1.6,
              fontStyle: 'italic',
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
            gap: '1rem',
            animation: 'slideUp 0.8s ease-out 1.4s both',
          }}>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
              Share this achievement
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
            }}>
              <button
                onClick={copyLink}
                style={{
                  padding: '0.875rem 1.75rem',
                  background: copied
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
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
                  padding: '0.875rem 1.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Toggle Fireworks */}
          <button
            onClick={() => setShowFireworks(!showFireworks)}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
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
              zIndex: 100,
            }}
          >
            <Sparkles size={16} />
            {showFireworks ? 'Hide' : 'Show'} Effects
          </button>
        </div>
      </div>
    </>
  );
};

export default GraduationCelebration;
