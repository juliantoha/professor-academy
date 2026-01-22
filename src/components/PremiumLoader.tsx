import { useEffect, useState } from 'react';

interface PremiumLoaderProps {
  message?: string;
  subMessage?: string;
}

const PremiumLoader = ({
  message = 'Professor Academy',
  subMessage = 'Loading your experience...'
}: PremiumLoaderProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${
                i % 2 === 0
                  ? 'rgba(0, 74, 105, 0.08)'
                  : 'rgba(235, 106, 24, 0.06)'
              } 0%, transparent 70%)`,
              left: `${10 + (i * 15)}%`,
              top: `${20 + (i * 10)}%`,
              animation: `float-particle ${6 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Main loader content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        animation: 'fadeInUp 0.5s ease-out',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Animated Logo Container */}
        <div style={{ position: 'relative' }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute',
            inset: '-12px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(0, 74, 105, 0.15), rgba(0, 102, 162, 0.1))',
            animation: 'pulse-ring 2s ease-in-out infinite',
            filter: 'blur(8px)'
          }} />

          {/* Logo box */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
            boxShadow: '0 16px 48px rgba(0, 50, 80, 0.3), 0 4px 12px rgba(0, 50, 80, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            animation: 'logo-float 3s ease-in-out infinite'
          }}>
            {/* Inner shine effect */}
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              right: '4px',
              height: '40%',
              borderRadius: '18px 18px 40% 40%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              pointerEvents: 'none'
            }} />

            {/* Graduation cap icon */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
        </div>

        {/* Text content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <h1 style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: '#002642',
            margin: 0,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #002642 0%, #004A69 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {message}
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            color: '#64748b',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {subMessage}
            <span style={{
              width: '20px',
              textAlign: 'left',
              fontWeight: 500
            }}>{dots}</span>
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '220px',
          height: '5px',
          background: 'rgba(0, 74, 105, 0.1)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, transparent, #004A69, #0066A2, transparent)',
            borderRadius: '10px',
            animation: 'shimmer 1.8s ease-in-out infinite'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes logo-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          33% {
            transform: translate(15px, -20px) scale(1.1);
            opacity: 0.8;
          }
          66% {
            transform: translate(-10px, 10px) scale(0.95);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumLoader;
