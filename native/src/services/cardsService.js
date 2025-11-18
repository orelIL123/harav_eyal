import { 
  getDocument, 
  setDocument, 
  updateDocument 
} from './firestore'

/**
 * Cards Service - Manage home cards in Firestore
 */

/**
 * Get a card by key
 */
export async function getCard(cardKey) {
  try {
    return await getDocument('homeCards', cardKey)
  } catch (error) {
    console.error('Error getting card:', error)
    throw error
  }
}

/**
 * Get all cards
 */
export async function getAllCards() {
  try {
    const { getDocuments } = await import('./firestore')
    return await getDocuments('homeCards', [], 'order', 'asc')
  } catch (error) {
    console.error('Error getting cards:', error)
    throw error
  }
}

/**
 * Update a card
 */
export async function updateCard(cardKey, cardData) {
  try {
    await setDocument('homeCards', cardKey, cardData, true)
    return cardKey
  } catch (error) {
    console.error('Error updating card:', error)
    throw error
  }
}

/**
 * Get app config header
 */
export async function getAppConfig() {
  try {
    const config = await getDocument('appConfig', 'header')
    return config || { title: 'הרב אייל עמרמי', subtitle: "הודו לה' כי טוב" }
  } catch (error) {
    console.error('Error getting app config:', error)
    return { title: 'הרב אייל עמרמי', subtitle: "הודו לה' כי טוב" }
  }
}

/**
 * Update app config header
 */
export async function updateAppConfig(configData) {
  try {
    await setDocument('appConfig', 'header', configData, true)
    return true
  } catch (error) {
    console.error('Error updating app config:', error)
    throw error
  }
}

