import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')
const postsEnDirectory = path.join(process.cwd(), 'posts-en')

function isPublished(post) {
  const publishDate = post.publishDate || post.date
  if (!publishDate) return true
  return new Date(publishDate) <= new Date()
}

// Отримати всі пости для конкретної мови
export function getAllPosts(locale = 'uk') {
  const dir = locale === 'en' && fs.existsSync(postsEnDirectory)
    ? postsEnDirectory
    : postsDirectory

  const fileNames = fs.readdirSync(dir)
  return fileNames
    .filter(f => f.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(dir, fileName)
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'))
      return { slug, ...data }
    })
    .filter(isPublished)
    .sort((a, b) => {
      const dA = a.publishDate || a.date || ''
      const dB = b.publishDate || b.date || ''
      return dA < dB ? 1 : -1
    })
}

export function getAllSlugs(locale = 'uk') {
  const dir = locale === 'en' && fs.existsSync(postsEnDirectory)
    ? postsEnDirectory
    : postsDirectory

  const fileNames = fs.readdirSync(dir)
  return fileNames
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const slug = f.replace(/\.md$/, '')
      const fullPath = path.join(dir, f)
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'))
      return { slug, ...data }
    })
    .filter(isPublished)
    .map(p => ({ params: { slug: p.slug } }))
}

export function getAllTags(locale = 'uk') {
  const posts = getAllPosts(locale)
  const tagCount = {}

  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    }
  })

  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))
}

export function getPostsByTag(tag, locale = 'uk') {
  return getAllPosts(locale).filter(p => p.tags && p.tags.includes(tag))
}

export async function getPostBySlug(slug, locale = 'uk') {
  const dir = locale === 'en' && fs.existsSync(postsEnDirectory)
    ? postsEnDirectory
    : postsDirectory

  // Спробувати EN файл, якщо немає — fallback на UK
  let fullPath = path.join(dir, `${slug}.md`)
  if (locale === 'en' && !fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${slug}.md`)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)

  return { slug, contentHtml: processed.toString(), ...data }
}
