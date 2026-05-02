import Link from 'next/link'
import { useRouter } from 'next/router'

export default function PostCard({ post, featured }) {
  const { locale } = useRouter()
  const isEn = locale === 'en'
  return (
    <article
      className="post-card"
      style={{ ...s.card, ...(featured ? s.cardFeatured : {}) }}
    >
      <Link
        href={`/${post.slug}`}
        style={s.link}
        aria-label={post.title}
      >
        <div style={s.tagRow} aria-hidden="true">
          {post.tags && post.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
        <h2 style={{ ...s.title, ...(featured ? s.titleFeatured : {}) }}>
          {post.title}
        </h2>
        {post.description && (
          <p style={s.excerpt}>{post.description}</p>
        )}
        <div style={s.footer}>
          <div style={s.meta}>
            {post.date && (
              <time dateTime={post.date} style={s.metaItem}>{fmt(post.date, isEn)}</time>
            )}
            {post.readTime && (
              <><span style={s.dot} aria-hidden="true"/><span style={s.metaItem}>{post.readTime} {isEn ? 'min' : 'хв'}</span></>
            )}
          </div>
          <span style={s.readBtn} aria-hidden="true">{isEn ? 'Read' : 'Читати'}</span>
        </div>
      </Link>
    </article>
  )
}

function fmt(d, isEn = false) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(isEn ? 'en-US' : 'uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

const s = {
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'border-color .2s, box-shadow .2s, transform .15s',
  },
  cardFeatured: {
    borderLeft: '4px solid #2563eb',
    borderColor: '#bfdbfe',
  },
  link: { display: 'block', padding: '1.25rem 1.4rem' },
  tagRow: { display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' },
  title: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: '8px',
    color: '#0f172a',
    letterSpacing: '-.2px',
  },
  titleFeatured: { fontSize: '1.1rem' },
  excerpt: { fontSize: '.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '14px' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  meta: { display: 'flex', alignItems: 'center', gap: '6px' },
  metaItem: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, display: 'inline-block' },
  readBtn: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#2563eb',
    background: '#eff6ff',
    padding: '5px 14px',
    borderRadius: '999px',
    border: '1px solid #dbeafe',
    whiteSpace: 'nowrap',
  },
}
