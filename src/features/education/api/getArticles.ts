import { Article } from '../types'

const MOCK_ARTICLES: Article[] = [
  {
    id: 'art_1',
    title: 'The Importance of Daily Hydration',
    summary: 'Learn why drinking enough water is crucial for your cellular health and energy levels.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
    readTime: '4 min read',
    category: 'Wellness',
    publishedAt: '2026-07-28'
  },
  {
    id: 'art_2',
    title: 'Managing Blood Pressure Naturally',
    summary: 'Discover dietary changes and exercises that can help maintain healthy blood pressure.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
    readTime: '6 min read',
    category: 'Cardiovascular',
    publishedAt: '2026-07-25'
  },
  {
    id: 'art_3',
    title: 'Understanding Vitamin D Deficiency',
    summary: 'How lack of sunlight affects your bone density and immune system, and what you can do.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    readTime: '5 min read',
    category: 'Nutrition',
    publishedAt: '2026-07-20'
  }
]

export const getArticles = async (): Promise<Article[]> => {
  await new Promise(resolve => setTimeout(resolve, 700))
  return MOCK_ARTICLES
}
