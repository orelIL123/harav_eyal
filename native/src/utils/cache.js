import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Firebase Cost Optimization - Caching System
 * 
 * This cache system reduces Firestore reads by:
 * - Caching frequently accessed data
 * - Using TTL (Time To Live) for cache expiration
 * - Invalidating cache on updates
 */

const CACHE_PREFIX = '@firebase_cache:'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes default

/**
 * Get cached data
 */
export async function getCached(key, maxAge = DEFAULT_TTL) {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    const age = Date.now() - timestamp
    
    // Check if cache is still valid
    if (age > maxAge) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

/**
 * Set cached data
 */
export async function setCached(key, data, ttl = DEFAULT_TTL) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    }
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error writing cache:', error)
  }
}

/**
 * Remove cached data
 */
export async function removeCached(key) {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`)
  } catch (error) {
    console.error('Error removing cache:', error)
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache() {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
    await AsyncStorage.multiRemove(cacheKeys)
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  // Home screen data (cache for 10 minutes)
  HOME_CARDS: 'home_cards',
  APP_CONFIG: 'app_config',
  ACTIVE_ALERTS: 'active_alerts',
  
  // Lessons (cache for 15 minutes)
  LESSONS_ALL: 'lessons_all',
  LESSONS_CATEGORY: (category) => `lessons_${category}`,
  
  // News (cache for 10 minutes)
  NEWS_ALL: 'news_all',
  NEWS_PUBLISHED: 'news_published',
  
  // Daily videos (cache for 5 minutes - changes frequently)
  DAILY_VIDEOS: 'daily_videos',
  
  // Podcasts (cache for 15 minutes)
  PODCASTS_ALL: 'podcasts_all',
  PODCASTS_ACTIVE: 'podcasts_active',
  
  // Institutions (cache for 30 minutes - rarely changes)
  INSTITUTION: (activityId) => `institution_${activityId}`,
  
  // User data (cache for 5 minutes)
  USER: (userId) => `user_${userId}`,
  USER_ADMIN: (userId) => `user_admin_${userId}`,
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes - frequently changing data
  MEDIUM: 10 * 60 * 1000,    // 10 minutes - moderately changing data
  LONG: 15 * 60 * 1000,       // 15 minutes - rarely changing data
  VERY_LONG: 30 * 60 * 1000,  // 30 minutes - static data
}

/**
 * Helper to get or fetch with cache
 */
export async function getOrFetch(key, fetchFn, ttl = DEFAULT_TTL) {
  // Try cache first
  const cached = await getCached(key, ttl)
  if (cached !== null) {
    return cached
  }
  
  // Cache miss, fetch from Firestore
  const data = await fetchFn()
  
  // Cache the result
  if (data !== null && data !== undefined) {
    await setCached(key, data, ttl)
  }
  
  return data
}

