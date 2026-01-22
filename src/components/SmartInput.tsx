import { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (score <= 2) return { score, label: 'Weak', color: '#EF4444' };
  if (score <= 4) return { score, label: 'Medium', color: '#F59E0B' };
  return { score, label: 'Strong', color: '#10B981' };
};

interface SmartInputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  validate?: (value: string) => boolean;
  errorMessage?: string;
  successMessage?: string;
  showPasswordToggle?: boolean;
  showPasswordStrength?: boolean;
  autoComplete?: string;
}

const SmartInput = ({
  type = 'text',
  value,
  onChange,
  label,
  placeholder = '',
  icon,
  required = false,
  validate,
  errorMessage = 'Invalid input',
  successMessage = 'Looks good!',
  showPasswordToggle = false,
  showPasswordStrength = false,
  autoComplete
}: SmartInputProps) => {
  const passwordStrength = showPasswordStrength && type === 'password' ? calculatePasswordStrength(value) : null;
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValid = validate ? validate(value) : value.length > 0;
  const showValidation = isTouched && !isFocused && value.length > 0;
  const showSuccess = showValidation && isValid;
  const showError = showValidation && !isValid && required;

  // Handle typing indicator
  useEffect(() => {
    if (value) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 500);
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [value]);

  const getBorderColor = () => {
    if (showError) return '#EF4444';
    if (showSuccess) return '#10B981';
    if (isFocused) return '#0066A2';
    return '#E5E7EB';
  };

  const getBoxShadow = () => {
    if (showError) return '0 0 0 4px rgba(239, 68, 68, 0.1)';
    if (showSuccess) return '0 0 0 4px rgba(16, 185, 129, 0.1)';
    if (isFocused) return '0 0 0 4px rgba(0, 102, 162, 0.1)';
    return 'none';
  };

  const actualType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Floating label container */}
      <div style={{ position: 'relative' }}>
        {/* Animated label */}
        <label
          onClick={() => inputRef.current?.focus()}
          style={{
            position: 'absolute',
            left: icon ? '3rem' : '1rem',
            top: isFocused || value ? '0' : '50%',
            transform: isFocused || value ? 'translateY(-50%) scale(0.85)' : 'translateY(-50%) scale(1)',
            transformOrigin: 'left center',
            fontSize: '14px',
            fontWeight: 600,
            color: showError
              ? '#EF4444'
              : showSuccess
                ? '#059669'
                : isFocused
                  ? '#0066A2'
                  : '#6B7280',
            background: isFocused || value ? 'white' : 'transparent',
            padding: isFocused || value ? '0 0.5rem' : '0',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          {label}
          {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>

        {/* Icon */}
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: showError
                ? '#EF4444'
                : showSuccess
                  ? '#10B981'
                  : isFocused
                    ? '#0066A2'
                    : '#9CA3AF',
              transition: 'color 0.2s ease',
              zIndex: 1
            }}
          >
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={actualType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isFocused ? placeholder : ''}
          autoComplete={autoComplete}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setIsTouched(true);
          }}
          style={{
            width: '100%',
            padding: `1rem ${showPasswordToggle || showValidation ? '3rem' : '1rem'} 1rem ${icon ? '3rem' : '1rem'}`,
            fontSize: '15px',
            fontWeight: 500,
            border: `2px solid ${getBorderColor()}`,
            borderRadius: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            color: '#1F2937',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: getBoxShadow()
          }}
        />

        {/* Validation indicator or password toggle */}
        <div
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {/* Typing indicator */}
          {isTyping && isFocused && (
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#0066A2',
              animation: 'pulse-typing 0.8s ease-in-out infinite'
            }} />
          )}

          {/* Validation icons */}
          {showSuccess && !showPasswordToggle && (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pop-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Check size={14} color="white" strokeWidth={3} />
            </div>
          )}

          {showError && !showPasswordToggle && (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'shake 0.4s ease-in-out'
              }}
            >
              <AlertCircle size={14} color="white" strokeWidth={3} />
            </div>
          )}

          {/* Password toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0066A2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B7280';
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Password strength meter */}
      {passwordStrength && value.length > 0 && (
        <div style={{ marginTop: '0.75rem', paddingLeft: icon ? '3rem' : '1rem', paddingRight: '1rem' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '0.375rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: i <= passwordStrength.score ? passwordStrength.color : '#E5E7EB',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: 600
          }}>
            <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
            <span style={{ color: '#9CA3AF' }}>
              {passwordStrength.score < 3 && 'Add uppercase, numbers, symbols'}
              {passwordStrength.score >= 3 && passwordStrength.score < 5 && 'Getting better!'}
              {passwordStrength.score >= 5 && 'Great password!'}
            </span>
          </div>
        </div>
      )}

      {/* Validation message */}
      {showValidation && !passwordStrength && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '12px',
            fontWeight: 500,
            color: showError ? '#EF4444' : '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            paddingLeft: icon ? '3rem' : '1rem',
            animation: 'slide-down 0.2s ease-out'
          }}
        >
          {showError ? (
            <>
              <AlertCircle size={12} />
              {errorMessage}
            </>
          ) : (
            <>
              <Check size={12} />
              {successMessage}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse-typing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SmartInput;
