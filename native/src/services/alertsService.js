import { 
  getAllDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { getOrFetch, CACHE_KEYS, CACHE_TTL, removeCached } from '../utils/cache'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Alerts Service - Manage alerts/notifications in Firestore
 */

/**
 * Get all alerts, optionally filtered by status (with caching)
 */
export async function getAlerts(isActive = null) {
  try {
    const cacheKey = isActive !== null 
      ? `${CACHE_KEYS.ACTIVE_ALERTS}_${isActive}` 
      : CACHE_KEYS.ACTIVE_ALERTS
    
    return await getOrFetch(
      cacheKey,
      async () => {
        const filters = []
        if (isActive !== null) {
          filters.push({ field: 'isActive', operator: '==', value: isActive })
        }
        
        // Limit to 20 most recent alerts for cost optimization
        const alerts = await getAllDocuments('alerts', filters, 'createdAt', 'desc', 20)
        return alerts
      },
      CACHE_TTL.SHORT // 5 minutes - alerts change frequently
    )
  } catch (error) {
    console.error('Error getting alerts:', error)
    throw error
  }
}

/**
 * Get a single alert by ID
 */
export async function getAlert(alertId) {
  try {
    return await getDocument('alerts', alertId)
  } catch (error) {
    console.error('Error getting alert:', error)
    throw error
  }
}

/**
 * Create a new alert
 */
export async function createAlert(alertData) {
  try {
    const alert = {
      title: alertData.title,
      type: alertData.type || 'reminder',
      message: alertData.message || '',
      audioUrl: alertData.audioUrl || null,
      imageUrl: alertData.imageUrl || null,
      priority: alertData.priority || 'medium',
      sendType: alertData.sendType || 'immediate',
      scheduledTime: alertData.scheduledTime || null,
      targetAudience: alertData.targetAudience || ['all'],
      isActive: true,
      sentAt: null
    }
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'alerts'), {
      ...alert,
      expiresAt: alertData.expiresAt || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.ACTIVE_ALERTS)
    await removeCached(`${CACHE_KEYS.ACTIVE_ALERTS}_true`)
    
    return docRef.id
  } catch (error) {
    console.error('Error creating alert:', error)
    throw error
  }
}

/**
 * Update an existing alert
 */
export async function updateAlert(alertId, alertData) {
  try {
    await updateDocument('alerts', alertId, alertData)
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.ACTIVE_ALERTS)
    await removeCached(`${CACHE_KEYS.ACTIVE_ALERTS}_true`)
    await removeCached(`${CACHE_KEYS.ACTIVE_ALERTS}_false`)
    
    return alertId
  } catch (error) {
    console.error('Error updating alert:', error)
    throw error
  }
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId) {
  try {
    await deleteDocument('alerts', alertId)
    
    // Invalidate cache
    await removeCached(CACHE_KEYS.ACTIVE_ALERTS)
    await removeCached(`${CACHE_KEYS.ACTIVE_ALERTS}_true`)
    await removeCached(`${CACHE_KEYS.ACTIVE_ALERTS}_false`)
    
    return true
  } catch (error) {
    console.error('Error deleting alert:', error)
    throw error
  }
}

/**
 * Mark alert as sent
 */
export async function markAlertAsSent(alertId) {
  try {
    await updateDocument('alerts', alertId, {
      sentAt: serverTimestamp(),
      isActive: false
    })
    return true
  } catch (error) {
    console.error('Error marking alert as sent:', error)
    throw error
  }
}

/**
 * Get user-specific viewed alerts from local storage
 */
export async function getViewedAlerts() {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default)
    const viewed = await AsyncStorage.getItem('@viewed_alerts')
    return viewed ? JSON.parse(viewed) : []
  } catch (error) {
    console.error('Error getting viewed alerts:', error)
    return []
  }
}

/**
 * Mark alert as viewed by user
 */
export async function markAlertAsViewed(alertId) {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default)
    const viewed = await getViewedAlerts()
    if (!viewed.includes(alertId)) {
      viewed.push(alertId)
      await AsyncStorage.setItem('@viewed_alerts', JSON.stringify(viewed))
    }
    return true
  } catch (error) {
    console.error('Error marking alert as viewed:', error)
    throw error
  }
}

/**
 * Get unread alerts count
 */
export async function getUnreadAlertsCount() {
  try {
    const alerts = await getAlerts(true)
    const viewedAlerts = await getViewedAlerts()
    const unread = alerts.filter(alert => !viewedAlerts.includes(alert.id))
    return unread.length
  } catch (error) {
    console.error('Error getting unread alerts count:', error)
    return 0
  }
}

