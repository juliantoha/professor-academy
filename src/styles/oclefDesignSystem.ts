/**
 * Oclef Design System
 *
 * This file contains all design tokens for the Oclef Professor Academy.
 * Use these constants throughout the app for consistent branding.
 */

// ============================================
// TYPOGRAPHY
// ============================================

export const fonts = {
  // Headings: Serif font reinforces "conservatory/academic" feel
  heading: "'Lora', Georgia, serif",
  // Body: Clean sans-serif for readability
  body: "'Inter', system-ui, sans-serif",
} as const;

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // === FOUNDATIONS (UI Structure) ===

  // Primary Background (Dark Mode/Footers)
  oclefBlack: '#02040F',

  // Primary Background (Light Mode/Cards) - warm off-white, paper-like
  oclefWhite: '#FFF6ED',

  // Primary Text - deep navy, softer than pure black
  tangaroa: '#002642',

  // === ACTION & BRAND ===

  // Primary CTA - ONLY for the most important button on the page
  oclefOrange: '#eb6a18',
  oclefOrangeLight: '#ff8c3d',

  // Secondary Brand - headers, sub-headlines, secondary buttons
  oclefBlue: '#004A69',
  oclefBlueMedium: '#0066A2',
  oclefBlueLight: '#C4E5F4',

  // === FUNCTIONAL & STATUS ===

  // Success / Growth
  successGreen: '#00952E', // North Texas Green
  successGreenLight: '#C3D366', // June Bud
  successGreenBg: '#ECFDF5',

  // Alerts / Important
  alertRed: '#B9314F', // Oclef Red
  alertRedBright: '#E00442', // Rich Carmine
  alertRedBg: '#FEE2E2',

  // Warning / Pending
  warningAmber: '#F6AE00', // UCLA Gold (also used for Premium)
  warningAmberBg: '#FEF3C7',

  // Premium / Virtuoso / Badges
  premiumGold: '#F6AE00', // UCLA Gold

  // === PLAYFUL ACCENTS (Gamification) ===
  // Use sparingly for illustrations, game icons, gradients

  vividCerulean: '#00A2EC',
  cyanSky: '#00B3B0',
  carnationPink: '#FFA6B4',
  pearlyPurple: '#9566A3',

  // === NEUTRALS ===

  // Borders and dividers
  borderLight: '#E5E7EB',
  borderMedium: '#D1D5DB',

  // Secondary text (use Tangaroa with opacity instead when possible)
  textSecondary: 'rgba(0, 38, 66, 0.6)', // Tangaroa at 60%
  textTertiary: 'rgba(0, 38, 66, 0.4)', // Tangaroa at 40%

  // Pure white for contrast on dark backgrounds
  white: '#FFFFFF',
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  // Subtle - cards at rest
  subtle: '0 4px 16px rgba(0, 38, 66, 0.06)',
  // Medium - cards on hover
  medium: '0 8px 24px rgba(0, 38, 66, 0.1)',
  // Large - modals, dropdowns
  large: '0 20px 60px rgba(0, 38, 66, 0.15)',
} as const;

// ============================================
// GRADIENTS
// ============================================

export const gradients = {
  // Main app background (light mode)
  appBackground: 'linear-gradient(135deg, #FFF6ED 0%, #F0F9FF 50%, #C4E5F4 100%)',
  // Admin/dark mode background
  darkBackground: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  // Primary CTA button
  primaryButton: 'linear-gradient(135deg, #eb6a18 0%, #ff8c3d 100%)',
  // Secondary button
  secondaryButton: 'linear-gradient(135deg, #004A69 0%, #0066A2 100%)',
  // Success
  success: 'linear-gradient(135deg, #00952E 0%, #C3D366 100%)',
  // Premium/Gold
  premium: 'linear-gradient(135deg, #F6AE00 0%, #FFA500 100%)',
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  fast: '0.15s ease',
  normal: '0.3s ease',
  smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================
// STATUS STYLES (Pre-built for convenience)
// ============================================

export const statusStyles = {
  completed: {
    background: colors.successGreenBg,
    color: colors.successGreen,
    border: `1px solid ${colors.successGreen}`,
  },
  pending: {
    background: colors.warningAmberBg,
    color: colors.warningAmber,
    border: `1px solid ${colors.warningAmber}`,
  },
  error: {
    background: colors.alertRedBg,
    color: colors.alertRed,
    border: `1px solid ${colors.alertRed}`,
  },
  notStarted: {
    background: '#F3F4F6',
    color: colors.textSecondary,
    border: '1px solid #E5E7EB',
  },
} as const;

// ============================================
// BUTTON STYLES (Pre-built for convenience)
// ============================================

export const buttonStyles = {
  primary: {
    background: gradients.primaryButton,
    color: colors.white,
    boxShadow: '0 4px 12px rgba(235, 106, 24, 0.3)',
  },
  secondary: {
    background: gradients.secondaryButton,
    color: colors.white,
    boxShadow: '0 4px 12px rgba(0, 74, 105, 0.3)',
  },
  tertiary: {
    background: colors.white,
    color: colors.oclefBlue,
    border: `2px solid ${colors.borderLight}`,
  },
} as const;

// Default export for convenience
const oclefDesignSystem = {
  fonts,
  colors,
  shadows,
  gradients,
  spacing,
  borderRadius,
  transitions,
  statusStyles,
  buttonStyles,
};

export default oclefDesignSystem;
