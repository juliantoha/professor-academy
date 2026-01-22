import React, { useEffect, useState } from 'react';
import { colors, shadows, borderRadius, transitions, fonts } from '../styles/oclefDesignSystem';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const iconPaths: Record<ToastType, string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: colors.successGreenBg,
    border: colors.successGreen,
    icon: colors.successGreen,
    text: colors.successGreen,
  },
  error: {
    bg: colors.alertRedBg,
    border: colors.alertRed,
    icon: colors.alertRed,
    text: colors.alertRed,
  },
  warning: {
    bg: colors.warningAmberBg,
    border: colors.warningAmber,
    icon: colors.warningAmber,
    text: '#92400E', // Darker amber for text readability
  },
  info: {
    bg: colors.oclefBlueLight,
    border: colors.oclefBlue,
    icon: colors.oclefBlue,
    text: colors.oclefBlue,
  },
};

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const styles = typeStyles[type];

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px 20px',
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: borderRadius.md,
        boxShadow: shadows.large,
        minWidth: '320px',
        maxWidth: '480px',
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease`,
        fontFamily: fonts.body,
      }}
    >
      {/* Icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={styles.icon}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: '1px' }}
      >
        <path d={iconPaths[type]} />
      </svg>

      {/* Message */}
      <p
        style={{
          flex: 1,
          margin: 0,
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: 1.5,
          color: styles.text,
          whiteSpace: 'pre-wrap',
        }}
      >
        {message}
      </p>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          borderRadius: borderRadius.sm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: transitions.fast,
          opacity: 0.6,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
        aria-label="Close notification"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={styles.text}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
