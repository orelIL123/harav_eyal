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
    return content || { activityId, title: '', content: '' }
  } catch (error) {
    console.error('Error getting institution content:', error)
    return { activityId, title: '', content: '' }
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
      content: contentData.content || '',
      updatedBy: userId || null
    }
    
    await setDocument('institutionsContent', activityId, data, true)
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

