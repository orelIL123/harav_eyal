import { 
  getAllDocuments,
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Community Posts Service - Manage community posts in Firestore
 */

/**
 * Get all community posts
 */
export async function getCommunityPosts() {
  try {
    const posts = await getAllDocuments('communityPosts', [], 'createdAt', 'desc')
    return posts
  } catch (error) {
    console.error('Error getting community posts:', error)
    throw error
  }
}

/**
 * Get a single community post by ID
 */
export async function getCommunityPost(postId) {
  try {
    return await getDocument('communityPosts', postId)
  } catch (error) {
    console.error('Error getting community post:', error)
    throw error
  }
}

/**
 * Create a new community post
 */
export async function createCommunityPost(postData) {
  try {
    const post = {
      title: postData.title,
      summary: postData.summary || '',
      imageUrl: postData.imageUrl || null,
      isEvent: postData.isEvent || false,
      date: postData.date ? new Date(postData.date) : new Date(),
      isActive: postData.isActive !== undefined ? postData.isActive : true,
    }
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'communityPosts'), {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating community post:', error)
    throw error
  }
}

/**
 * Update an existing community post
 */
export async function updateCommunityPost(postId, postData) {
  try {
    const updateData = {
      title: postData.title,
      summary: postData.summary || '',
      imageUrl: postData.imageUrl || null,
      isEvent: postData.isEvent || false,
      date: postData.date ? new Date(postData.date) : new Date(),
      isActive: postData.isActive !== undefined ? postData.isActive : true,
      updatedAt: serverTimestamp()
    }
    
    await updateDocument('communityPosts', postId, updateData)
    return postId
  } catch (error) {
    console.error('Error updating community post:', error)
    throw error
  }
}

/**
 * Delete a community post
 */
export async function deleteCommunityPost(postId) {
  try {
    await deleteDocument('communityPosts', postId)
    return true
  } catch (error) {
    console.error('Error deleting community post:', error)
    throw error
  }
}

