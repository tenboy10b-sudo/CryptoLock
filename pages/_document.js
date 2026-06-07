import { Html, Head, Main, NextScript } from 'next/document'

const themeScript = '(function(){var s=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;document.documentElement.setAttribute("data-theme",s||(d?"dark":"light"));})()'

export default function Document(props) {
  const locale = props.__NEXT_DATA__?.locale || 'uk'
  return (
    <Html lang={locale}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Unbounded:wght@600;700&display=swap"
        />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
