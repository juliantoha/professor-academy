import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OrientationSlideshow from './OrientationSlideshow';
import { Clock, XCircle } from 'lucide-react';

const OrientationWrapper = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apprenticeData, setApprenticeData] = useState<{
    name: string;
    email: string;
    professorEmail: string;
  } | null>(null);

  useEffect(() => {
    const email = searchParams.get('email');
    const professor = searchParams.get('professor');
    const name = searchParams.get('name');

    if (!email || !professor) {
      setError('Missing required parameters. Please access orientation from your dashboard.');
      setLoading(false);
      return;
    }

    setApprenticeData({
      name: name || 'Apprentice',
      email,
      professorEmail: professor
    });
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F0F9FF 0%, #DBEAFE 100%)',
        fontFamily: 'Lato, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Clock size={48} color="#0066A2" />
          <p style={{ marginTop: '1rem', fontSize: '18px', color: '#004A69' }}>
            Loading orientation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !apprenticeData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
        fontFamily: 'Lato, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <XCircle size={48} color="#DC2626" />
          <p style={{ marginTop: '1rem', fontSize: '18px', color: '#991B1B' }}>
            {error || 'Unable to load orientation'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #0066A2 0%, #004A69 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <OrientationSlideshow
      apprenticeName={apprenticeData.name}
      apprenticeEmail={apprenticeData.email}
      professorEmail={apprenticeData.professorEmail}
    />
  );
};

export default OrientationWrapper;