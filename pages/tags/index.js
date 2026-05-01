import Layout from '../../components/Layout'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getAllTags } from '../../lib/posts'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

export default function TagsPage({ tags }) {
  const { locale } = useRouter()
  const isEn = locale === 'en'
  const title = isEn ? `All Tags — ${siteConfig.name}` : `Всі теги — ${siteConfig.name}`
  const desc = `Повний список тем та тегів на ${siteConfig.name}: Windows, безпека, GPO, CMD, PowerShell та інше.`

  return (
    <Layout
      title="Всі теги"
      description={desc}
      canonical={`${SITE}/tags`}
    >
      <div style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <h1 style={styles.title}>{isEn ? 'All Tags' : 'Всі теги'}</h1>
          <p style={styles.subtitle}>{tags.length} {isEn ? 'topics' : 'тем'} · {tags.reduce((s, t) => s + t.count, 0)} {isEn ? 'articles' : 'статей'}</p>
          <div style={styles.grid} role="list">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                style={styles.tagCard}
                className="tag-card-link"
                role="listitem"
                aria-label={`${tag} — ${count} ${plural(count)}`}
              >
                <span style={styles.tagName}>{tag}</span>
                <span style={styles.tagCount}>{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function plural(n) {
  if (n === 1) return 'стаття'
  if (n >= 2 && n <= 4) return 'статті'
  return 'статей'
}

export async function getStaticProps({ locale }) {
  const tags = getAllTags(locale)
  return { props: { tags } }
}

const styles = {
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
    fontWeight: 700,
    marginBottom: '.5rem',
    color: '#0f172a',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '2rem',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  tagCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#ffffff',
    transition: 'border-color .15s, background .15s, transform .15s',
  },
  tagName: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: '#1d4ed8',
  },
  tagCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: '#94a3b8',
    background: '#eff6ff',
    padding: '1px 6px',
    borderRadius: '10px',
  },
}
