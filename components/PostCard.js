import Link from 'next/link'

export default function PostCard({ post }) {
  return (
    <article style={styles.card}>
      <Link href={`/${post.slug}`} style={styles.link}>
        {post.tags && post.tags.length > 0 && (
          <div style={styles.tagRow}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}
        <h2 style={styles.title}>{post.title}</h2>
        {post.description && (
          <p style={styles.excerpt}>{post.description}</p>
        )}
        <div style={styles.meta}>
          <span style={styles.date}>{formatDate(post.date)}</span>
          {post.readTime && (
            <>
              <span style={styles.dot} />
              <span style={styles.readTime}>{post.readTime} хв читання</span>
            </>
          )}
        </div>
      </Link>
    </article>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
}

const styles = {
  card: {
    borderBottom: '1px solid var(--border)',
    padding: '1.5rem 0',
  },
  link: { display: 'block' },
  tagRow: { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.15rem',
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: '8px',
    color: 'var(--text)',
    transition: 'color 0.15s',
  },
  excerpt: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '10px',
    fontFamily: 'var(--font-body)',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px' },
  date: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-faint)' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-faint)' },
  readTime: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-faint)' },
}
