import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { SmartInput } from '../components';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Redirect after successful login based on role
  useEffect(() => {
    if (user && !loading) {
      const userRole = profile?.role || user.user_metadata?.role;

      // If there's a specific page they were trying to access, go there
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Otherwise redirect based on role
      if (userRole === 'professor' || userRole === 'admin') {
        navigate('/professor', { replace: true });
      } else if (userRole === 'apprentice') {
        navigate('/apprentice', { replace: true });
      }
    }
  }, [user, profile, loading, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
      // Navigation is handled by useEffect based on role
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation (minimum 6 characters)
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'rgba(235, 106, 24, 0.08)',
        animation: 'float-login 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(0, 102, 162, 0.06)',
        animation: 'float-login 8s ease-in-out infinite 2s'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '8%',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.08)',
        animation: 'float-login 8s ease-in-out infinite 1s'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,74,105,0.08)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />

            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              animation: 'pulse-icon 3s ease-in-out infinite'
            }}>
              <LogIn size={40} color="white" strokeWidth={1.5} />
            </div>

            <h1 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: 'white',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-1px',
              position: 'relative'
            }}>
              Welcome Back
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.8)',
              margin: 0,
              position: 'relative'
            }}>
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '2.5rem' }}>
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                border: '2px solid #EF4444',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                animation: 'shake-error 0.4s ease-in-out'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertCircle size={18} color="white" />
                </div>
                <span style={{ color: '#991B1B', fontSize: '14px', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <SmartInput
              type="email"
              value={email}
              onChange={setEmail}
              label="Email Address"
              placeholder="you@example.com"
              icon={<Mail size={20} />}
              required
              validate={validateEmail}
              errorMessage="Please enter a valid email address"
              successMessage="Email looks good!"
              autoComplete="email"
            />

            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '-0.5rem'
              }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '13px',
                    color: '#0066A2',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                    e.currentTarget.style.color = '#004A69';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                    e.currentTarget.style.color = '#0066A2';
                  }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <SmartInput
              type="password"
              value={password}
              onChange={setPassword}
              label="Password"
              placeholder="Enter your password"
              icon={<Lock size={20} />}
              required
              validate={validatePassword}
              errorMessage="Password must be at least 6 characters"
              successMessage="Password is valid"
              showPasswordToggle
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "'Montserrat', sans-serif",
                width: '100%',
                padding: '1.1rem',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                background: loading
                  ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                  : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                border: 'none',
                borderRadius: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 30px rgba(235,106,24,0.35)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(235,106,24,0.45)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 30px rgba(235,106,24,0.35)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            padding: '0 2.5rem 2.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#6B7280',
              fontSize: '15px',
              margin: 0
            }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color: '#0066A2',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                  e.currentTarget.style.color = '#004A69';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                  e.currentTarget.style.color = '#0066A2';
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link
            to="/"
            style={{
              color: '#004A69',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,74,105,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-login {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
          50% { transform: scale(1.02); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
        }
        @keyframes shake-error {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
