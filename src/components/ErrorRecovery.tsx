import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff, Server, Lock, Mail, HelpCircle, ChevronDown, ChevronUp, Check, X, ArrowRight } from 'lucide-react';

// Error types with contextual information
interface ErrorConfig {
  title: string;
  message: string;
  icon: React.ElementType;
  color: string;
  suggestions: string[];
  action?: {
    label: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
}

type ErrorType =
  | 'network'
  | 'auth'
  | 'email-exists'
  | 'invalid-credentials'
  | 'server'
  | 'validation'
  | 'permission'
  | 'not-found'
  | 'rate-limit'
  | 'generic';

const errorConfigs: Record<ErrorType, ErrorConfig> = {
  network: {
    title: 'Connection Lost',
    message: 'We\'re having trouble connecting to our servers.',
    icon: WifiOff,
    color: '#F59E0B',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Disable VPN if you\'re using one'
    ],
    action: { label: 'Try Again' }
  },
  auth: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again to continue.',
    icon: Lock,
    color: '#8B5CF6',
    suggestions: [
      'Your login session has timed out for security',
      'Simply sign in again to continue where you left off'
    ],
    action: { label: 'Sign In' }
  },
  'email-exists': {
    title: 'Email Already Registered',
    message: 'An account with this email already exists.',
    icon: Mail,
    color: '#3B82F6',
    suggestions: [
      'Did you mean to log in instead?',
      'Try resetting your password if you forgot it'
    ],
    action: { label: 'Go to Login' },
    secondaryAction: { label: 'Reset Password' }
  },
  'invalid-credentials': {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
    icon: Lock,
    color: '#EF4444',
    suggestions: [
      'Double-check your email address for typos',
      'Make sure Caps Lock is off',
      'Try resetting your password'
    ],
    action: { label: 'Try Again' },
    secondaryAction: { label: 'Reset Password' }
  },
  server: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Our team has been notified.',
    icon: Server,
    color: '#EF4444',
    suggestions: [
      'This is usually temporary',
      'Wait a moment and try again',
      'Contact support if the issue persists'
    ],
    action: { label: 'Try Again' }
  },
  validation: {
    title: 'Validation Error',
    message: 'Some fields contain invalid data.',
    icon: AlertCircle,
    color: '#F59E0B',
    suggestions: [
      'Check the highlighted fields',
      'Make sure all required fields are filled',
      'Ensure email addresses are properly formatted'
    ]
  },
  permission: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    icon: Lock,
    color: '#EF4444',
    suggestions: [
      'Make sure you\'re logged into the correct account',
      'Contact your administrator for access'
    ],
    action: { label: 'Go Back' }
  },
  'not-found': {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    icon: HelpCircle,
    color: '#64748B',
    suggestions: [
      'The link may be outdated',
      'The item may have been deleted',
      'Check the URL for typos'
    ],
    action: { label: 'Go Home' }
  },
  'rate-limit': {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a moment.',
    icon: AlertCircle,
    color: '#F59E0B',
    suggestions: [
      'Wait 30 seconds before trying again',
      'Avoid rapid clicking or refreshing'
    ]
  },
  generic: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred.',
    icon: AlertCircle,
    color: '#EF4444',
    suggestions: [
      'Try refreshing the page',
      'Clear your browser cache',
      'Contact support if the issue persists'
    ],
    action: { label: 'Try Again' }
  }
};

// Detect error type from error message
export const detectErrorType = (error: string | Error): ErrorType => {
  const message = typeof error === 'string' ? error.toLowerCase() : (error.message || '').toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  if (message.includes('already registered') || message.includes('already exists') || message.includes('email in use')) {
    return 'email-exists';
  }
  if (message.includes('invalid login') || message.includes('invalid credentials') || message.includes('wrong password')) {
    return 'invalid-credentials';
  }
  if (message.includes('session') || message.includes('expired') || message.includes('unauthorized')) {
    return 'auth';
  }
  if (message.includes('permission') || message.includes('forbidden') || message.includes('access denied')) {
    return 'permission';
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'not-found';
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'rate-limit';
  }
  if (message.includes('server') || message.includes('500') || message.includes('internal')) {
    return 'server';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }

  return 'generic';
};

// Main error card component
interface ErrorCardProps {
  error: string | Error;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  onNavigate?: (path: string) => void;
  isDarkMode?: boolean;
  compact?: boolean;
}

export const ErrorCard = ({
  error,
  type: forcedType,
  onRetry,
  onDismiss,
  onNavigate,
  isDarkMode = false,
  compact = false
}: ErrorCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const errorType = forcedType || detectErrorType(error);
  const config = errorConfigs[errorType];
  const Icon = config.icon;

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const handleAction = () => {
    if (errorType === 'auth' || errorType === 'email-exists' || errorType === 'invalid-credentials') {
      onNavigate?.('/login');
    } else if (errorType === 'not-found') {
      onNavigate?.('/');
    } else if (errorType === 'permission') {
      window.history.back();
    } else {
      handleRetry();
    }
  };

  const handleSecondaryAction = () => {
    if (errorType === 'email-exists' || errorType === 'invalid-credentials') {
      onNavigate?.('/forgot-password');
    }
  };

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: `${config.color}15`,
        border: `1px solid ${config.color}30`,
        borderRadius: '10px',
        animation: 'slideIn 0.3s ease'
      }}>
        <Icon size={18} color={config.color} />
        <span style={{
          flex: 1,
          fontSize: '13px',
          color: isDarkMode ? '#F1F5F9' : '#1E293B'
        }}>
          {config.message}
        </span>
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: 'none',
              background: config.color,
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {retrying ? (
              <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              'Retry'
            )}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: isDarkMode ? '#64748B' : '#94A3B8'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
      border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${config.color}30`,
      animation: 'slideUp 0.3s ease'
    }}>
      {/* Header with icon */}
      <div style={{
        padding: '1.5rem',
        background: `${config.color}10`,
        borderBottom: `1px solid ${config.color}20`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${config.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'shake 0.5s ease'
        }}>
          <Icon size={24} color={config.color} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: isDarkMode ? '#F1F5F9' : '#1E293B',
            margin: '0 0 0.25rem 0'
          }}>
            {config.title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: isDarkMode ? '#94A3B8' : '#64748B',
            margin: 0
          }}>
            {config.message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: isDarkMode ? '#64748B' : '#94A3B8',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : '#F1F5F9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Suggestions */}
      <div style={{ padding: '1.25rem' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isDarkMode ? '#94A3B8' : '#64748B'
          }}>
            {showDetails ? 'Hide' : 'Show'} suggestions
          </span>
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showDetails && (
          <ul style={{
            margin: '0 0 1rem 0',
            padding: '0 0 0 1.5rem',
            listStyle: 'none'
          }}>
            {config.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '13px',
                  color: isDarkMode ? '#94A3B8' : '#64748B',
                  animation: `fadeIn 0.3s ease ${idx * 0.1}s both`
                }}
              >
                <Check size={14} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {config.action && (
            <button
              onClick={handleAction}
              disabled={retrying}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: retrying ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: `0 4px 12px ${config.color}40`,
                transition: 'all 0.2s ease'
              }}
            >
              {retrying && errorType !== 'auth' && errorType !== 'email-exists' ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Retrying...
                </>
              ) : (
                <>
                  {config.action.label}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
          {config.secondaryAction && (
            <button
              onClick={handleSecondaryAction}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '0.875rem 1.5rem',
                borderRadius: '10px',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E2E8F0',
                background: 'transparent',
                color: isDarkMode ? '#E2E8F0' : '#374151',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {config.secondaryAction.label}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Inline field error with animation
interface FieldErrorProps {
  error: string;
  shake?: boolean;
}

export const FieldError = ({ error, shake = true }: FieldErrorProps) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      marginTop: '0.5rem',
      fontSize: '13px',
      color: '#EF4444',
      animation: shake ? 'shake 0.4s ease, fadeIn 0.2s ease' : 'fadeIn 0.2s ease'
    }}>
      <AlertCircle size={14} />
      {error}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Success celebration toast
interface SuccessToastProps {
  message: string;
  description?: string;
  onDismiss?: () => void;
  autoDismiss?: number;
}

export const SuccessToast = ({
  message,
  description,
  onDismiss,
  autoDismiss = 5000
}: SuccessToastProps) => {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
      animation: 'slideInRight 0.4s ease',
      maxWidth: '360px'
    }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'popIn 0.3s ease 0.2s both'
      }}>
        <Check size={16} color="white" strokeWidth={3} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'white',
          marginBottom: description ? '0.25rem' : 0
        }}>
          {message}
        </div>
        {description && (
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            {description}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: '6px'
          }}
        >
          <X size={16} />
        </button>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
};

// Network status indicator
export const NetworkStatus = ({ isDarkMode = false }: { isDarkMode?: boolean }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '0.75rem 1.25rem',
      borderRadius: '10px',
      background: isOnline ? '#10B981' : '#EF4444',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '14px',
      fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: 9999,
      animation: 'slideUp 0.3s ease'
    }}>
      {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
      {isOnline ? 'Back online' : 'No internet connection'}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorCard;
