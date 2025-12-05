import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Home, CheckCircle } from 'lucide-react';

interface ModuleLayoutProps {
  currentModule: number;
  totalModules: number;
  moduleTitle: string;
  moduleSubtitle: string;
  children: ReactNode;
  onNavigateHome: () => void;
  onNavigateNext: () => void;
  canProceed: boolean;
  completedModules: number[];
}

const ModuleLayout = ({
  currentModule,
  totalModules,
  moduleTitle,
  moduleSubtitle,
  children,
  onNavigateHome,
  onNavigateNext,
  canProceed,
  completedModules
}: ModuleLayoutProps) => {
  const progressPercentage = (currentModule / totalModules) * 100;

  const getModuleColor = (moduleNum: number) => {
    const colors = ['#004A69', '#eb6a18', '#0066A2', '#F6AE00'];
    return colors[moduleNum - 1] || '#004A69';
  };

  const currentColor = getModuleColor(currentModule);

  return (
    <div style={{
      fontFamily: 'Lato, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)'
    }}>
      {/* Top Navigation Bar */}
      <header style={{
        background: 'linear-gradient(135deg, #003250 0%, #004A69 50%, #0066A2 100%)',
        padding: '1.5rem 3rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onNavigateHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              color: 'white',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
          >
            <Home size={18} />
            Back to Home
          </button>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Module {currentModule} of {totalModules}
              </span>
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: 'white'
              }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #eb6a18 0%, #ff8c3d 50%, #F6AE00 100%)',
                borderRadius: '50px',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 10px rgba(235,106,24,0.5)'
              }} />
            </div>
          </div>

          {/* Module Pills */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: completedModules.includes(num)
                    ? 'linear-gradient(135deg, #00952E 0%, #10B981 100%)'
                    : num === currentModule
                    ? `linear-gradient(135deg, ${getModuleColor(num)} 0%, ${getModuleColor(num)}dd 100%)`
                    : 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '16px',
                  border: num === currentModule ? '2px solid white' : 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: num === currentModule ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                {completedModules.includes(num) ? (
                  <CheckCircle size={20} />
                ) : (
                  num
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Module Header */}
      <div style={{
        background: 'white',
        padding: '3rem 3rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(0,74,105,0.08)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${currentColor}15 0%, ${currentColor}25 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: currentColor
            }}>
              {currentModule}
            </div>
            <div>
              <h1 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#004A69',
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.5px'
              }}>
                {moduleTitle}
              </h1>
              <p style={{
                fontSize: '17px',
                color: '#6B7280',
                margin: 0
              }}>
                {moduleSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 3rem 5rem'
      }}>
        {children}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4rem',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <button
            onClick={onNavigateHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              color: '#6B7280',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E5E7EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>

          <button
            onClick={onNavigateNext}
            disabled={!canProceed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: canProceed
                ? `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}dd 100%)`
                : 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              color: 'white',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              cursor: canProceed ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: canProceed ? 1 : 0.6,
              boxShadow: canProceed ? `0 4px 12px ${currentColor}40` : 'none'
            }}
            onMouseEnter={(e) => {
              if (canProceed) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${currentColor}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (canProceed) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${currentColor}40`;
              }
            }}
          >
            {currentModule < totalModules ? 'Continue to Next Module' : 'Complete Training'}
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default ModuleLayout;