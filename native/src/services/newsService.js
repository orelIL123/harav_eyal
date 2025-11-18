import { 
  getDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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
    const news = {
      title: newsData.title,
      category: newsData.category || 'chidushim',
      content: newsData.content,
      imageUrl: newsData.imageUrl || null,
      isPublished: newsData.isPublished || false,
      publishedAt: newsData.isPublished ? serverTimestamp() : null
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
    
    // If publishing for the first time, set publishedAt
    if (newsData.isPublished && !newsData.publishedAt) {
      updateData.publishedAt = serverTimestamp()
    }
    
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

