/**
 * Centralized theme configuration for consistent design
 */

// Color palette
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// Typography
export const TYPOGRAPHY = {
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
  },
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
};

// Spacing
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

// Border radius
export const RADIUS = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Theme modes
export const THEME_MODES = {
  dark: {
    background: COLORS.gray[900],
    surface: COLORS.gray[800],
    text: {
      primary: COLORS.gray[100],
      secondary: COLORS.gray[300],
      disabled: COLORS.gray[500],
    },
    border: COLORS.gray[700],
  },
  
  light: {
    background: COLORS.gray[50],
    surface: 'white',
    text: {
      primary: COLORS.gray[900],
      secondary: COLORS.gray[600],
      disabled: COLORS.gray[400],
    },
    border: COLORS.gray[200],
  }
};

// Component-specific themes
export const COMPONENT_THEMES = {
  button: {
    primary: {
      bg: COLORS.primary[600],
      bgHover: COLORS.primary[700],
      bgDisabled: COLORS.gray[400],
      text: 'white',
      textDisabled: COLORS.gray[600],
    },
    
    secondary: {
      bg: COLORS.gray[600],
      bgHover: COLORS.gray[700],
      bgDisabled: COLORS.gray[300],
      text: 'white',
      textDisabled: COLORS.gray[500],
    },
    
    success: {
      bg: COLORS.success[600],
      bgHover: COLORS.success[700],
      bgDisabled: COLORS.gray[400],
      text: 'white',
      textDisabled: COLORS.gray[600],
    },
    
    error: {
      bg: COLORS.error[600],
      bgHover: COLORS.error[700],
      bgDisabled: COLORS.gray[400],
      text: 'white',
      textDisabled: COLORS.gray[600],
    }
  },
  
  input: {
    default: {
      bg: COLORS.gray[800],
      bgFocus: COLORS.gray[700],
      border: COLORS.gray[600],
      borderFocus: COLORS.primary[500],
      text: 'white',
      placeholder: COLORS.gray[400],
    }
  },
  
  card: {
    default: {
      bg: COLORS.gray[800],
      border: COLORS.gray[700],
      shadow: SHADOWS.md,
    }
  }
};

// Accessibility settings
export const A11Y = {
  // Minimum contrast ratios
  contrast: {
    normal: 4.5,
    large: 3,
  },
  
  // Focus ring styles
  focusRing: {
    width: '2px',
    style: 'solid',
    color: COLORS.primary[500],
    offset: '2px',
  },
  
  // Animation preferences
  motion: {
    reduced: false, // Can be dynamically set based on user preference
  }
};

// Animation durations
export const ANIMATIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

// Z-index layers
export const Z_INDEX = {
  dropdown: 1000,
  modal: 1050,
  tooltip: 1100,
  notification: 1200,
  loading: 1300,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  BREAKPOINTS,
  THEME_MODES,
  COMPONENT_THEMES,
  A11Y,
  ANIMATIONS,
  Z_INDEX,
};
