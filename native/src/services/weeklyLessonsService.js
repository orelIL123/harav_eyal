import { 
  getAllDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

/**
 * Weekly Lessons Service - Manage weekly lessons schedule in Firestore
 */

/**
 * Get all weekly lessons
 */
export async function getWeeklyLessons() {
  try {
    const lessons = await getAllDocuments('weeklyLessons', [], 'order', 'asc')
    return lessons || []
  } catch (error) {
    console.error('Error getting weekly lessons:', error)
    // Return empty array instead of throwing to prevent crashes
    return []
  }
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
  } catch (error) {
    console.error('Error deleting weekly lesson:', error)
    throw error
  }
}

