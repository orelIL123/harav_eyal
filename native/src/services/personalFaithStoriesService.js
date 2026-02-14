import {
  getAllDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const COLLECTION = 'personalFaithStories'

/**
 * Get all personal faith stories (text only), newest first
 */
export async function getPersonalFaithStories() {
  try {
    const stories = await getAllDocuments(COLLECTION, [], 'createdAt', 'desc', 100)
    return (stories || []).filter(s => s.isActive !== false)
  } catch (error) {
    console.error('Error getting personal faith stories:', error)
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      return []
    }
    throw error
  }
}

/**
 * Get a single story by ID
 */
export async function getPersonalFaithStory(storyId) {
  try {
    return await getDocument(COLLECTION, storyId)
  } catch (error) {
    console.error('Error getting personal faith story:', error)
    throw error
  }
}

/**
 * Create a new personal faith story (text only)
 * @param {{ content: string, authorDisplayName?: string }} data
 */
export async function createPersonalFaithStory(data) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      content: data.content || '',
      authorDisplayName: data.authorDisplayName || 'אנונימי',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating personal faith story:', error)
    throw error
  }
}

/**
 * Update a story (e.g. admin hide)
 */
export async function updatePersonalFaithStory(storyId, updateData) {
  try {
    await updateDocument(COLLECTION, storyId, updateData)
    return storyId
  } catch (error) {
    console.error('Error updating personal faith story:', error)
    throw error
  }
}

/**
 * Delete a story
 */
export async function deletePersonalFaithStory(storyId) {
  try {
    await deleteDocument(COLLECTION, storyId)
    return true
  } catch (error) {
    console.error('Error deleting personal faith story:', error)
    throw error
  }
}
