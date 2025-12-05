import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UserPlus, CheckCircle, Copy } from 'lucide-react';

const AdminPage = () => {
  const [apprenticeName, setApprenticeName] = useState('');
  const [apprenticeEmail, setApprenticeEmail] = useState('');
  const [professorEmail, setProfessorEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [dashboardLink, setDashboardLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Always start at Phase 1
  const currentPhase = 'Phase 1';

  const createApprentice = async () => {
    if (!apprenticeName.trim() || !apprenticeEmail.trim() || !professorEmail.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      const dashboardToken = uuidv4();
      const apprenticeId = uuidv4();

      // Create apprentice in Airtable - force emails to lowercase for consistency
      const response = await fetch(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Apprentices`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              apprenticeId,
              name: apprenticeName.trim(),
              email: apprenticeEmail.trim().toLowerCase(),
              professorEmail: professorEmail.trim().toLowerCase(),
              dateStarted: new Date().toISOString(),
              currentPhase,
              dashboardToken
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Airtable error:', errorText);
        throw new Error('Failed to create apprentice');
      }

      // Generate dashboard link
      const link = `${window.location.origin}/dashboard/${dashboardToken}`;
      setDashboardLink(link);

      // Reset form
      setApprenticeName('');
      setApprenticeEmail('');
      setProfessorEmail('');
    } catch (error) {
      console.error('Creation error:', error);
      alert(`Failed to create apprentice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dashboardLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setDashboardLink('');
    setCopied(false);
  };

  // Shared input style to keep fields white in dark mode
  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '16px',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontFamily: 'Lato, sans-serif',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    color: '#1F2937',
    boxSizing: 'border-box' as const
  };

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
      padding: '3rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
          borderRadius: '24px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={32} color="white" />
            </div>
            <div>
              <h1 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '28px',
                fontWeight: 700,
                margin: '0 0 0.25rem 0'
              }}>
                Professor Admin
              </h1>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                Create new apprentice training dashboard
              </p>
            </div>
          </div>
        </div>

        {!dashboardLink ? (
          /* Creation Form */
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              color: '#004A69',
              margin: '0 0 2rem 0'
            }}>
              Apprentice Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#004A69',
                  marginBottom: '0.5rem'
                }}>
                  Apprentice Name *
                </label>
                <input
                  type="text"
                  value={apprenticeName}
                  onChange={(e) => setApprenticeName(e.target.value)}
                  placeholder="John Doe"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#004A69',
                  marginBottom: '0.5rem'
                }}>
                  Apprentice Email *
                </label>
                <input
                  type="email"
                  value={apprenticeEmail}
                  onChange={(e) => setApprenticeEmail(e.target.value)}
                  placeholder="apprentice@example.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#004A69',
                  marginBottom: '0.5rem'
                }}>
                  Professor Email *
                </label>
                <input
                  type="email"
                  value={professorEmail}
                  onChange={(e) => setProfessorEmail(e.target.value)}
                  placeholder="professor@oclef.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              onClick={createApprentice}
              disabled={creating}
              style={{
                width: '100%',
                marginTop: '2rem',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'white',
                background: creating 
                  ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                  : 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
                border: 'none',
                borderRadius: '14px',
                padding: '1.25rem',
                cursor: creating ? 'not-allowed' : 'pointer',
                boxShadow: creating ? 'none' : '0 8px 32px rgba(235,106,24,0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {creating ? 'Creating Apprentice...' : 'Create Apprentice & Generate Dashboard'}
            </button>
          </div>
        ) : (
          /* Success State */
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00952E 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 32px rgba(0,149,46,0.3)'
            }}>
              <CheckCircle size={48} color="white" />
            </div>

            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '28px',
              fontWeight: 700,
              color: '#00952E',
              margin: '0 0 1rem 0'
            }}>
              Apprentice Created Successfully!
            </h2>

            <p style={{
              color: '#6B7280',
              fontSize: '16px',
              marginBottom: '2rem'
            }}>
              Share this dashboard link with your apprentice:
            </p>

            <div style={{
              background: '#F9FAFB',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#1F2937'
            }}>
              {dashboardLink}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={copyToClipboard}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  background: copied 
                    ? 'linear-gradient(135deg, #00952E 0%, #10B981 100%)'
                    : 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,102,162,0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Copy size={20} />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <button
                onClick={resetForm}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#6B7280',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;