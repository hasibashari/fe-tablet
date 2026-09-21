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
            main: '#e11d48', // Fe-Tablet Rose
            dark: '#be123c', // Fe-Tablet Rose Hover
            light: '#ffe4e6', // Fe-Tablet Rose Light
          },
          text: {
            primary: '#1e293b', // text-ink
            secondary: '#475569', // text-body
          },
          background: {
            default: '#fff5f7', // canvas soft blush
            paper: '#ffffff',
          },
          divider: '#fce7f3', // blush border
          success: {
            main: '#10b981', // emerald
          },
          warning: {
            main: '#f59e0b', // amber
          },
          error: {
            main: '#f43f5e', // rose-red
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
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 16, // Fe-Tablet rounded standard
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
                  boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.35)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#be123c',
                    boxShadow: '0 6px 20px rgba(225, 29, 72, 0.25)',
                    transform: 'translateY(-1px)',
                  },
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: '0px 2px 10px rgba(225, 29, 72, 0.04)',
                border: '1px solid #fce7f3',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 20,
                border: '1px solid #fce7f3',
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
                borderBottom: '1px solid #fce7f3',
              },
              head: {
                fontWeight: 700,
                backgroundColor: '#fff5f7',
                color: '#1e293b',
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
