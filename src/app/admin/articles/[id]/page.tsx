import React from 'react'
import { ArticleDetailView } from '@/src/features/education'

interface AdminArticleDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminArticleDetailPage({ params }: AdminArticleDetailPageProps) {
  const { id } = await params

  return (
    <main>
      <ArticleDetailView articleId={id} backHref="/admin/articles" />
    </main>
  )
}
