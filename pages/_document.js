import { Html, Head, Main, NextScript } from 'next/document'
import siteConfig from '../site.config'

// Theme script — запускається ДО рендеру, усуває flash
const themeScript = '(function(){try{var s=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;document.documentElement.setAttribute("data-theme",s||(d?"dark":"light"));}catch(e){}})()'

export default function Document() {
  return (
    <Html lang="uk" suppressHydrationWarning>
      <Head>
        {/* Fonts — preconnect + display=optional: без перемальовування тексту при
            довантаженні шрифту (swap спричиняв CLS 0.4-0.5+ на статтях з великим блоком тексту) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Unbounded:wght@600;700&display=optional"
        />

        {/* GA4 — defer щоб не блокував main thread */}
        {siteConfig.gaId && (
          <>
            <script
              defer
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${siteConfig.gaId}');`,
              }}
            />
          </>
        )}
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
