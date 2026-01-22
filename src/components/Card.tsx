import React, { useState, ReactNode } from 'react';
import { colors, shadows, borderRadius, transitions, fonts } from '../styles/oclefDesignSystem';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
export type CardStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  status?: CardStatus;
  onClick?: () => void;
  isClickable?: boolean;
  isSelected?: boolean;
  noPadding?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  accentColor?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  status = 'default',
  onClick,
  isClickable = false,
  isSelected = false,
  noPadding = false,
  header,
  footer,
  accentColor,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return { accent: colors.successGreen, bg: colors.successGreenBg };
      case 'warning':
        return { accent: colors.warningAmber, bg: colors.warningAmberBg };
      case 'error':
        return { accent: colors.alertRed, bg: colors.alertRedBg };
      case 'info':
        return { accent: colors.oclefBlue, bg: colors.oclefBlueLight };
      default:
        return { accent: accentColor || colors.borderLight, bg: colors.oclefWhite };
    }
  };

  const statusColors = getStatusColors();

  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: colors.oclefWhite,
      border: `1px solid ${colors.borderLight}`,
      boxShadow: shadows.subtle,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: isHovered ? shadows.large : shadows.medium,
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${isHovered ? colors.oclefBlue : colors.borderMedium}`,
          boxShadow: 'none',
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: isHovered ? shadows.large : shadows.medium,
        };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${colors.oclefWhite} 0%, ${colors.oclefBlueLight} 100%)`,
          border: `1px solid ${colors.borderLight}`,
          boxShadow: isHovered ? shadows.large : shadows.subtle,
        };
      default:
        return {
          ...baseStyles,
          boxShadow: isHovered ? shadows.medium : shadows.subtle,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        };
    }
  };

  const getSelectedStyles = (): React.CSSProperties => {
    if (!isSelected) return {};
    return {
      borderColor: colors.oclefBlue,
      boxShadow: `0 0 0 3px ${colors.oclefBlue}20, ${shadows.medium}`,
    };
  };

  const getStatusBorder = (): React.CSSProperties => {
    if (status === 'default') return {};
    return {
      borderLeftWidth: '4px',
      borderLeftColor: statusColors.accent,
    };
  };

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? onClick : undefined}
      style={{
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        transition: `all ${transitions.smooth}`,
        cursor: isClickable ? 'pointer' : 'default',
        fontFamily: fonts.body,
        ...getVariantStyles(),
        ...getSelectedStyles(),
        ...getStatusBorder(),
      }}
    >
      {/* Accent Bar (optional) */}
      {accentColor && !status && (
        <div
          style={{
            height: '4px',
            background: accentColor,
            transition: `opacity ${transitions.fast}`,
            opacity: isHovered ? 1 : 0.7,
          }}
        />
      )}

      {/* Header */}
      {header && (
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.borderLight}`,
            backgroundColor: status !== 'default' ? `${statusColors.bg}` : '#FAFAFA',
          }}
        >
          {header}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: noPadding ? 0 : '20px' }}>{children}</div>

      {/* Footer */}
      {footer && (
        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${colors.borderLight}`,
            backgroundColor: '#FAFAFA',
          }}
        >
          {footer}
        </div>
      )}

      {/* Hover Glow Effect for clickable cards */}
      {isClickable && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: borderRadius.lg,
            background: `radial-gradient(circle at center, ${colors.oclefBlue}05 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${transitions.smooth}`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

// Stat Card - A specialized card for displaying statistics
export interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  accentColor = colors.oclefBlue,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getChangeColor = () => {
    if (!change) return colors.textSecondary;
    switch (change.type) {
      case 'increase':
        return colors.successGreen;
      case 'decrease':
        return colors.alertRed;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: colors.oclefWhite,
        borderRadius: borderRadius.lg,
        padding: '20px 24px',
        border: `1px solid ${colors.borderLight}`,
        boxShadow: isHovered ? shadows.medium : shadows.subtle,
        transform: isHovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: `all ${transitions.smooth}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accentColor,
          opacity: isHovered ? 1 : 0.6,
          transition: `opacity ${transitions.fast}`,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.textSecondary,
              fontFamily: fonts.body,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 700,
              color: colors.tangaroa,
              fontFamily: fonts.heading,
              lineHeight: 1.2,
            }}
          >
            {value}
          </p>
          {change && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '8px',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={getChangeColor()}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: change.type === 'decrease' ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: getChangeColor(),
                }}
              >
                {change.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: borderRadius.md,
              backgroundColor: `${accentColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              transition: `all ${transitions.fast}`,
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
