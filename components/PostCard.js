import Link from 'next/link'

export default function PostCard({ post, featured }) {
  return (
    <article style={{ ...s.card, ...(featured ? s.featured : {}) }}>
      <Link href={`/${post.slug}`} style={s.link}>
        {post.tags && post.tags.length > 0 && (
          <div style={s.tagRow}>
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}
        <h2 style={{ ...s.title, ...(featured ? s.titleFeatured : {}) }}>{post.title}</h2>
        {post.description && <p style={s.excerpt}>{post.description}</p>}
        <div style={s.meta}>
          {post.date && <span style={s.metaItem}>{formatDate(post.date)}</span>}
          {post.readTime && (
            <><span style={s.dot}/><span style={s.metaItem}>{post.readTime} хв читання</span></>
          )}
          <span style={s.arrow}>Читати →</span>
        </div>
      </Link>
    </article>
  )
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
}

const s = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    transition: 'border-color .2s, box-shadow .2s',
    overflow: 'hidden',
  },
  featured: {
    borderColor: '#bfdbfe',
    borderLeft: '4px solid var(--accent)',
  },
  link: { display: 'block', padding: '1.25rem 1.5rem' },
  tagRow: { display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.05rem',
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: '8px',
    color: 'var(--text)',
    letterSpacing: '-.2px',
  },
  titleFeatured: { fontSize: '1.15rem' },
  excerpt: {
    fontSize: '.9rem',
    color: 'var(--muted)',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  metaItem: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--faint)' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: 'var(--faint)', flexShrink: 0 },
  arrow: { marginLeft: 'auto', fontSize: '13px', fontWeight: 500, color: 'var(--accent)' },
}
