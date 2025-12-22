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
 * WhatsApp Groups Service - Manage WhatsApp group links
 */

/**
 * Get all WhatsApp groups
 */
export async function getWhatsAppGroups() {
  try {
    const result = await getDocuments('whatsappGroups', [
      { field: 'isActive', operator: '==', value: true }
    ], 'order', 'asc')
    return result?.data || []
  } catch (error) {
    console.error('Error getting WhatsApp groups:', error)
    return []
  }
}

/**
 * Get all WhatsApp groups (including inactive) - for admin
 */
export async function getAllWhatsAppGroups() {
  try {
    const result = await getDocuments('whatsappGroups', [], 'order', 'asc')
    return result?.data || []
  } catch (error) {
    console.error('Error getting all WhatsApp groups:', error)
    return []
  }
}

/**
 * Create a new WhatsApp group
 */
export async function createWhatsAppGroup(groupData) {
  try {
    const docRef = await addDoc(collection(db, 'whatsappGroups'), {
      ...groupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: docRef.id, ...groupData }
  } catch (error) {
    console.error('Error creating WhatsApp group:', error)
    throw error
  }
}

/**
 * Update a WhatsApp group
 */
export async function updateWhatsAppGroup(groupId, groupData) {
  try {
    await updateDocument('whatsappGroups', groupId, {
      ...groupData,
      updatedAt: serverTimestamp(),
    })
    return { id: groupId, ...groupData }
  } catch (error) {
    console.error('Error updating WhatsApp group:', error)
    throw error
  }
}

/**
 * Delete a WhatsApp group
 */
export async function deleteWhatsAppGroup(groupId) {
  try {
    await deleteDocument('whatsappGroups', groupId)
  } catch (error) {
    console.error('Error deleting WhatsApp group:', error)
    throw error
  }
}

/**
 * Get primary WhatsApp group (first active group)
 */
export async function getPrimaryWhatsAppGroup() {
  try {
    const groups = await getWhatsAppGroups()
    return groups.length > 0 ? groups[0] : null
  } catch (error) {
    console.error('Error getting primary WhatsApp group:', error)
    return null
  }
}
