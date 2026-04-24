import { useEffect, useState } from 'react'

export default function TableOfContents({ contentHtml }) {
  const [headings, setHeadings] = useState([])
  const [active, setActive] = useState('')

  // Парсимо заголовки з HTML
  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const els = doc.querySelectorAll('h2, h3')
    const items = Array.from(els).map((el, i) => {
      const id = el.id || `heading-${i}`
      return { id, text: el.textContent, level: el.tagName.toLowerCase() }
    })
    setHeadings(items)
  }, [contentHtml])

  // Додаємо id до заголовків у DOM після рендеру
  useEffect(() => {
    if (headings.length === 0) return
    const els = document.querySelectorAll('.prose h2, .prose h3')
    els.forEach((el, i) => {
      if (!el.id) el.id = `heading-${i}`
    })
  }, [headings])

  // Відстеження активного заголовку при скролі
  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    document.querySelectorAll('.prose h2, .prose h3').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 3) return null

  return (
    <nav aria-label="Зміст статті" style={s.wrap}>
      <p style={s.label}>Зміст</p>
      <ol style={s.list}>
        {headings.map(h => (
          <li key={h.id} style={{ listStyle: 'none' }}>
            <a
              href={`#${h.id}`}
              style={{
                ...s.link,
                ...(h.level === 'h3' ? s.linkH3 : {}),
                ...(active === h.id ? s.linkActive : {}),
              }}
              onClick={e => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

const s = {
  wrap: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    marginBottom: '2rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#94a3b8',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  list: { padding: 0, margin: 0 },
  link: {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: '#475569',
    padding: '4px 0',
    textDecoration: 'none',
    borderLeft: '2px solid transparent',
    paddingLeft: '10px',
    transition: 'color .15s, border-color .15s',
    lineHeight: 1.4,
  },
  linkH3: {
    paddingLeft: '22px',
    fontSize: '12px',
    color: '#64748b',
  },
  linkActive: {
    color: '#2563eb',
    borderLeftColor: '#2563eb',
    fontWeight: 500,
  },
}
