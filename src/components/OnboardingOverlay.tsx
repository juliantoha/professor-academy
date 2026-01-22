import { useEffect, useState, useCallback, useRef } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
  const [isReady, setIsReady] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Find and measure target element
  const measureTarget = useCallback(() => {
    if (!currentStepData?.target) {
      setIsReady(false);
      return;
    }

    const element = document.querySelector(currentStepData.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;

      // Use viewport-relative coordinates (no scrollY since we're fixed positioned)
      setTargetRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      });

      // Calculate responsive tooltip width based on viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 16;
      const tooltipWidth = Math.min(320, viewportWidth - margin * 2);
      const tooltipHeight = tooltipRef.current?.offsetHeight || 240;
      const gap = viewportWidth < 480 ? 8 : 16;

      let top = 0;
      let left = 0;
      let placement = currentStepData.placement;

      // On small screens, prefer bottom placement to avoid side collisions
      if (viewportWidth < 640) {
        // Check if there's room below, otherwise go above
        if (rect.bottom + tooltipHeight + gap + margin < viewportHeight) {
          placement = 'bottom';
        } else if (rect.top - tooltipHeight - gap - margin > 0) {
          placement = 'top';
        } else {
          // Center in viewport if no good position
          placement = 'bottom';
        }
      }

      switch (placement) {
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'top':
          top = rect.top - tooltipHeight - gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - gap;
          // Fall back to bottom if no room on left
          if (left < margin) {
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
          }
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + gap;
          // Fall back to bottom if no room on right
          if (left + tooltipWidth + margin > viewportWidth) {
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
          }
          break;
      }

      // Keep tooltip in viewport with proper margins
      left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin));
      top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin));

      setTooltipPosition({ top, left });

      // Scroll element into view if needed (only if significantly off-screen)
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setIsReady(true);
    } else {
      // Target element not found - still show tooltip in center
      console.warn(`Onboarding target not found: ${currentStepData.target}`);
      setTargetRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 120,
        left: window.innerWidth / 2 - 160
      });
      setIsReady(true);
    }
  }, [currentStepData]);

  useEffect(() => {
    if (isActive && currentStepData) {
      setIsReady(false);
      // Small delay to let DOM settle, then measure
      const timer = setTimeout(measureTarget, 150);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStepData, measureTarget]);

  // Re-measure after tooltip renders to get accurate height
  useEffect(() => {
    if (isReady && tooltipRef.current) {
      const timer = setTimeout(measureTarget, 50);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // Handle resize and scroll
  useEffect(() => {
    if (!isActive) return;

    const handleUpdate = () => measureTarget();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
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

  if (!isActive || !currentStepData) {
    return null;
  }

  // Create overlay segments that go around the target (4 divs forming a frame)
  // This allows the target element to remain clickable
  const renderOverlaySegments = () => {
    if (!targetRect) {
      // Full overlay when no target
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={skipTour}
        />
      );
    }

    return (
      <>
        {/* Top segment */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: Math.max(0, targetRect.top),
            background: 'rgba(0, 0, 0, 0.75)',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={skipTour}
        />
        {/* Bottom segment */}
        <div
          style={{
            position: 'fixed',
            top: targetRect.top + targetRect.height,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={skipTour}
        />
        {/* Left segment */}
        <div
          style={{
            position: 'fixed',
            top: targetRect.top,
            left: 0,
            width: Math.max(0, targetRect.left),
            height: targetRect.height,
            background: 'rgba(0, 0, 0, 0.75)',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={skipTour}
        />
        {/* Right segment */}
        <div
          style={{
            position: 'fixed',
            top: targetRect.top,
            left: targetRect.left + targetRect.width,
            right: 0,
            height: targetRect.height,
            background: 'rgba(0, 0, 0, 0.75)',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={skipTour}
        />
      </>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      pointerEvents: 'auto'
    }}>
      {/* Overlay segments around target */}
      {renderOverlaySegments()}

      {/* Spotlight ring around target */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
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
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 'min(320px, calc(100vw - 32px))',
          maxWidth: '320px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          pointerEvents: 'auto',
          animation: 'slideUp 0.3s ease-out',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.15s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'linear-gradient(135deg, #003250 0%, #004A69 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              skipTour();
            }}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevStep();
                }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isLastStep) {
                  completeTour();
                } else {
                  nextStep();
                }
              }}
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
