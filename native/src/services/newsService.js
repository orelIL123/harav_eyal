import { 
  getDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

/**
 * News Service - Manage news articles in Firestore
 */

/**
 * Get all news, optionally filtered by category or published status
 */
export async function getNews(category = null, isPublished = null) {
  try {
    const filters = []
    if (category) {
      filters.push({ field: 'category', operator: '==', value: category })
    }
    if (isPublished !== null) {
      filters.push({ field: 'isPublished', operator: '==', value: isPublished })
    }
    
    // Try to get documents ordered by publishedAt, but handle missing publishedAt
    let result
    try {
      result = await getDocuments('news', filters, 'publishedAt', 'desc', 100)
    } catch (orderError) {
      // If ordering by publishedAt fails (some docs might not have it), try createdAt
      console.warn('Ordering by publishedAt failed, trying createdAt:', orderError)
      result = await getDocuments('news', filters, 'createdAt', 'desc', 100)
    }
    
    // Sort manually to handle cases where publishedAt might be null
    const news = (result?.data || []).sort((a, b) => {
      const aDate = a.publishedAt?.toDate ? a.publishedAt.toDate() : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0))
      const bDate = b.publishedAt?.toDate ? b.publishedAt.toDate() : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0))
      return bDate - aDate // Descending order
    })
    
    // Additional filter to ensure only published news if requested
    const filteredNews = isPublished === true 
      ? news.filter(article => article.isPublished === true)
      : news
    
    console.log(`📰 getNews: Found ${filteredNews.length} news articles (isPublished=${isPublished}, total=${news.length})`)
    console.log(`📰 Sample news:`, filteredNews.slice(0, 3).map(n => ({ id: n.id, title: n.title, isPublished: n.isPublished, hasImage: !!n.imageUrl })))
    
    return filteredNews
  } catch (error) {
    console.error('Error getting news:', error)
    // Return empty array instead of throwing - allows UI to show empty state
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.warn('Permission denied for news - user may not be signed in')
      return []
    }
    throw error
  }
}

/**
 * Get a single news article by ID
 */
export async function getNewsArticle(newsId) {
  try {
    return await getDocument('news', newsId)
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
    // Handle publishedAt date - convert Date to Timestamp if provided
    let publishedAt = null
    if (newsData.publishedAt) {
      if (newsData.publishedAt instanceof Date) {
        publishedAt = Timestamp.fromDate(newsData.publishedAt)
      } else if (newsData.publishedAt.toDate) {
        // Already a Firestore Timestamp
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
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'news'), {
      ...news,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
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
    
    // Handle publishedAt date - convert Date to Timestamp if provided
    if (updateData.publishedAt) {
      if (updateData.publishedAt instanceof Date) {
        updateData.publishedAt = Timestamp.fromDate(updateData.publishedAt)
      } else if (!updateData.publishedAt.toDate) {
        // If it's not a Date and not a Timestamp, use serverTimestamp
        updateData.publishedAt = serverTimestamp()
      }
    } else if (newsData.isPublished && !updateData.publishedAt) {
      // If publishing for the first time and no date provided, set publishedAt
      updateData.publishedAt = serverTimestamp()
    }
    
    // Add updatedAt timestamp
    updateData.updatedAt = serverTimestamp()
    
    await updateDocument('news', newsId, updateData)
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
    return true
  } catch (error) {
    console.error('Error publishing news:', error)
    throw error
  }
}

