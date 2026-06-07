import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = e => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [])

  return <Component {...pageProps} />
}
