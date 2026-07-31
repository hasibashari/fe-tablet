import { createTheme } from '@mui/material/styles'

export const claudeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#cc785c',        // Claude warm coral
      dark: '#a9583e',        // Coral active
      light: '#e8a55a',       // Coral amber accent
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf9f5',     // Tinted cream canvas
      paper: '#efe9de',       // Light cream surface card
    },
    text: {
      primary: '#141413',     // Warm dark ink
      secondary: '#6c6a64',   // Muted
    },
    divider: '#e6dfd8',       // Hairline
  },
  typography: {
    fontFamily: 'var(--font-sans), Inter, sans-serif',
    h1: {
      fontFamily: 'var(--font-serif), "Cormorant Garamond", Georgia, serif',
      fontWeight: 400,
      letterSpacing: '-0.025em',
      color: '#141413',
    },
    h2: {
      fontFamily: 'var(--font-serif), "Cormorant Garamond", Georgia, serif',
      fontWeight: 400,
      letterSpacing: '-0.02em',
      color: '#141413',
    },
    h3: {
      fontFamily: 'var(--font-serif), "Cormorant Garamond", Georgia, serif',
      fontWeight: 400,
      letterSpacing: '-0.015em',
      color: '#141413',
    },
    h4: {
      fontFamily: 'var(--font-sans), Inter, sans-serif',
      fontWeight: 500,
      color: '#141413',
    },
    button: {
      fontFamily: 'var(--font-sans), Inter, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
})

// Maintaining lightTheme and darkTheme exports for compatibility
export const lightTheme = claudeTheme
export const darkTheme = claudeTheme
