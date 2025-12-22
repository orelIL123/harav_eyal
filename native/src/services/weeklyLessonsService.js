import { 
  getAllDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { getOrFetch, removeCached, CACHE_TTL } from '../utils/cache'

const WEEKLY_LESSONS_CACHE_KEY = 'weekly_lessons'

/**
 * Weekly Lessons Service - Manage weekly lessons schedule in Firestore
 */

/**
 * Get all weekly lessons
 */
export async function getWeeklyLessons() {
  const fetcher = async () => {
    try {
      const lessons = await getAllDocuments('weeklyLessons', [], 'order', 'asc')
      return lessons || []
    } catch (error) {
      console.error('Error getting weekly lessons:', error)
      return []
    }
  }

  // Weekly lessons don't change often, use a very long cache TTL
  return getOrFetch(WEEKLY_LESSONS_CACHE_KEY, fetcher, CACHE_TTL.VERY_LONG)
}

/**
 * Create a new weekly lesson
 */
export async function createWeeklyLesson(lessonData) {
  try {
    const lesson = {
      city: lessonData.city,
      location: lessonData.location,
      day: lessonData.day,
      time: lessonData.time,
      address: lessonData.address,
      order: lessonData.order || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    
    const docRef = await addDoc(collection(db, 'weeklyLessons'), lesson)
    
    // Invalidate cache
    await removeCached(WEEKLY_LESSONS_CACHE_KEY)

    return { id: docRef.id, ...lesson }
  } catch (error) {
    console.error('Error creating weekly lesson:', error)
    throw error
  }
}

/**
 * Update an existing weekly lesson
 */
export async function updateWeeklyLesson(lessonId, lessonData) {
  try {
    const updateData = {
      ...lessonData,
      updatedAt: serverTimestamp(),
    }
    
    await updateDocument('weeklyLessons', lessonId, updateData)

    // Invalidate cache
    await removeCached(WEEKLY_LESSONS_CACHE_KEY)

    return { id: lessonId, ...updateData }
  } catch (error) {
    console.error('Error updating weekly lesson:', error)
    throw error
  }
}

/**
 * Delete a weekly lesson
 */
export async function deleteWeeklyLesson(lessonId) {
  try {
    await deleteDocument('weeklyLessons', lessonId)

    // Invalidate cache
    await removeCached(WEEKLY_LESSONS_CACHE_KEY)
    
  } catch (error) {
    console.error('Error deleting weekly lesson:', error)
    throw error
  }
}

