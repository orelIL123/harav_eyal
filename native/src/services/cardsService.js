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
    // Try to get from 'header' first, fallback to 'config'
    let config = await getOrFetch(
      CACHE_KEYS.APP_CONFIG,
      async () => {
        // Try header first
        const headerConfig = await getDocument('appConfig', 'header')
        if (headerConfig) {
          return headerConfig
        }
        // Fallback to config
        const mainConfig = await getDocument('appConfig', 'config')
        if (mainConfig) {
          // Extract title and subtitle from config
          return {
            title: mainConfig.headerTitle || mainConfig.title || 'הרב אייל עמרמי',
            subtitle: mainConfig.headerSubtitle || mainConfig.subtitle || "הודו לה' כי טוב"
          }
        }
        return null
      },
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

/**
 * Update daily insight last updated timestamp
 */
export async function updateDailyInsightLastUpdated() {
  try {
    const { db } = await import('../config/firebase')
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    
    // Update appConfig with current timestamp
    await setDoc(doc(db, 'appConfig', 'config'), {
      dailyInsightLastUpdated: serverTimestamp()
    }, { merge: true })
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.APP_CONFIG)
    
    return true
  } catch (error) {
    console.error('Error updating daily insight last updated:', error)
    throw error
  }
}

/**
 * Get daily insight last updated timestamp
 */
export async function getDailyInsightLastUpdated() {
  try {
    const config = await getDocument('appConfig', 'config')
    if (!config || !config.dailyInsightLastUpdated) return null

    const lastUpdated = config.dailyInsightLastUpdated
    return lastUpdated.toDate ? lastUpdated.toDate() : new Date(lastUpdated)
  } catch (error) {
    console.error('Error getting daily insight last updated:', error)
    return null
  }
}

/**
 * Get daily insight content (with caching)
 */
export async function getDailyInsightContent() {
  try {
    return await getOrFetch(
      CACHE_KEYS.DAILY_INSIGHT_CONTENT,
      async () => await getDocument('dailyInsight', 'current'),
      CACHE_TTL.SHORT // 5 minutes - daily content may change
    )
  } catch (error) {
    console.error('Error getting daily insight content:', error)
    return null
  }
}

/**
 * Save daily insight content
 */
export async function saveDailyInsightContent(contentData) {
  try {
    await setDocument('dailyInsight', 'current', {
      ...contentData,
      updatedAt: new Date().toISOString()
    }, true)

    // Invalidate cache
    await removeCached(CACHE_KEYS.DAILY_INSIGHT_CONTENT)

    // Update the last updated timestamp
    await updateDailyInsightLastUpdated()

    return true
  } catch (error) {
    console.error('Error saving daily insight content:', error)
    throw error
  }
}

