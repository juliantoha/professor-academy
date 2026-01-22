import { useState, useEffect, useCallback, useRef, InputHTMLAttributes, forwardRef } from 'react';
import { Check, AlertCircle, Eye, EyeOff, Info, X } from 'lucide-react';

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string; feedback: string[] } => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  if (score <= 2) return { score, label: 'Weak', color: '#EF4444', feedback };
  if (score <= 4) return { score, label: 'Medium', color: '#F59E0B', feedback };
  return { score, label: 'Strong', color: '#10B981', feedback };
};

// Email validation
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Auto-format phone number
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length >= 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length >= 4) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else if (digits.length > 0) {
    return `(${digits}`;
  }
  return '';
};

interface PremiumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  showCharCount?: boolean;
  maxChars?: number;
  validateOnBlur?: boolean;
  validator?: (value: string) => string | null;
  autoFormat?: 'phone' | 'email' | 'none';
  showPasswordStrength?: boolean;
  isDarkMode?: boolean;
  onChange?: (value: string) => void;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(({
  label,
  hint,
  error: externalError,
  success,
  showCharCount,
  maxChars,
  validateOnBlur,
  validator,
  autoFormat = 'none',
  showPasswordStrength,
  isDarkMode = false,
  type = 'text',
  value: externalValue,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = externalValue !== undefined ? String(externalValue) : internalValue;
  const error = externalError || (touched ? validationError : null);
  const isPassword = type === 'password';
  const passwordStrength = showPasswordStrength && isPassword ? calculatePasswordStrength(value) : null;

  const isValid = !error && touched && value.length > 0;

  // Handle value change with optional auto-formatting
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (autoFormat === 'phone') {
      newValue = formatPhoneNumber(newValue);
    }

    if (maxChars && newValue.length > maxChars) {
      newValue = newValue.slice(0, maxChars);
    }

    if (externalValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  }, [autoFormat, maxChars, externalValue, onChange]);

  // Validate on blur if enabled
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setTouched(true);
    setShowHint(false);

    if (validateOnBlur || validator) {
      let error = null;

      if (validator) {
        error = validator(value);
      } else if (autoFormat === 'email' && value && !validateEmail(value)) {
        error = 'Please enter a valid email address';
      }

      setValidationError(error);
    }

    onBlur?.(e);
  }, [value, validateOnBlur, validator, autoFormat, onBlur]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (hint) setShowHint(true);
    onFocus?.(e);
  }, [hint, onFocus]);

  // Character count
  const charCount = value.length;
  const charCountWarning = maxChars && charCount > maxChars * 0.9;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Label */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '14px',
        fontWeight: 600,
        color: isDarkMode ? '#E2E8F0' : '#374151',
        marginBottom: '0.5rem'
      }}>
        {label}
        {props.required && <span style={{ color: '#EF4444' }}>*</span>}
        {hint && (
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Info size={14} color={isDarkMode ? '#64748B' : '#94A3B8'} />
          </button>
        )}
      </label>

      {/* Contextual Hint */}
      {showHint && hint && (
        <div style={{
          padding: '0.75rem',
          background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
          borderRadius: '8px',
          marginBottom: '0.5rem',
          fontSize: '13px',
          color: isDarkMode ? '#93C5FD' : '#1E40AF',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          animation: 'slideDown 0.2s ease'
        }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          {hint}
        </div>
      )}

      {/* Input wrapper */}
      <div style={{ position: 'relative' }}>
        <input
          ref={ref || inputRef}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            paddingRight: (isPassword || isValid || error) ? '2.75rem' : '1rem',
            fontSize: '15px',
            borderRadius: '12px',
            border: `2px solid ${
              error ? '#EF4444' :
              isValid ? '#10B981' :
              isFocused ? '#F97316' :
              isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
            }`,
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
            color: isDarkMode ? '#F1F5F9' : '#1E293B',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: isFocused ? `0 0 0 4px ${
              error ? 'rgba(239, 68, 68, 0.1)' :
              isValid ? 'rgba(16, 185, 129, 0.1)' :
              'rgba(249, 115, 22, 0.1)'
            }` : 'none',
            ...(error && { animation: 'shake 0.4s ease' })
          }}
        />

        {/* Status icons */}
        <div style={{
          position: 'absolute',
          right: '0.875rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {isPassword && (
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
                color: isDarkMode ? '#64748B' : '#94A3B8'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {!isPassword && isValid && (
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'popIn 0.3s ease'
            }}>
              <Check size={12} color="white" strokeWidth={3} />
            </div>
          )}
          {!isPassword && error && (
            <AlertCircle size={20} color="#EF4444" style={{ animation: 'popIn 0.3s ease' }} />
          )}
        </div>
      </div>

      {/* Password strength meter */}
      {passwordStrength && value.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '0.25rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: i <= passwordStrength.score
                    ? passwordStrength.color
                    : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <span style={{ color: passwordStrength.color, fontWeight: 600 }}>
              {passwordStrength.label}
            </span>
            {passwordStrength.feedback.length > 0 && (
              <span style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}>
                {passwordStrength.feedback[0]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Character count */}
      {showCharCount && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.25rem',
          fontSize: '12px',
          color: charCountWarning
            ? '#F59E0B'
            : (isDarkMode ? '#64748B' : '#94A3B8')
        }}>
          {charCount}{maxChars ? ` / ${maxChars}` : ''}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          marginTop: '0.5rem',
          fontSize: '13px',
          color: '#EF4444',
          animation: 'slideDown 0.2s ease'
        }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Success message */}
      {success && isValid && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          marginTop: '0.5rem',
          fontSize: '13px',
          color: '#10B981',
          animation: 'slideDown 0.2s ease'
        }}>
          <Check size={14} />
          {success}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes popIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
});

PremiumInput.displayName = 'PremiumInput';

// Multi-step form wizard
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: boolean;
}

interface FormWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  isDarkMode?: boolean;
}

export const FormWizard = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  isDarkMode = false
}: FormWizardProps) => {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  return (
    <div>
      {/* Progress indicator */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isDarkMode ? '#94A3B8' : '#64748B'
          }}>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span style={{
            fontSize: '13px',
            color: '#F97316',
            fontWeight: 600
          }}>
            {Math.round(progress)}% complete
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '6px',
          background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
            borderRadius: '3px',
            transition: 'width 0.5s ease'
          }} />
        </div>

        {/* Step indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1rem'
        }}>
          {steps.map((step, idx) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: idx < currentStep ? 'pointer' : 'default',
                opacity: idx <= currentStep ? 1 : 0.5
              }}
              onClick={() => idx < currentStep && onStepChange(idx)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: idx < currentStep
                  ? '#10B981'
                  : idx === currentStep
                    ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: idx <= currentStep ? 'white' : (isDarkMode ? '#64748B' : '#94A3B8'),
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}>
                {idx < currentStep ? <Check size={16} /> : idx + 1}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 500,
                color: idx === currentStep
                  ? '#F97316'
                  : (isDarkMode ? '#64748B' : '#94A3B8'),
                textAlign: 'center',
                maxWidth: '80px'
              }}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{
        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '1.5rem',
        boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: isDarkMode ? '#F1F5F9' : '#1E293B',
          marginBottom: '0.5rem'
        }}>
          {currentStepData.title}
        </h3>
        {currentStepData.description && (
          <p style={{
            fontSize: '14px',
            color: isDarkMode ? '#94A3B8' : '#64748B',
            marginBottom: '1.5rem'
          }}>
            {currentStepData.description}
          </p>
        )}
        {currentStepData.content}
      </div>

      {/* Navigation buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0}
          style={{
            padding: '0.875rem 1.5rem',
            borderRadius: '10px',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E2E8F0',
            background: 'transparent',
            color: isDarkMode ? '#E2E8F0' : '#374151',
            fontSize: '14px',
            fontWeight: 600,
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          Back
        </button>

        <button
          onClick={() => isLastStep ? onComplete?.() : onStepChange(currentStep + 1)}
          disabled={currentStepData.isValid === false}
          style={{
            padding: '0.875rem 2rem',
            borderRadius: '10px',
            border: 'none',
            background: currentStepData.isValid === false
              ? (isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0')
              : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            color: currentStepData.isValid === false
              ? (isDarkMode ? '#64748B' : '#94A3B8')
              : 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: currentStepData.isValid === false ? 'not-allowed' : 'pointer',
            boxShadow: currentStepData.isValid !== false ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {isLastStep ? 'Complete' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default PremiumInput;
