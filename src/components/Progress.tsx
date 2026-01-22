import React, { useState, useEffect } from 'react';
import { colors, borderRadius, transitions, fonts } from '../styles/oclefDesignSystem';

// ============================================
// CIRCULAR PROGRESS RING
// ============================================

export interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  animated?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = colors.oclefBlue,
  backgroundColor = colors.borderLight,
  showValue = true,
  label,
  animated = true,
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    const startValue = displayValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  // Determine color based on value ranges
  const getValueColor = () => {
    if (value >= 80) return colors.successGreen;
    if (value >= 50) return colors.warningAmber;
    return color;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getValueColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: animated ? 'none' : `stroke-dashoffset 0.5s ease`,
          }}
        />
      </svg>

      {/* Center Content */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showValue && (
          <span
            style={{
              fontSize: size * 0.25,
              fontWeight: 700,
              color: colors.tangaroa,
              fontFamily: fonts.heading,
              lineHeight: 1,
            }}
          >
            {Math.round(displayValue)}%
          </span>
        )}
        {label && (
          <span
            style={{
              fontSize: size * 0.1,
              fontWeight: 500,
              color: colors.textSecondary,
              fontFamily: fonts.body,
              marginTop: 4,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// ANIMATED PROGRESS BAR
// ============================================

export interface ProgressBarProps {
  value: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  variant?: 'default' | 'gradient' | 'segmented';
  segments?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 12,
  color = colors.oclefBlue,
  backgroundColor = colors.borderLight,
  showValue = true,
  label,
  animated = true,
  striped = false,
  variant = 'default',
  segments = 10,
}) => {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const duration = 800;
    const startTime = performance.now();
    const startValue = displayValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated]);

  const getBackgroundStyle = (): React.CSSProperties => {
    if (variant === 'gradient') {
      return {
        background: `linear-gradient(90deg, ${colors.successGreen} 0%, ${colors.warningAmber} 50%, ${colors.alertRed} 100%)`,
        clipPath: `inset(0 ${100 - displayValue}% 0 0)`,
      };
    }
    return {
      backgroundColor: color,
      width: `${displayValue}%`,
    };
  };

  if (variant === 'segmented') {
    const filledSegments = Math.round((displayValue / 100) * segments);

    return (
      <div>
        {label && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: colors.tangaroa,
                fontFamily: fonts.body,
              }}
            >
              {label}
            </span>
            {showValue && (
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.oclefBlue,
                  fontFamily: fonts.body,
                }}
              >
                {Math.round(displayValue)}%
              </span>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height,
                borderRadius: borderRadius.sm,
                backgroundColor: i < filledSegments ? color : backgroundColor,
                transition: `all ${transitions.smooth}`,
                transitionDelay: animated ? `${i * 30}ms` : '0ms',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: colors.tangaroa,
              fontFamily: fonts.body,
            }}
          >
            {label}
          </span>
          {showValue && (
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.oclefBlue,
                fontFamily: fonts.body,
              }}
            >
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          height,
          backgroundColor,
          borderRadius: borderRadius.full,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: borderRadius.full,
            transition: animated ? 'none' : `width ${transitions.smooth}`,
            position: variant === 'gradient' ? 'absolute' : 'relative',
            left: 0,
            top: 0,
            right: 0,
            ...getBackgroundStyle(),
          }}
        >
          {striped && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.15) 10px,
                  rgba(255,255,255,0.15) 20px
                )`,
                animation: 'progress-stripes 1s linear infinite',
              }}
            />
          )}
        </div>
      </div>
      <style>{`
        @keyframes progress-stripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
};

// ============================================
// STEP INDICATOR
// ============================================

export interface Step {
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface StepIndicatorProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  orientation = 'horizontal',
  size = 'medium',
}) => {
  const sizeConfig = {
    small: { circle: 24, fontSize: 12, gap: 8 },
    medium: { circle: 32, fontSize: 14, gap: 12 },
    large: { circle: 40, fontSize: 16, gap: 16 },
  };

  const config = sizeConfig[size];

  const getStepStyles = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return {
          background: colors.successGreen,
          border: 'none',
          color: colors.white,
        };
      case 'current':
        return {
          background: colors.oclefBlue,
          border: 'none',
          color: colors.white,
          boxShadow: `0 0 0 4px ${colors.oclefBlue}30`,
        };
      default:
        return {
          background: colors.white,
          border: `2px solid ${colors.borderMedium}`,
          color: colors.textSecondary,
        };
    }
  };

  const getLineColor = (index: number) => {
    if (steps[index].status === 'completed') return colors.successGreen;
    if (steps[index + 1]?.status === 'current') return colors.oclefBlue;
    return colors.borderMedium;
  };

  if (orientation === 'vertical') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((step, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: config.gap,
            }}
          >
            {/* Circle and Line */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: config.circle,
                  height: config.circle,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: config.fontSize - 2,
                  fontFamily: fonts.body,
                  transition: `all ${transitions.smooth}`,
                  ...getStepStyles(step.status),
                }}
              >
                {step.status === 'completed' ? (
                  <svg
                    width={config.circle * 0.5}
                    height={config.circle * 0.5}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: 2,
                    height: 40,
                    backgroundColor: getLineColor(index),
                    transition: `background-color ${transitions.smooth}`,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingTop: 4 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: config.fontSize,
                  fontWeight: step.status === 'current' ? 600 : 500,
                  color: step.status === 'upcoming' ? colors.textSecondary : colors.tangaroa,
                  fontFamily: fonts.body,
                }}
              >
                {step.label}
              </p>
              {step.description && (
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: config.fontSize - 2,
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                  }}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {steps.map((step, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Circle */}
          <div
            style={{
              width: config.circle,
              height: config.circle,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: config.fontSize - 2,
              fontFamily: fonts.body,
              zIndex: 1,
              transition: `all ${transitions.smooth}`,
              ...getStepStyles(step.status),
            }}
          >
            {step.status === 'completed' ? (
              <svg
                width={config.circle * 0.5}
                height={config.circle * 0.5}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              index + 1
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              style={{
                position: 'absolute',
                top: config.circle / 2 - 1,
                left: '50%',
                right: '-50%',
                height: 2,
                backgroundColor: getLineColor(index),
                transition: `background-color ${transitions.smooth}`,
              }}
            />
          )}

          {/* Label */}
          <p
            style={{
              margin: `${config.gap}px 0 0 0`,
              fontSize: config.fontSize,
              fontWeight: step.status === 'current' ? 600 : 500,
              color: step.status === 'upcoming' ? colors.textSecondary : colors.tangaroa,
              fontFamily: fonts.body,
              textAlign: 'center',
            }}
          >
            {step.label}
          </p>
          {step.description && (
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: config.fontSize - 2,
                color: colors.textSecondary,
                fontFamily: fonts.body,
                textAlign: 'center',
              }}
            >
              {step.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default { CircularProgress, ProgressBar, StepIndicator };
