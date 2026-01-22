import React, { useState, useId } from 'react';
import { colors, borderRadius, transitions, fonts, shadows } from '../styles/oclefDesignSystem';

export interface EnhancedInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  helperText?: string;
  showPasswordStrength?: boolean;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  success = false,
  helperText,
  showPasswordStrength = false,
  autoComplete,
  maxLength,
  pattern,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  // Password strength calculation
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak', color: colors.alertRed };
    if (score <= 2) return { score, label: 'Fair', color: colors.warningAmber };
    if (score <= 3) return { score, label: 'Good', color: colors.oclefBlue };
    return { score, label: 'Strong', color: colors.successGreen };
  };

  const passwordStrength = showPasswordStrength && type === 'password' ? getPasswordStrength(value) : null;

  // Determine border color
  const getBorderColor = () => {
    if (error) return colors.alertRed;
    if (success && hasValue) return colors.successGreen;
    if (isFocused) return colors.oclefBlue;
    return colors.borderMedium;
  };

  // Determine label color
  const getLabelColor = () => {
    if (error) return colors.alertRed;
    if (success && hasValue) return colors.successGreen;
    if (isFocused) return colors.oclefBlue;
    return colors.textSecondary;
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
      {/* Input Container */}
      <div style={{ position: 'relative' }}>
        {/* Floating Label */}
        <label
          htmlFor={inputId}
          style={{
            position: 'absolute',
            left: '16px',
            top: isFloating ? '-8px' : '50%',
            transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
            fontSize: isFloating ? '12px' : '16px',
            fontWeight: isFloating ? 600 : 400,
            color: getLabelColor(),
            backgroundColor: isFloating ? colors.white : 'transparent',
            padding: isFloating ? '0 8px' : '0',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            fontFamily: fonts.body,
            zIndex: 1,
          }}
        >
          {label}
          {required && (
            <span style={{ color: colors.alertRed, marginLeft: '2px' }}>*</span>
          )}
        </label>

        {/* Input Field */}
        <input
          id={inputId}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFloating ? placeholder : ''}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          style={{
            width: '100%',
            padding: '18px 16px',
            paddingRight: type === 'password' || error || success ? '48px' : '16px',
            fontSize: '16px',
            fontFamily: fonts.body,
            color: colors.tangaroa,
            backgroundColor: disabled ? '#F9FAFB' : colors.white,
            border: `2px solid ${getBorderColor()}`,
            borderRadius: borderRadius.md,
            outline: 'none',
            transition: `all ${transitions.smooth}`,
            boxShadow: isFocused ? `0 0 0 3px ${colors.oclefBlue}20` : 'none',
            cursor: disabled ? 'not-allowed' : 'text',
            boxSizing: 'border-box',
          }}
        />

        {/* Status/Password Toggle Icon */}
        <div
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Password toggle */}
          {type === 'password' && hasValue && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.6,
                transition: transitions.fast,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          )}

          {/* Success check */}
          {success && hasValue && !error && type !== 'password' && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.successGreen}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}

          {/* Error X */}
          {error && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.alertRed}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
        </div>
      </div>

      {/* Password Strength Indicator */}
      {passwordStrength && hasValue && (
        <div style={{ marginTop: '8px' }}>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '4px',
            }}
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: level <= passwordStrength.score ? passwordStrength.color : colors.borderLight,
                  transition: transitions.smooth,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: passwordStrength.color,
              fontFamily: fonts.body,
            }}
          >
            {passwordStrength.label}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p
          style={{
            marginTop: '6px',
            fontSize: '13px',
            color: colors.alertRed,
            fontFamily: fonts.body,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p
          style={{
            marginTop: '6px',
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default EnhancedInput;
