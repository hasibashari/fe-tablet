'use server'

import db from '@/src/lib/db/client'
import { HealthArticle } from '../types/admin.types'

interface ArticleDbRow {
  id: string
  title: string
  category: string
  author_name: string | null
  published_at: string
  status: 'Terbit' | 'Draf'
  views: number
  summary: string
  lead_paragraph: string | null
  image_url: string
  read_time: string
}

// ============================================================
// ARTICLES MANAGEMENT (ARTICLES CRUD & SECTIONS)
// ============================================================
export async function getAdminArticlesAction(): Promise<HealthArticle[]> {
  try {
    const rows = db.prepare(`SELECT * FROM articles ORDER BY published_at DESC, created_at DESC`).all() as ArticleDbRow[]
    return rows.map((r) => {
      let content = r.lead_paragraph || ''
      try {
        const sections = db.prepare(`SELECT paragraphs FROM article_sections WHERE article_id = ? ORDER BY order_index ASC`).all(r.id) as { paragraphs: string }[]
        if (sections.length > 0) {
          const allParagraphs: string[] = []
          for (const s of sections) {
            if (s.paragraphs) {
              const parsed = JSON.parse(s.paragraphs)
              if (Array.isArray(parsed)) allParagraphs.push(...parsed)
            }
          }
          if (allParagraphs.length > 0) {
            content = allParagraphs.join('\n\n')
          }
        }
      } catch {
        // fallback to lead_paragraph
      }

      return {
        id: r.id,
        title: r.title,
        category: r.category as HealthArticle['category'],
        author: r.author_name || 'dr. Sarah Jenkins',
        publishDate: r.published_at,
        status: r.status as HealthArticle['status'],
        views: r.views,
        summary: r.summary,
        readTime: r.read_time,
        imageUrl: r.image_url,
        content: content || r.summary,
      }
    })
  } catch (error) {
    console.error('Error in getAdminArticlesAction:', error)
    return []
  }
}

export async function createAdminArticleAction(data: {
  title: string
  category: string
  summary: string
  readTime: string
  status?: 'Terbit' | 'Draf'
  author?: string
  imageUrl?: string
  content?: string
}): Promise<{ success: boolean; article?: HealthArticle; error?: string }> {
  try {
    const newId = `art_${Date.now().toString().slice(-4)}`
    const today = new Date().toISOString().split('T')[0]
    const defaultImageByCategory: Record<string, string> = {
      Hipertensi: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
      Diabetes: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1200&auto=format&fit=crop',
      Nutrisi: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
      'Gaya Hidup': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      Kardiovaskular: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=1200&auto=format&fit=crop',
    }
    const finalImageUrl = data.imageUrl?.trim() || defaultImageByCategory[data.category] || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop'
    const finalLead = data.summary
    const finalContent = data.content?.trim() || data.summary

    db.transaction(() => {
      db.prepare(`
        INSERT INTO articles (
          id, title, summary, lead_paragraph, image_url, read_time, category, status, views, published_at, author_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).run(
        newId,
        data.title,
        data.summary,
        finalLead,
        finalImageUrl,
        data.readTime,
        data.category,
        data.status || 'Terbit',
        today,
        data.author || 'dr. Sarah Jenkins, Sp.GK'
      )

      const paragraphs = finalContent.split('\n\n').map((p) => p.trim()).filter(Boolean)
      if (paragraphs.length > 0) {
        db.prepare(`
          INSERT INTO article_sections (article_id, order_index, heading, paragraphs)
          VALUES (?, 1, 'Pembahasan Edukasi', ?)
        `).run(newId, JSON.stringify(paragraphs))
      }
    })()

    const created: HealthArticle = {
      id: newId,
      title: data.title,
      category: data.category as HealthArticle['category'],
      author: data.author || 'dr. Sarah Jenkins, Sp.GK',
      publishDate: today,
      status: (data.status || 'Terbit') as HealthArticle['status'],
      views: 0,
      summary: data.summary,
      readTime: data.readTime,
      imageUrl: finalImageUrl,
      content: finalContent,
    }

    return { success: true, article: created }
  } catch (error: unknown) {
    console.error('Error creating article:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat artikel'
    return { success: false, error: errMsg }
  }
}

export async function updateAdminArticleAction(
  articleId: string,
  data: Partial<HealthArticle>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.transaction(() => {
      db.prepare(`
        UPDATE articles
        SET
          title = COALESCE(?, title),
          category = COALESCE(?, category),
          summary = COALESCE(?, summary),
          read_time = COALESCE(?, read_time),
          status = COALESCE(?, status),
          author_name = COALESCE(?, author_name),
          image_url = COALESCE(?, image_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        data.title ?? null,
        data.category ?? null,
        data.summary ?? null,
        data.readTime ?? null,
        data.status ?? null,
        data.author ?? null,
        data.imageUrl ?? null,
        articleId
      )

      if (data.content !== undefined) {
        const paragraphs = data.content.split('\n\n').map((p) => p.trim()).filter(Boolean)
        const existingSection = db.prepare(`SELECT id FROM article_sections WHERE article_id = ? ORDER BY order_index ASC LIMIT 1`).get(articleId) as { id: number } | undefined
        
        if (existingSection) {
          db.prepare(`UPDATE article_sections SET paragraphs = ? WHERE id = ?`).run(JSON.stringify(paragraphs), existingSection.id)
        } else if (paragraphs.length > 0) {
          db.prepare(`INSERT INTO article_sections (article_id, order_index, heading, paragraphs) VALUES (?, 1, 'Pembahasan Edukasi', ?)`).run(articleId, JSON.stringify(paragraphs))
        }
      }
    })()

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating article:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui artikel'
    return { success: false, error: errMsg }
  }
}

export async function deleteAdminArticleAction(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`DELETE FROM articles WHERE id = ?`).run(articleId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting article:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus artikel'
    return { success: false, error: errMsg }
  }
}
