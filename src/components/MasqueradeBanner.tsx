import { Eye, Shield } from 'lucide-react';

const MasqueradeBanner = () => {
  const isMasquerading = sessionStorage.getItem('adminMasqueradeActive') === 'true';
  const masqueradeName = sessionStorage.getItem('masqueradeName') || '';
  const masqueradeEmail = sessionStorage.getItem('masqueradeEmail') || '';
  const masqueradeType = sessionStorage.getItem('masqueradeType') || '';

  const handleEndMasquerade = () => {
    // Clear masquerade session data
    sessionStorage.removeItem('adminMasqueradeActive');
    sessionStorage.removeItem('adminOriginalEmail');
    sessionStorage.removeItem('masqueradeEmail');
    sessionStorage.removeItem('masqueradeName');
    sessionStorage.removeItem('masqueradeType');
    sessionStorage.removeItem('masqueradeDashboardToken');
    // Close the tab or navigate back to admin
    window.close();
    // If window.close() doesn't work (not opened by script), redirect
    setTimeout(() => {
      window.location.href = '/admin';
    }, 100);
  };

  if (!isMasquerading) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Eye size={18} color="white" />
        </div>
        <div>
          <span style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            marginRight: '0.5rem'
          }}>
            Viewing as {masqueradeType}:
          </span>
          <span style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: 700
          }}>
            {masqueradeName}
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            marginLeft: '0.5rem'
          }}>
            ({masqueradeEmail})
          </span>
        </div>
      </div>

      <button
        onClick={handleEndMasquerade}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
        }}
      >
        <Shield size={14} />
        Return to Admin
      </button>
    </div>
  );
};

export default MasqueradeBanner;
