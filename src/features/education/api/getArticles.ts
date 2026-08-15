import { Article } from '../types'
import {
  getArticlesAction,
  getArticleByIdAction,
  getRelatedArticlesAction,
  toggleArticleBookmarkAction,
  isArticleBookmarkedAction,
} from './educationRepository'

export const getArticles = async (category?: string): Promise<Article[]> => {
  return await getArticlesAction(category)
}

export const getArticleById = async (id: string): Promise<Article | null> => {
  return await getArticleByIdAction(id)
}

export const getRelatedArticles = async (currentId: string, limit: number = 3): Promise<Article[]> => {
  return await getRelatedArticlesAction(currentId, limit)
}

export const toggleArticleBookmark = async (userId: string, articleId: string) => {
  return await toggleArticleBookmarkAction(userId, articleId)
}

export const isArticleBookmarked = async (userId: string, articleId: string) => {
  return await isArticleBookmarkedAction(userId, articleId)
}
