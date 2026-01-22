import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { colors, borderRadius, transitions } from '../styles/oclefDesignSystem';

interface DarkModeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  size = 'medium',
  showLabel = false,
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const sizeConfig = {
    small: { width: 48, height: 26, icon: 14, travel: 20 },
    medium: { width: 56, height: 30, icon: 16, travel: 24 },
    large: { width: 64, height: 34, icon: 18, travel: 28 },
  };

  const config = sizeConfig[size];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {showLabel && (
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: isDarkMode ? '#E5E7EB' : colors.textSecondary,
            transition: `color ${transitions.smooth}`,
          }}
        >
          {isDarkMode ? 'Dark' : 'Light'}
        </span>
      )}

      <button
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'relative',
          width: config.width,
          height: config.height,
          borderRadius: borderRadius.full,
          border: 'none',
          cursor: 'pointer',
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #87CEEB 0%, #FFD700 100%)',
          boxShadow: isDarkMode
            ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)'
            : 'inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.1)',
          transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Stars (visible in dark mode) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: isDarkMode ? 1 : 0,
            transition: `opacity 0.4s ease`,
          }}
        >
          {[
            { top: '20%', left: '15%', size: 2 },
            { top: '60%', left: '25%', size: 1.5 },
            { top: '35%', left: '70%', size: 2 },
            { top: '70%', left: '80%', size: 1.5 },
          ].map((star, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                borderRadius: '50%',
                backgroundColor: '#FFF',
                animation: isDarkMode ? `twinkle ${1 + i * 0.3}s ease-in-out infinite` : 'none',
              }}
            />
          ))}
        </div>

        {/* Clouds (visible in light mode) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: isDarkMode ? 0 : 0.6,
            transition: `opacity 0.4s ease`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '45%',
              left: '60%',
              width: 12,
              height: 6,
              borderRadius: 6,
              backgroundColor: '#FFF',
              boxShadow: '4px -2px 0 -1px #FFF, -4px 0 0 -1px #FFF',
            }}
          />
        </div>

        {/* Toggle Knob (Sun/Moon) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: isDarkMode ? `${config.width - config.height + 2}px` : '2px',
            transform: 'translateY(-50%)',
            width: config.height - 4,
            height: config.height - 4,
            borderRadius: '50%',
            background: isDarkMode
              ? 'linear-gradient(135deg, #F5F5DC 0%, #E8E8D0 100%)'
              : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)'
              : '0 2px 12px rgba(255,165,0,0.5), inset 2px 2px 4px rgba(255,255,255,0.3)',
            transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Moon craters (visible in dark mode) */}
          <div
            style={{
              position: 'absolute',
              opacity: isDarkMode ? 0.3 : 0,
              transition: `opacity 0.4s ease`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -4,
                left: 2,
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: '#C0C0A0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 4,
                left: -2,
                width: 3,
                height: 3,
                borderRadius: '50%',
                backgroundColor: '#C0C0A0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: 6,
                width: 2,
                height: 2,
                borderRadius: '50%',
                backgroundColor: '#C0C0A0',
              }}
            />
          </div>

          {/* Sun rays (visible in light mode) */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: isDarkMode ? 0 : 1,
              transition: `opacity 0.4s ease`,
              animation: isDarkMode ? 'none' : 'sunRotate 10s linear infinite',
            }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <div
                key={angle}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 2,
                  height: 6,
                  backgroundColor: '#FFA500',
                  borderRadius: 1,
                  transformOrigin: 'center center',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${config.height / 2 + 2}px)`,
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes sunRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    </div>
  );
};

export default DarkModeToggle;
