import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action text for the button
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startTour: (tourId: string, steps: OnboardingStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  hasCompletedTour: (tourId: string) => boolean;
  resetTour: (tourId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'professor_academy_onboarding';

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentTourId, setCurrentTourId] = useState<string | null>(null);
  const [completedTours, setCompletedTours] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load onboarding state:', e);
    }
    return new Set();
  });

  // Persist completed tours
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedTours]));
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
    }
  }, [completedTours]);

  const startTour = useCallback((tourId: string, tourSteps: OnboardingStep[]) => {
    if (completedTours.has(tourId)) return;
    setCurrentTourId(tourId);
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, [completedTours]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    if (currentTourId) {
      setCompletedTours(prev => new Set([...prev, currentTourId]));
    }
    setIsActive(false);
    setSteps([]);
    setCurrentStep(0);
    setCurrentTourId(null);
  }, [currentTourId]);

  const completeTour = useCallback(() => {
    if (currentTourId) {
      setCompletedTours(prev => new Set([...prev, currentTourId]));
    }
    setIsActive(false);
    setSteps([]);
    setCurrentStep(0);
    setCurrentTourId(null);
  }, [currentTourId]);

  const hasCompletedTour = useCallback((tourId: string) => {
    return completedTours.has(tourId);
  }, [completedTours]);

  const resetTour = useCallback((tourId: string) => {
    setCompletedTours(prev => {
      const next = new Set(prev);
      next.delete(tourId);
      return next;
    });
  }, []);

  return (
    <OnboardingContext.Provider value={{
      isActive,
      currentStep,
      steps,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      hasCompletedTour,
      resetTour
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};
