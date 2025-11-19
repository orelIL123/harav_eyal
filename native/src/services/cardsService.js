import { 
  getDocument, 
  getAllDocuments,
  setDocument, 
  updateDocument 
} from './firestore'
import { getOrFetch, CACHE_KEYS, CACHE_TTL, removeCached } from '../utils/cache'

/**
 * Cards Service - Manage home cards in Firestore
 */

/**
 * Get a card by key (with caching)
 */
export async function getCard(cardKey) {
  try {
    return await getOrFetch(
      `${CACHE_KEYS.HOME_CARDS}_${cardKey}`,
      async () => await getDocument('homeCards', cardKey),
      CACHE_TTL.MEDIUM // 10 minutes - cards don't change often
    )
  } catch (error) {
    console.error('Error getting card:', error)
    throw error
  }
}

/**
 * Get all cards (with caching)
 */
export async function getAllCards() {
  try {
    return await getOrFetch(
      CACHE_KEYS.HOME_CARDS,
      async () => await getAllDocuments('homeCards', [], 'order', 'asc', 20),
      CACHE_TTL.MEDIUM // 10 minutes
    )
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
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.HOME_CARDS)
    await removeCached(`${CACHE_KEYS.HOME_CARDS}_${cardKey}`)
    
    return cardKey
  } catch (error) {
    console.error('Error updating card:', error)
    throw error
  }
}

/**
 * Get app config header (with caching)
 */
export async function getAppConfig() {
  try {
    const config = await getOrFetch(
      CACHE_KEYS.APP_CONFIG,
      async () => await getDocument('appConfig', 'header'),
      CACHE_TTL.LONG // 15 minutes - config rarely changes
    )
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
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.APP_CONFIG)
    
    return true
  } catch (error) {
    console.error('Error updating app config:', error)
    throw error
  }
}

