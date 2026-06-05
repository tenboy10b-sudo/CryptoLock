import '../styles/globals.css'
import { useEffect } from 'react'

// Запобігаємо flash при завантаженні — тема встановлюється до рендеру
const themeScript = `
  (function() {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
`

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Синхронізуємо системну тему якщо немає збереженої
    if (!localStorage.getItem('theme')) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = e => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [])

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <Component {...pageProps} />
    </>
  )
}
