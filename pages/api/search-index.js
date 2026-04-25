import { getAllPosts } from '../../lib/posts'

export default function handler(req, res) {
  const posts = getAllPosts().map(p => ({
    slug: p.slug,
    title: p.title || '',
    description: p.description || '',
    tags: p.tags || [],
  }))

  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.status(200).json(posts)
}