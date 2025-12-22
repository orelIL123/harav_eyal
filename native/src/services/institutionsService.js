import { 
  getDocument, 
  setDocument, 
  updateDocument 
} from './firestore'

/**
 * Institutions Service - Manage institution content in Firestore
 */

/**
 * Get content for a specific activity
 */
export async function getInstitutionContent(activityId) {
  try {
    const content = await getDocument('institutionsContent', activityId)
    if (!content) {
      return { activityId, title: '', content: '', description: '', imageUrl: null }
    }
    // Support both 'content' and 'description' fields for backward compatibility
    return {
      activityId,
      title: content.title || '',
      content: content.content || content.description || '',
      description: content.description || content.content || '',
      imageUrl: content.imageUrl || null
    }
  } catch (error) {
    console.error('Error getting institution content:', error)
    return { activityId, title: '', content: '', description: '', imageUrl: null }
  }
}

/**
 * Save content for a specific activity
 */
export async function saveInstitutionContent(activityId, contentData, userId = null) {
  try {
    const data = {
      activityId,
      title: contentData.title || '',
      content: contentData.content || contentData.description || '', // Support both 'content' and 'description'
      description: contentData.description || contentData.content || '', // Support both fields
      imageUrl: contentData.imageUrl || null,
      updatedBy: userId || null
    }
    
    await setDocument('institutionsContent', activityId, data, true)
    
    // Invalidate any potential cache (if caching is added in the future)
    const { removeCached, CACHE_KEYS } = await import('../utils/cache')
    await removeCached(CACHE_KEYS.INSTITUTION(activityId))
    
    return activityId
  } catch (error) {
    console.error('Error saving institution content:', error)
    throw error
  }
}

/**
 * Get all institution contents
 */
export async function getAllInstitutionContents() {
  try {
    const { getDocuments } = await import('./firestore')
    const result = await getDocuments('institutionsContent')
    return result?.data || []
  } catch (error) {
    console.error('Error getting all institution contents:', error)
    throw error
  }
}

