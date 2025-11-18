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
 * Alerts Service - Manage alerts/notifications in Firestore
 */

/**
 * Get all alerts, optionally filtered by status
 */
export async function getAlerts(isActive = null) {
  try {
    const filters = []
    if (isActive !== null) {
      filters.push({ field: 'isActive', operator: '==', value: isActive })
    }
    
    const alerts = await getDocuments('alerts', filters, 'createdAt', 'desc')
    return alerts
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
      message: alertData.message,
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
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

