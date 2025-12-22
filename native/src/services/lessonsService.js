import { 
  getDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getOrFetch, removeCached, CACHE_KEYS, CACHE_TTL } from '../utils/cache'

/**
 * Lessons Service - Manage lessons in Firestore
 */

/**
 * Get all lessons, optionally filtered by category
 */
export async function getLessons(category = null) {
  const cacheKey = category ? CACHE_KEYS.LESSONS_CATEGORY(category) : CACHE_KEYS.LESSONS_ALL
  
  const fetchLessons = async () => {
    try {
      const filters = []
      if (category) {
        filters.push({ field: 'category', operator: '==', value: category })
      }
      
      let result
      try {
        result = await getDocuments('lessons', filters, 'order', 'desc', 100)
      } catch (orderError) {
        console.log('Ordering by order failed, trying createdAt:', orderError)
        result = await getDocuments('lessons', filters, 'createdAt', 'desc', 100)
      }
      
      const lessons = result?.data || []
      
      lessons.sort((a, b) => {
        if (a.order && b.order) {
          return b.order - a.order
        }
        if (a.order && !b.order) return -1
        if (b.order && !a.order) return 1
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0))
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0))
        return bDate - aDate
      })
      
      if (category) {
        return lessons.filter(lesson => lesson.category === category)
      }
      
      return lessons
    } catch (error) {
      console.error('Error getting lessons:', error)
      throw error
    }
  }

  return getOrFetch(cacheKey, fetchLessons, CACHE_TTL.LONG)
}

/**
 * Get a single lesson by ID
 */
export async function getLesson(lessonId) {
  const cacheKey = `lesson_${lessonId}`
  const fetchLesson = () => getDocument('lessons', lessonId)
  try {
    return await getOrFetch(cacheKey, fetchLesson, CACHE_TTL.VERY_LONG)
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
    let videoId = lessonData.videoId
    if (!videoId && lessonData.url) {
      // ... (extraction logic remains the same)
    }
    
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
    
    const docRef = await addDoc(collection(db, 'lessons'), {
      ...lesson,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Invalidate cache
    await removeCached(CACHE_KEYS.LESSONS_CATEGORY(lessonData.category))
    await removeCached(CACHE_KEYS.LESSONS_ALL)
    
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
    let videoId = lessonData.videoId
    if (!videoId && lessonData.url) {
      // ... (extraction logic remains the same)
    }
    
    const updateData = {
      category: lessonData.category,
      title: lessonData.title,
      date: lessonData.date || '',
      videoId: videoId || '',
      url: lessonData.url,
      thumbnailUrl: lessonData.thumbnailUrl || null,
    }
    
    if (lessonData.order !== undefined) {
      updateData.order = lessonData.order
    }
    
    await updateDocument('lessons', lessonId, updateData)

    // Invalidate caches
    await removeCached(CACHE_KEYS.LESSONS_CATEGORY(lessonData.category))
    await removeCached(CACHE_KEYS.LESSONS_ALL)
    await removeCached(`lesson_${lessonId}`)
    
    return lessonId
  } catch (error) {
    console.error('Error updating lesson:', error)
    throw error
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId, category) {
  try {
    await deleteDocument('lessons', lessonId)
    
    // Invalidate caches
    if (category) {
      await removeCached(CACHE_KEYS.LESSONS_CATEGORY(category))
    }
    await removeCached(CACHE_KEYS.LESSONS_ALL)
    await removeCached(`lesson_${lessonId}`)

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

    // Invalidate cache for the category
    await removeCached(CACHE_KEYS.LESSONS_CATEGORY(category))
    await removeCached(CACHE_KEYS.LESSONS_ALL)

    return true
  } catch (error) {
    console.error('Error reordering lessons:', error)
    throw error
  }
}
