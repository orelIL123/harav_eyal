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
 * Lessons Service - Manage lessons in Firestore
 */

/**
 * Get all lessons, optionally filtered by category
 */
export async function getLessons(category = null) {
  try {
    const filters = []
    if (category) {
      filters.push({ field: 'category', operator: '==', value: category })
    }
    
    // Try to order by 'order' field first, fallback to 'createdAt' if order doesn't exist
    // Increase limit to get all lessons (up to 100)
    let result
    try {
      result = await getDocuments('lessons', filters, 'order', 'desc', 100)
    } catch (orderError) {
      // If ordering by 'order' fails (e.g., no index or field missing), try 'createdAt'
      console.log('Ordering by order failed, trying createdAt:', orderError)
      result = await getDocuments('lessons', filters, 'createdAt', 'desc', 100)
    }
    
    const lessons = result?.data || []
    
    // Sort lessons: those with order field first (descending), then by createdAt
    lessons.sort((a, b) => {
      // If both have order, sort by order
      if (a.order && b.order) {
        return b.order - a.order
      }
      // If only one has order, it comes first
      if (a.order && !b.order) return -1
      if (b.order && !a.order) return 1
      // If neither has order, sort by createdAt
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0))
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0))
      return bDate - aDate
    })
    
    // Additional client-side filtering to ensure category match
    // This handles cases where category field might be missing or incorrect
    if (category) {
      return lessons.filter(lesson => lesson.category === category)
    }
    
    return lessons
  } catch (error) {
    console.error('Error getting lessons:', error)
    throw error
  }
}

/**
 * Get a single lesson by ID
 */
export async function getLesson(lessonId) {
  try {
    return await getDocument('lessons', lessonId)
  } catch (error) {
    console.error('Error getting lesson:', error)
    throw error
  }
}

/**
 * Add a new lesson
 */
export async function addLesson(lessonData) {
  try {
    // Extract videoId from URL if not provided
    let videoId = lessonData.videoId
    if (!videoId && lessonData.url) {
      const match = lessonData.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (match && match[1]) {
        videoId = match[1]
      }
    }
    
    // Get the next order number
    const allLessons = await getLessons(lessonData.category)
    const maxOrder = allLessons.length > 0 
      ? Math.max(...allLessons.map(l => l.order || 0))
      : 0
    
    const lesson = {
      category: lessonData.category,
      title: lessonData.title,
      date: lessonData.date || '',
      videoId: videoId || '',
      url: lessonData.url,
      thumbnailUrl: lessonData.thumbnailUrl || null,
      order: maxOrder + 1
    }
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'lessons'), {
      ...lesson,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding lesson:', error)
    throw error
  }
}

/**
 * Update an existing lesson
 */
export async function updateLesson(lessonId, lessonData) {
  try {
    // Extract videoId from URL if not provided
    let videoId = lessonData.videoId
    if (!videoId && lessonData.url) {
      const match = lessonData.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (match && match[1]) {
        videoId = match[1]
      }
    }
    
    const updateData = {
      category: lessonData.category,
      title: lessonData.title,
      date: lessonData.date || '',
      videoId: videoId || '',
      url: lessonData.url,
      thumbnailUrl: lessonData.thumbnailUrl || null,
    }
    
    // Keep order if not changing category
    if (lessonData.order !== undefined) {
      updateData.order = lessonData.order
    }
    
    await updateDocument('lessons', lessonId, updateData)
    return lessonId
  } catch (error) {
    console.error('Error updating lesson:', error)
    throw error
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId) {
  try {
    await deleteDocument('lessons', lessonId)
    return true
  } catch (error) {
    console.error('Error deleting lesson:', error)
    throw error
  }
}

/**
 * Reorder lessons in a category
 */
export async function reorderLessons(category, lessonIds) {
  try {
    const updates = lessonIds.map((lessonId, index) => 
      updateDocument('lessons', lessonId, { order: index + 1 })
    )
    await Promise.all(updates)
    return true
  } catch (error) {
    console.error('Error reordering lessons:', error)
    throw error
  }
}

