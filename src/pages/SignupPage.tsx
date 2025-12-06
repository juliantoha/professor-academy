import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, CheckCircle } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Automatically assign role based on email domain
      const role = email.toLowerCase().endsWith('@oclef.com') ? 'professor' : 'apprentice';

      const { error } = await signUp(email, password, name, role);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        fontFamily: 'Lato, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #00952E 0%, #10B981 100%)',
              padding: '3rem 2.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <CheckCircle size={48} color="white" />
              </div>
              <h1 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '28px',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 0.5rem 0'
              }}>
                Check Your Email
              </h1>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)',
                margin: 0
              }}>
                We've sent a confirmation link to
              </p>
              <p style={{
                fontSize: '18px',
                color: 'white',
                fontWeight: 600,
                margin: '0.5rem 0 0 0'
              }}>
                {email}
              </p>
            </div>

            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <p style={{
                color: '#4B5563',
                fontSize: '15px',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                Click the link in your email to verify your account, then you can sign in to access Professor Academy.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  width: '100%',
                  padding: '1.1rem',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(235,106,24,0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(235,106,24,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(235,106,24,0.4)';
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px'
      }}>
        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
            padding: '2.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
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
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <UserPlus size={36} color="white" />
            </div>

            <h1 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '32px',
              fontWeight: 700,
              color: 'white',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-1px',
              position: 'relative'
            }}>
              Create Account
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.8)',
              margin: 0,
              position: 'relative'
            }}>
              Join Professor Academy today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '2rem 2.5rem' }}>
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                border: '2px solid #DC2626',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem'
              }}>
                <span style={{ color: '#991B1B', fontSize: '14px', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#004A69',
                marginBottom: '0.75rem'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} color="#6B7280" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    fontSize: '15px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0066A2';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#004A69',
                marginBottom: '0.75rem'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="#6B7280" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    fontSize: '15px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0066A2';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#004A69',
                marginBottom: '0.75rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#6B7280" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    fontSize: '15px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0066A2';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#004A69',
                marginBottom: '0.75rem'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#6B7280" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    fontSize: '15px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0066A2';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0,102,162,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                width: '100%',
                padding: '1.1rem',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                background: loading
                  ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                  : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(235,106,24,0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(235,106,24,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 24px rgba(235,106,24,0.4)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Sign Up
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
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#0066A2',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Sign in
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
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
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
      `}</style>
    </div>
  );
};

export default SignupPage;
