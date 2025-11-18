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
    
    const lessons = await getDocuments('lessons', filters, 'order', 'desc')
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

