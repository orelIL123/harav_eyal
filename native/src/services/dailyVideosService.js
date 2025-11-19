import { 
  getAllDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { getOrFetch, CACHE_KEYS, CACHE_TTL, removeCached } from '../utils/cache'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'

/**
 * Daily Videos Service - Manage daily insight videos/stories in Firestore
 * Videos expire after 24 hours
 */

/**
 * Get all active daily videos (not expired) - with caching
 */
export async function getDailyVideos() {
  try {
    return await getOrFetch(
      CACHE_KEYS.DAILY_VIDEOS,
      async () => {
        const now = new Date()
        // Limit to 20 most recent videos
        const videos = await getAllDocuments('dailyVideos', [], 'createdAt', 'desc', 20)
        
        // Filter out expired videos (older than 24 hours)
        const validVideos = videos.filter(video => {
          if (!video.createdAt) return false
          const createdAt = video.createdAt.toDate ? video.createdAt.toDate() : new Date(video.createdAt)
          const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60)
          return hoursSinceCreation < 24
        })
        
        return validVideos
      },
      CACHE_TTL.SHORT // 5 minutes - videos change frequently
    )
  } catch (error) {
    console.error('Error getting daily videos:', error)
    throw error
  }
}

/**
 * Get videos for a specific date
 */
export async function getDailyVideosByDate(date) {
  try {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
    const filters = [
      { field: 'date', operator: '==', value: dateStr }
    ]
    
    const videos = await getDocuments('dailyVideos', filters, 'createdAt', 'desc')
    return videos
  } catch (error) {
    console.error('Error getting daily videos by date:', error)
    throw error
  }
}

/**
 * Get a single video by ID
 */
export async function getDailyVideo(videoId) {
  try {
    return await getDocument('dailyVideos', videoId)
  } catch (error) {
    console.error('Error getting daily video:', error)
    throw error
  }
}

/**
 * Create a new daily video
 */
export async function createDailyVideo(videoData) {
  try {
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    
    const video = {
      title: videoData.title || 'זריקת אמונה יומית',
      description: videoData.description || '',
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl || null,
      date: dateStr,
      isActive: true,
    }
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'dailyVideos'), {
      ...video,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.DAILY_VIDEOS)
    
    return docRef.id
  } catch (error) {
    console.error('Error creating daily video:', error)
    throw error
  }
}

/**
 * Update an existing daily video
 */
export async function updateDailyVideo(videoId, videoData) {
  try {
    const updateData = { ...videoData }
    await updateDocument('dailyVideos', videoId, updateData)
    return videoId
  } catch (error) {
    console.error('Error updating daily video:', error)
    throw error
  }
}

/**
 * Delete a daily video
 */
export async function deleteDailyVideo(videoId) {
  try {
    await deleteDocument('dailyVideos', videoId)
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.DAILY_VIDEOS)
    
    return true
  } catch (error) {
    console.error('Error deleting daily video:', error)
    throw error
  }
}

/**
 * Clean up expired videos (older than 24 hours)
 */
export async function cleanupExpiredVideos() {
  try {
    const now = new Date()
    const allVideos = await getAllDocuments('dailyVideos', [], 'createdAt', 'desc', 100)
    
    const expiredVideos = allVideos.filter(video => {
      if (!video.createdAt) return false
      const createdAt = video.createdAt.toDate ? video.createdAt.toDate() : new Date(video.createdAt)
      const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60)
      return hoursSinceCreation >= 24
    })
    
    // Delete expired videos (use batch if many)
    if (expiredVideos.length > 0) {
      const { batchWrite } = await import('./firestore')
      
      if (expiredVideos.length <= 500) {
        // Use batch write for efficiency
        await batchWrite(
          expiredVideos.map(video => ({
            type: 'delete',
            collection: 'dailyVideos',
            docId: video.id
          }))
        )
      } else {
        // Too many, delete in chunks
        for (const video of expiredVideos) {
          try {
            await deleteDocument('dailyVideos', video.id)
          } catch (error) {
            console.error(`Error deleting expired video ${video.id}:`, error)
          }
        }
      }
      
      // Invalidate cache
      await removeCached(CACHE_KEYS.DAILY_VIDEOS)
    }
    
    return expiredVideos.length
  } catch (error) {
    console.error('Error cleaning up expired videos:', error)
    throw error
  }
}

