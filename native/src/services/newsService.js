import { 
  getDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { getOrFetch, removeCached, CACHE_KEYS, CACHE_TTL } from '../utils/cache'

/**
 * News Service - Manage news articles in Firestore
 */

/**
 * Get all news, optionally filtered by category or published status
 */
export async function getNews(category = null, isPublished = null) {
  const cacheKey = isPublished === null ? CACHE_KEYS.NEWS_ALL : CACHE_KEYS.NEWS_PUBLISHED
  const fetchNews = async () => {
    try {
      const filters = []
      if (category) {
        filters.push({ field: 'category', operator: '==', value: category })
      }
      if (isPublished !== null) {
        filters.push({ field: 'isPublished', operator: '==', value: isPublished })
      }
      
      let result
      try {
        result = await getDocuments('news', filters, 'publishedAt', 'desc', 100)
      } catch (orderError) {
        console.warn('Ordering by publishedAt failed, trying createdAt:', orderError)
        result = await getDocuments('news', filters, 'createdAt', 'desc', 100)
      }
      
      const news = (result?.data || []).sort((a, b) => {
        const aDate = a.publishedAt?.toDate ? a.publishedAt.toDate() : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0))
        const bDate = b.publishedAt?.toDate ? b.publishedAt.toDate() : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0))
        return bDate - aDate // Descending order
      })
      
      const filteredNews = isPublished === true 
        ? news.filter(article => article.isPublished === true)
        : news
      
      console.log(`📰 getNews: Found ${filteredNews.length} news articles (isPublished=${isPublished}, total=${news.length})`)
      console.log(`📰 Sample news:`, filteredNews.slice(0, 3).map(n => ({ id: n.id, title: n.title, isPublished: n.isPublished, hasImage: !!n.imageUrl })))
      
      return filteredNews
    } catch (error) {
      console.error('Error getting news:', error)
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('Permission denied for news - user may not be signed in')
        return []
      }
      throw error
    }
  }

  return getOrFetch(cacheKey, fetchNews, CACHE_TTL.MEDIUM)
}

/**
 * Get a single news article by ID
 */
export async function getNewsArticle(newsId) {
  const cacheKey = `news_${newsId}`
  const fetchArticle = () => getDocument('news', newsId)
  
  try {
    return await getOrFetch(cacheKey, fetchArticle, CACHE_TTL.LONG)
  } catch (error) {
    console.error('Error getting news article:', error)
    throw error
  }
}

/**
 * Create a new news article
 */
export async function createNews(newsData) {
  try {
    let publishedAt = null
    if (newsData.publishedAt) {
      if (newsData.publishedAt instanceof Date) {
        publishedAt = Timestamp.fromDate(newsData.publishedAt)
      } else if (newsData.publishedAt.toDate) {
        publishedAt = newsData.publishedAt
      } else {
        publishedAt = serverTimestamp()
      }
    } else if (newsData.isPublished) {
      publishedAt = serverTimestamp()
    }
    
    const news = {
      title: newsData.title,
      category: newsData.category || 'community',
      content: newsData.content,
      imageUrl: newsData.imageUrl || null,
      isPublished: newsData.isPublished || false,
      publishedAt: publishedAt
    }
    
    const docRef = await addDoc(collection(db, 'news'), {
      ...news,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Invalidate news cache
    await removeCached(CACHE_KEYS.NEWS_ALL)
    await removeCached(CACHE_KEYS.NEWS_PUBLISHED)
    
    return docRef.id
  } catch (error) {
    console.error('Error creating news:', error)
    throw error
  }
}

/**
 * Update an existing news article
 */
export async function updateNews(newsId, newsData) {
  try {
    const updateData = { ...newsData }
    
    if (updateData.publishedAt) {
      if (updateData.publishedAt instanceof Date) {
        updateData.publishedAt = Timestamp.fromDate(updateData.publishedAt)
      } else if (!updateData.publishedAt.toDate) {
        updateData.publishedAt = serverTimestamp()
      }
    } else if (newsData.isPublished && !updateData.publishedAt) {
      updateData.publishedAt = serverTimestamp()
    }
    
    updateData.updatedAt = serverTimestamp()
    
    await updateDocument('news', newsId, updateData)
    
    // Invalidate caches
    await removeCached(CACHE_KEYS.NEWS_ALL)
    await removeCached(CACHE_KEYS.NEWS_PUBLISHED)
    await removeCached(`news_${newsId}`)
    
    return newsId
  } catch (error) {
    console.error('Error updating news:', error)
    throw error
  }
}

/**
 * Delete a news article
 */
export async function deleteNews(newsId) {
  try {
    await deleteDocument('news', newsId)
    
    // Invalidate caches
    await removeCached(CACHE_KEYS.NEWS_ALL)
    await removeCached(CACHE_KEYS.NEWS_PUBLISHED)
    await removeCached(`news_${newsId}`)
    
    return true
  } catch (error) {
    console.error('Error deleting news:', error)
    throw error
  }
}

/**
 * Publish a news article
 */
export async function publishNews(newsId) {
  try {
    await updateDocument('news', newsId, {
      isPublished: true,
      publishedAt: serverTimestamp()
    })
    
    // Invalidate caches
    await removeCached(CACHE_KEYS.NEWS_ALL)
    await removeCached(CACHE_KEYS.NEWS_PUBLISHED)
    await removeCached(`news_${newsId}`)
    
    return true
  } catch (error) {
    console.error('Error publishing news:', error)
    throw error
  }
}
