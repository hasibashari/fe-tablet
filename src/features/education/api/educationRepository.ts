'use server'

import db from '@/src/lib/db/client'
import { Article, ContentSection, Author } from '../types'

interface ArticleDbRow {
  id: string
  title: string
  summary: string
  lead_paragraph: string | null
  image_url: string
  image_caption: string | null
  read_time: string
  category: string
  status: string
  views: number
  published_at: string
  author_id: string | null
  author_name: string | null
  author_role: string | null
  author_avatar: string | null
  author_bio: string | null
  key_takeaways: string | null
  tags: string | null
}

interface ArticleSectionDbRow {
  heading: string | null
  subheading: string | null
  paragraphs: string | null
  callout_type: 'tip' | 'warning' | 'quote' | null
  callout_title: string | null
  callout_text: string | null
  bullet_points: string | null
}

interface UserBookmarkRow {
  id: number
  user_id: string
  article_id: string
}

export async function getArticlesAction(category?: string): Promise<Article[]> {
  try {
    let sql = `
      SELECT id, title, summary, lead_paragraph, image_url, image_caption, read_time, category, status, views, published_at,
             author_id, author_name, author_role, author_avatar, author_bio, key_takeaways, tags
      FROM articles
      WHERE status = 'Terbit'
    `
    const params: unknown[] = []

    if (category && category !== 'ALL') {
      sql += ` AND category = $1`
      params.push(category)
    }

    sql += ` ORDER BY published_at DESC, created_at DESC`

    const res = await db.query<ArticleDbRow>(sql, params)

    return res.rows.map((r) => {
      let author: Author | undefined
      if (r.author_name) {
        author = {
          name: r.author_name,
          role: r.author_role || '',
          avatar: r.author_avatar || '',
          bio: r.author_bio || undefined,
        }
      }

      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        leadParagraph: r.lead_paragraph || undefined,
        imageUrl: r.image_url,
        imageCaption: r.image_caption || undefined,
        readTime: r.read_time,
        category: r.category,
        publishedAt: r.published_at,
        author,
        keyTakeaways: r.key_takeaways ? JSON.parse(r.key_takeaways) : undefined,
        tags: r.tags ? JSON.parse(r.tags) : undefined,
      }
    })
  } catch (error) {
    console.error('Error in getArticlesAction:', error)
    return []
  }
}

export async function getArticleByIdAction(id: string): Promise<Article | null> {
  try {
    // Increment view count
    await db.query(`UPDATE articles SET views = views + 1 WHERE id = $1`, [id])

    const res = await db.query<ArticleDbRow>(
      `SELECT id, title, summary, lead_paragraph, image_url, image_caption, read_time, category, status, views, published_at,
              author_id, author_name, author_role, author_avatar, author_bio, key_takeaways, tags
       FROM articles 
       WHERE id = $1`,
      [id]
    )
    const row = res.rows[0]

    if (!row) return null

    // Fetch structured sections
    const sectionRes = await db.query<ArticleSectionDbRow>(
      `SELECT heading, subheading, paragraphs, callout_type, callout_title, callout_text, bullet_points
       FROM article_sections
       WHERE article_id = $1
       ORDER BY order_index ASC`,
      [id]
    )

    const sections: ContentSection[] = sectionRes.rows.map((sec) => ({
      heading: sec.heading || undefined,
      subheading: sec.subheading || undefined,
      paragraphs: sec.paragraphs ? JSON.parse(sec.paragraphs) : [],
      callout: sec.callout_text
        ? {
            type: sec.callout_type || 'tip',
            title: sec.callout_title || undefined,
            text: sec.callout_text,
          }
        : undefined,
      bulletPoints: sec.bullet_points ? JSON.parse(sec.bullet_points) : undefined,
    }))

    let author: Author | undefined
    if (row.author_name) {
      author = {
        name: row.author_name,
        role: row.author_role || '',
        avatar: row.author_avatar || '',
        bio: row.author_bio || undefined,
      }
    }

    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      leadParagraph: row.lead_paragraph || undefined,
      imageUrl: row.image_url,
      imageCaption: row.image_caption || undefined,
      readTime: row.read_time,
      category: row.category,
      publishedAt: row.published_at,
      author,
      sections,
      keyTakeaways: row.key_takeaways ? JSON.parse(row.key_takeaways) : undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
    }
  } catch (error) {
    console.error('Error in getArticleByIdAction:', error)
    return null
  }
}

export async function getRelatedArticlesAction(currentId: string, limit: number = 3): Promise<Article[]> {
  try {
    const currentRes = await db.query<{ category: string }>(`SELECT category FROM articles WHERE id = $1`, [currentId])
    const current = currentRes.rows[0]
    const category = current?.category || ''

    const res = await db.query<Partial<ArticleDbRow>>(
      `SELECT id, title, summary, image_url, read_time, category, published_at, author_name, author_avatar
       FROM articles 
       WHERE id != $1 AND status = 'Terbit'
       ORDER BY CASE WHEN category = $2 THEN 0 ELSE 1 END, published_at DESC
       LIMIT $3`,
      [currentId, category, limit]
    )

    return res.rows.map((r) => ({
      id: r.id || '',
      title: r.title || '',
      summary: r.summary || '',
      imageUrl: r.image_url || '',
      readTime: r.read_time || '3 min read',
      category: r.category || 'General',
      publishedAt: r.published_at || '',
      author: r.author_name
        ? {
            name: r.author_name,
            role: '',
            avatar: r.author_avatar || '',
          }
        : undefined,
    }))
  } catch (error) {
    console.error('Error in getRelatedArticlesAction:', error)
    return []
  }
}

export async function toggleArticleBookmarkAction(
  userId: string,
  articleId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  try {
    const existingRes = await db.query<UserBookmarkRow>(
      `SELECT id FROM user_bookmarks WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId]
    )
    const existing = existingRes.rows[0]

    if (existing) {
      await db.query(`DELETE FROM user_bookmarks WHERE id = $1`, [existing.id])
      return { success: true, isBookmarked: false }
    } else {
      await db.query(`INSERT INTO user_bookmarks (user_id, article_id) VALUES ($1, $2)`, [userId, articleId])
      return { success: true, isBookmarked: true }
    }
  } catch (error) {
    console.error('Error in toggleArticleBookmarkAction:', error)
    return { success: false, isBookmarked: false }
  }
}

export async function isArticleBookmarkedAction(userId: string, articleId: string): Promise<boolean> {
  try {
    const existingRes = await db.query(
      `SELECT id FROM user_bookmarks WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId]
    )
    return existingRes.rows.length > 0
  } catch {
    return false
  }
}
