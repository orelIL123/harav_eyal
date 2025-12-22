import { 
  getDocuments, 
  getDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

/**
 * Faith Stories Service - Manage faith stories (text/video) in Firestore
 */

/**
 * Get all faith stories
 */
export async function getFaithStories() {
  try {
    // Filter by isActive == true and order by createdAt desc
    const result = await getDocuments(
      'faith_stories', 
      [{ field: 'isActive', operator: '==', value: true }], 
      'createdAt', 
      'desc'
    )
    return result?.data || []
  } catch (error) {
    console.error('Error getting faith stories:', error)
    // Return empty array instead of throwing - allows UI to show empty state
    // Permission errors will be handled gracefully
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.warn('Permission denied for faith_stories - user may not be signed in or collection may not exist')
      return []
    }
    throw error
  }
}

/**
 * Create a new faith story
 * @param {Object} storyData
 * @param {string} storyData.type - 'text' or 'video'
 * @param {string} storyData.title
 * @param {string} storyData.content - text content or description
 * @param {string} storyData.mediaUrl - url for video or background image
 * @param {string} storyData.thumbnailUrl - optional thumbnail for video
 */
export async function createFaithStory(storyData) {
  try {
    const story = {
      type: storyData.type || 'text', // text, video
      title: storyData.title || '',
      content: storyData.content || '',
      mediaUrl: storyData.mediaUrl || null,
      thumbnailUrl: storyData.thumbnailUrl || null,
      duration: storyData.duration || 0,
      author: storyData.author || 'הרב אייל עמרמי',
      likes: 0,
      views: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'faith_stories'), story)
    return docRef.id
  } catch (error) {
    console.error('Error creating faith story:', error)
    throw error
  }
}

/**
 * Update a faith story
 */
export async function updateFaithStory(storyId, storyData) {
  try {
    const updateData = { 
      ...storyData,
      updatedAt: serverTimestamp() 
    }
    
    await updateDocument('faith_stories', storyId, updateData)
    return storyId
  } catch (error) {
    console.error('Error updating faith story:', error)
    throw error
  }
}

/**
 * Delete a faith story
 */
export async function deleteFaithStory(storyId) {
  try {
    await deleteDocument('faith_stories', storyId)
    return true
  } catch (error) {
    console.error('Error deleting faith story:', error)
    throw error
  }
}

/**
 * Increment views
 */
export async function incrementStoryViews(storyId, currentViews) {
  try {
    await updateDocument('faith_stories', storyId, {
      views: (currentViews || 0) + 1
    })
  } catch (error) {
    console.error('Error incrementing views:', error)
  }
}

