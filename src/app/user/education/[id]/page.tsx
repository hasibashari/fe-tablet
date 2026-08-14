import React from 'react'
import { ArticleDetailView } from '@/src/features/education'

interface EducationDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EducationDetailPage({ params }: EducationDetailPageProps) {
  const { id } = await params

  return (
    <main>
      <ArticleDetailView articleId={id} />
    </main>
  )
}
