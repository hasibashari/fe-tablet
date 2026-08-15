'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('MediCore ServiceWorker registered: ', registration.scope)
          })
          .catch((err) => {
            console.error('MediCore ServiceWorker registration failed: ', err)
          })
      })
    }
  }, [])

  return null
}
