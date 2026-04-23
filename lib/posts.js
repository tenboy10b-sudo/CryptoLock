import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

// Перевіряє чи стаття вже опублікована (publishDate <= сьогодні)
function isPublished(post) {
  const publishDate = post.publishDate || post.date
  if (!publishDate) return true
  return new Date(publishDate) <= new Date()
}

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames
    .filter((f) => f.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      return { slug, ...data }
    })
    .filter(isPublished) // приховуємо майбутні статті
    .sort((a, b) => {
      const dateA = a.publishDate || a.date || ''
      const dateB = b.publishDate || b.date || ''
      return dateA < dateB ? 1 : -1
    })
  return posts
}

// Повертає всі slug, включно з ще не опублікованими
// [slug].js сам вирішить: показати контент або noindex-заглушку
export function getAllSlugs() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ params: { slug: f.replace(/\.md$/, '') } }))
}

export function getAllTags() {
  const posts = getAllPosts()
  const tagCount = {}
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    }
  })
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))
}

export function getPostsByTag(tag) {
  return getAllPosts().filter((p) => p.tags && p.tags.includes(tag))
}

export async function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)
  const contentHtml = processed.toString()
  return { slug, contentHtml, ...data }
}
