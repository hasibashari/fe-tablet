'use server';

import db from '@/src/db/client';
import { HealthArticle, ArticleCategory } from '../types/admin.types';

function normalizeArticleCategory(raw?: string | null): ArticleCategory {
  const c = (raw || '').trim();
  if (c === 'Anemia' || c === 'TTD' || c.includes('Anemia') || c.includes('TTD')) {
    return 'Anemia & TTD';
  }
  if (c === 'Nutrisi' || c === 'Gizi' || c.includes('Nutrisi') || c.includes('Gizi')) {
    return 'Nutrisi & Gizi';
  }
  if (c.includes('Remaja')) {
    return 'Kesehatan Remaja';
  }
  if (c.includes('Menstruasi') || c.includes('Haid')) {
    return 'Tips Menstruasi';
  }
  if (c.includes('Mitos')) {
    return 'Mitos & Fakta';
  }
  if (c.includes('Gaya Hidup') || c.includes('Lifestyle')) {
    return 'Gaya Hidup';
  }
  return 'Anemia & TTD';
}

interface ArticleDbRow {
  id: string;
  title: string;
  category: string;
  author_name: string | null;
  published_at: string | Date;
  status: 'Terbit' | 'Draf';
  views: number;
  summary: string;
  lead_paragraph: string | null;
  image_url: string;
  read_time: string;
}

// ============================================================
// ARTICLES MANAGEMENT (ARTICLES CRUD & SECTIONS)
// ============================================================
export async function getAdminArticlesAction(): Promise<HealthArticle[]> {
  try {
    const res = await db.query<ArticleDbRow>(
      `SELECT * FROM articles ORDER BY published_at DESC, created_at DESC`,
    );
    const rows = res.rows;

    const result: HealthArticle[] = [];

    for (const r of rows) {
      let content = r.lead_paragraph || '';
      try {
        const sectionsRes = await db.query<{ paragraphs: string }>(
          `SELECT paragraphs FROM article_sections WHERE article_id = $1 ORDER BY order_index ASC`,
          [r.id],
        );
        if (sectionsRes.rows.length > 0) {
          const allParagraphs: string[] = [];
          for (const s of sectionsRes.rows) {
            if (s.paragraphs) {
              const parsed = JSON.parse(s.paragraphs);
              if (Array.isArray(parsed)) allParagraphs.push(...parsed);
            }
          }
          if (allParagraphs.length > 0) {
            content = allParagraphs.join('\n\n');
          }
        }
      } catch {
        // fallback to lead_paragraph
      }

      let publishDateStr = '2026-09-01';
      if (typeof r.published_at === 'string') {
        const d = new Date(r.published_at);
        publishDateStr =
          !isNaN(d.getTime()) && r.published_at.includes('-')
            ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : r.published_at;
      } else if (r.published_at && typeof r.published_at === 'object') {
        const d =
          r.published_at instanceof Date ? r.published_at : new Date(String(r.published_at));
        publishDateStr = !isNaN(d.getTime())
          ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          : '2026-09-01';
      }

      result.push({
        id: r.id,
        title: r.title,
        category: normalizeArticleCategory(r.category),
        author: r.author_name || 'dr. Sarah Jenkins',
        publishDate: publishDateStr,
        status: r.status as HealthArticle['status'],
        views: Number(r.views) || 0,
        summary: r.summary,
        readTime: r.read_time,
        imageUrl: r.image_url,
        content: content || r.summary,
      });
    }

    return result;
  } catch (error) {
    console.error('Error in getAdminArticlesAction:', error);
    return [];
  }
}

export async function createAdminArticleAction(data: {
  title: string;
  category: string;
  summary: string;
  readTime: string;
  status?: 'Terbit' | 'Draf';
  author?: string;
  imageUrl?: string;
  content?: string;
}): Promise<{ success: boolean; article?: HealthArticle; error?: string }> {
  try {
    const newId = `art_${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];
    const defaultImageByCategory: Record<string, string> = {
      'Anemia & TTD':
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
      'Nutrisi & Gizi':
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
      'Kesehatan Remaja':
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
      'Tips Menstruasi':
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
      'Mitos & Fakta':
        'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1200&auto=format&fit=crop',
      'Gaya Hidup':
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    };
    const finalImageUrl =
      data.imageUrl?.trim() ||
      defaultImageByCategory[data.category] ||
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop';
    const finalContent = data.content?.trim() || data.summary;

    await db.transaction(async client => {
      await client.query(
        `INSERT INTO articles (
          id, title, summary, lead_paragraph, image_url, read_time, category, status, views, published_at, author_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10)`,
        [
          newId,
          data.title,
          data.summary,
          finalContent,
          finalImageUrl,
          data.readTime,
          data.category,
          data.status || 'Terbit',
          today,
          data.author || 'Tim Ahli Gizi UKS',
        ],
      );

      const paragraphs = finalContent
        .split('\n\n')
        .map(p => p.trim())
        .filter(Boolean);
      if (paragraphs.length > 0) {
        await client.query(
          `INSERT INTO article_sections (article_id, order_index, heading, paragraphs)
           VALUES ($1, 1, 'Pembahasan Edukasi', $2)`,
          [newId, JSON.stringify(paragraphs)],
        );
      }
    });

    const created: HealthArticle = {
      id: newId,
      title: data.title,
      category: data.category as HealthArticle['category'],
      author: data.author || 'Tim Ahli Gizi UKS',
      publishDate: today,
      status: (data.status || 'Terbit') as HealthArticle['status'],
      views: 0,
      summary: data.summary,
      readTime: data.readTime,
      imageUrl: finalImageUrl,
      content: finalContent,
    };

    return { success: true, article: created };
  } catch (error: unknown) {
    console.error('Error creating article:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat artikel';
    return { success: false, error: errMsg };
  }
}

export async function updateAdminArticleAction(
  articleId: string,
  data: Partial<HealthArticle>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.transaction(async client => {
      await client.query(
        `UPDATE articles
         SET
           title = COALESCE($1, title),
           category = COALESCE($2, category),
           summary = COALESCE($3, summary),
           read_time = COALESCE($4, read_time),
           status = COALESCE($5, status),
           author_name = COALESCE($6, author_name),
           image_url = COALESCE($7, image_url),
           lead_paragraph = COALESCE($8, lead_paragraph),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [
          data.title ?? null,
          data.category ?? null,
          data.summary ?? null,
          data.readTime ?? null,
          data.status ?? null,
          data.author ?? null,
          data.imageUrl ?? null,
          data.content ?? null,
          articleId,
        ],
      );

      if (data.content !== undefined) {
        const paragraphs = data.content
          .split('\n\n')
          .map(p => p.trim())
          .filter(Boolean);
        const existingSectionRes = await client.query<{ id: number }>(
          `SELECT id FROM article_sections WHERE article_id = $1 ORDER BY order_index ASC LIMIT 1`,
          [articleId],
        );
        const existingSection = existingSectionRes.rows[0];

        if (existingSection) {
          await client.query(`UPDATE article_sections SET paragraphs = $1 WHERE id = $2`, [
            JSON.stringify(paragraphs),
            existingSection.id,
          ]);
        } else if (paragraphs.length > 0) {
          await client.query(
            `INSERT INTO article_sections (article_id, order_index, heading, paragraphs) VALUES ($1, 1, 'Pembahasan Edukasi', $2)`,
            [articleId, JSON.stringify(paragraphs)],
          );
        }
      }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating article:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui artikel';
    return { success: false, error: errMsg };
  }
}

export async function deleteAdminArticleAction(
  articleId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.query(`DELETE FROM articles WHERE id = $1`, [articleId]);
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting article:', error);
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus artikel';
    return { success: false, error: errMsg };
  }
}
