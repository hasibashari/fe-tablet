'use client'

import React, { useState, useMemo } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui', prepend: true })
    cache.compat = true
    const prevInsert = cache.insert
    let inserted: string[] = []
    cache.insert = (...args) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    const flush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }
    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) {
      return null
    }
    let styles = ''
    for (const name of names) {
      styles += cache.inserted[name]
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    )
  })

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#0ea5e9', // Tailwind primary
            dark: '#0284c7', // Tailwind primary-active
            light: '#bae6fd',
          },
          text: {
            primary: '#0f172a', // text-ink
            secondary: '#334155', // text-body
          },
          background: {
            default: '#f8fafc', // surface-soft
            paper: '#ffffff',
          },
          divider: '#e2e8f0', // hairline
          success: {
            main: '#10b981', // accent-teal
          },
          warning: {
            main: '#f59e0b', // accent-amber
          },
        },
        typography: {
          fontFamily: 'inherit',
          h6: {
            fontWeight: 700,
            letterSpacing: '-0.5px',
          },
          subtitle1: {
            fontWeight: 700,
            letterSpacing: '-0.3px',
          },
          subtitle2: {
            fontWeight: 700,
          },
        },
        shape: {
          borderRadius: 12, // Update general border radius
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 9999, // Pill shape
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&.MuiButton-containedPrimary': {
                  boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.35)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(14, 165, 233, 0.23)',
                    transform: 'translateY(-2px)',
                  },
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12, // More proportional radius for cards
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 12,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                borderRadius: 9999,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: '1px solid #e2e8f0',
              },
              head: {
                fontWeight: 700,
                backgroundColor: '#f8fafc',
                color: '#0f172a',
              },
            },
          },
        },
      }),
    []
  )

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
