import { useEffect, useState, useCallback } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OnboardingOverlay = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour, completeTour } = useOnboarding();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Find and measure target element
  const measureTarget = useCallback(() => {
    if (!currentStepData?.target) return;

    const element = document.querySelector(currentStepData.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      setTargetRect({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      });

      // Calculate tooltip position
      const tooltipWidth = 320;
      const tooltipHeight = 180;
      const gap = 16;

      let top = 0;
      let left = 0;

      switch (currentStepData.placement) {
        case 'bottom':
          top = rect.bottom + gap + window.scrollY;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'top':
          top = rect.top - tooltipHeight - gap + window.scrollY;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
          left = rect.left - tooltipWidth - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
          left = rect.right + gap;
          break;
      }

      // Keep tooltip in viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, top);

      setTooltipPosition({ top, left });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStepData]);

  useEffect(() => {
    if (isActive && currentStepData) {
      // Small delay to let DOM settle
      const timer = setTimeout(measureTarget, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStepData, measureTarget]);

  // Handle resize
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => measureTarget();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, measureTarget]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive || !currentStepData || !targetRect) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      pointerEvents: 'none'
    }}>
      {/* Overlay with spotlight cutout */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto'
        }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left}
              y={targetRect.top}
              width={targetRect.width}
              height={targetRect.height}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      </svg>

      {/* Spotlight ring */}
      <div
        style={{
          position: 'absolute',
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          borderRadius: '16px',
          border: '3px solid rgba(249, 115, 22, 0.8)',
          boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.3), 0 0 30px rgba(249, 115, 22, 0.4)',
          pointerEvents: 'none',
          animation: 'pulse-ring 2s ease-in-out infinite'
        }}
      />

      {/* Tooltip */}
      <div
        style={{
          position: 'absolute',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: '320px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          pointerEvents: 'auto',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #003250 0%, #004A69 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#F97316" />
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={skipTour}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#1E293B',
            margin: '0 0 0.5rem 0'
          }}>
            {currentStepData.title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            lineHeight: 1.6,
            margin: 0
          }}>
            {currentStepData.content}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '4px',
          background: '#E2E8F0',
          margin: '0 1.25rem'
        }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Actions */}
        <div style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <button
            onClick={skipTour}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#64748B',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1E293B'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Skip tour
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isFirstStep && (
              <button
                onClick={prevStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.625rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: 'white',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            <button
              onClick={isLastStep ? completeTour : nextStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)';
              }}
            >
              {isLastStep ? (currentStepData.action || 'Finish') : (currentStepData.action || 'Next')}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3), 0 0 30px rgba(249, 115, 22, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(249, 115, 22, 0.2), 0 0 40px rgba(249, 115, 22, 0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default OnboardingOverlay;
