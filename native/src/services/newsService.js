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
    
    const news = await getDocuments('news', filters, 'publishedAt', 'desc')
    return news
  } catch (error) {
    console.error('Error getting news:', error)
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
      category: newsData.category || 'chidushim',
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

