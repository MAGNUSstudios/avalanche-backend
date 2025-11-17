import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      // Use CSS variables for dynamic theming
      bgPrimary: 'var(--bg-primary)',
      bgSecondary: 'var(--bg-secondary)',
      bgTertiary: 'var(--bg-tertiary)',
      cardBg: 'var(--card-bg)',
      textPrimary: 'var(--text-primary)',
      textSecondary: 'var(--text-secondary)',
      textTertiary: 'var(--text-tertiary)',
      textWhite: 'var(--text-white)',
      borderColor: 'var(--border-color)',
      primaryColor: 'var(--primary-color)',
      primaryHover: 'var(--primary-hover)',
      primaryLight: 'var(--primary-light)',
      primaryGlow: 'var(--primary-glow)',
      primaryGlowSoft: 'var(--primary-glow-soft)',

      // Background variations
      backgroundLight: 'var(--background-light)',
      backgroundDark: 'var(--background-dark)',
      cardBackground: 'var(--card-background)',
      inputBackground: 'var(--input-background)',

      // Semantic colors - Use CSS variables
      success: 'var(--success-color)',
      warning: 'var(--warning-color)',
      error: 'var(--error-color)',
      info: 'var(--info-color)',

      // Gray scale - Use CSS variables
      gray50: 'var(--gray-50)',
      gray100: 'var(--gray-100)',
      gray200: 'var(--gray-200)',
      gray300: 'var(--gray-300)',
      gray400: 'var(--gray-400)',
      gray500: 'var(--gray-500)',
      gray600: 'var(--gray-600)',
      gray700: 'var(--gray-700)',
      gray800: 'var(--gray-800)',
      gray900: 'var(--gray-900)',

      // Primary blue scale (static - for specific use cases)
      primary50: '#eff6ff',
      primary100: '#dbeafe',
      primary200: '#bfdbfe',
      primary300: '#93c5fd',
      primary400: '#60a5fa',
      primary500: '#3b82f6',
      primary600: '#2563eb',
      primary700: '#1d4ed8',
      primary800: '#1e40af',
      primary900: '#1e3a8a',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
    },
    fontSizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fonts: {
      sans: "'Inter', system-ui, -apple-system, sans-serif",
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    radii: {
      none: '0',
      sm: '4px',
      base: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
    shadows: {
      sm: 'var(--shadow-sm)',
      base: 'var(--shadow-base)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
    },
  },
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  },
  utils: {
    p: (value: string | number) => ({
      padding: value,
    }),
    pt: (value: string | number) => ({
      paddingTop: value,
    }),
    pr: (value: string | number) => ({
      paddingRight: value,
    }),
    pb: (value: string | number) => ({
      paddingBottom: value,
    }),
    pl: (value: string | number) => ({
      paddingLeft: value,
    }),
    px: (value: string | number) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: (value: string | number) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    m: (value: string | number) => ({
      margin: value,
    }),
    mt: (value: string | number) => ({
      marginTop: value,
    }),
    mr: (value: string | number) => ({
      marginRight: value,
    }),
    mb: (value: string | number) => ({
      marginBottom: value,
    }),
    ml: (value: string | number) => ({
      marginLeft: value,
    }),
    mx: (value: string | number) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (value: string | number) => ({
      marginTop: value,
      marginBottom: value,
    }),
  },
});

// Dark theme - Uses CSS variables automatically
export const darkTheme = createTheme({
  colors: {
    // All colors use CSS variables for automatic theme switching
    // No need to redefine - CSS variables handle the theming
  },
});
