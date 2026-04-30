import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(props) {
  // Next.js i18n передає locale через props
  const locale = props.__NEXT_DATA__?.locale || 'uk'

  return (
    <Html lang={locale}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
