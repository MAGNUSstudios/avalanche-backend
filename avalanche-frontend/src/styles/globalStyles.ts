import { globalCss } from '../stitches.config';

export const globalStyles = globalCss({
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },

  'html, body, #root': {
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    backgroundColor: 'var(--bg-primary) !important',
    color: 'var(--text-primary) !important',
  },

  body: {
    backgroundColor: 'var(--bg-primary) !important',
    color: 'var(--text-primary) !important',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },

  // Force theme colors on all elements
  '[data-theme="dark"]': {
    '*': {
      borderColor: 'var(--border-color)',
    },
  },
});
