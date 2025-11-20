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
 * Podcasts Service - Manage podcasts in Firestore
 */

/**
 * Get all podcasts, optionally filtered by category
 */
export async function getPodcasts(category = null) {
  try {
    const filters = []
    if (category) {
      filters.push({ field: 'category', operator: '==', value: category })
    }
    
    // Only active podcasts
    filters.push({ field: 'isActive', operator: '==', value: true })
    
    const result = await getDocuments('podcasts', filters, 'order', 'desc')
    return result?.data || []
  } catch (error) {
    console.error('Error getting podcasts:', error)
    throw error
  }
}

/**
 * Get all podcasts (including inactive) - for admin
 */
export async function getAllPodcasts() {
  try {
    const result = await getDocuments('podcasts', [], 'createdAt', 'desc')
    return result?.data || []
  } catch (error) {
    console.error('Error getting all podcasts:', error)
    // Return empty array on error instead of throwing
    return []
  }
}

/**
 * Get a single podcast by ID
 */
export async function getPodcast(podcastId) {
  try {
    return await getDocument('podcasts', podcastId)
  } catch (error) {
    console.error('Error getting podcast:', error)
    throw error
  }
}

/**
 * Create a new podcast
 */
export async function createPodcast(podcastData) {
  try {
    // Get the next order number
    const allPodcasts = await getAllPodcasts()
    const maxOrder = allPodcasts.length > 0 
      ? Math.max(...allPodcasts.map(p => p.order || 0))
      : 0
    
    const podcast = {
      title: podcastData.title,
      description: podcastData.description || '',
      audioUrl: podcastData.audioUrl || '',
      duration: podcastData.duration || 0,
      thumbnailUrl: podcastData.thumbnailUrl || null,
      category: podcastData.category || null,
      order: maxOrder + 1,
      isActive: podcastData.isActive !== undefined ? podcastData.isActive : true
    }
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'podcasts'), {
      ...podcast,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error creating podcast:', error)
    throw error
  }
}

/**
 * Update an existing podcast
 */
export async function updatePodcast(podcastId, podcastData) {
  try {
    await updateDocument('podcasts', podcastId, podcastData)
    return podcastId
  } catch (error) {
    console.error('Error updating podcast:', error)
    throw error
  }
}

/**
 * Delete a podcast
 */
export async function deletePodcast(podcastId) {
  try {
    await deleteDocument('podcasts', podcastId)
    return true
  } catch (error) {
    console.error('Error deleting podcast:', error)
    throw error
  }
}


/**
 * Upload audio file to Storage
 */
export async function uploadPodcastAudio(uri, podcastId, onProgress) {
  try {
    const { storage } = await import('../config/firebase')
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')

    // Fetch the audio file
    const response = await fetch(uri)
    const blob = await response.blob()

    // Create storage reference
    const path = `podcasts/${podcastId}/audio.mp3`
    const storageRef = ref(storage, path)

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(Math.round(progress))
          }
        },
        (error) => {
          console.error('Error uploading audio:', error)
          reject(error)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        }
      )
    })
  } catch (error) {
    console.error('Error uploading podcast audio:', error)
    throw error
  }
}

/**
 * Upload thumbnail to Storage
 */
export async function uploadPodcastThumbnail(uri, podcastId, onProgress) {
  try {
    const { uploadImageToStorage } = await import('../utils/storage')
    const path = `podcasts/${podcastId}/thumbnail.jpg`
    const url = await uploadImageToStorage(uri, path, onProgress)
    return url
  } catch (error) {
    console.error('Error uploading podcast thumbnail:', error)
    throw error
  }
}

