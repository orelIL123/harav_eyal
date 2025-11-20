import { 
  getAllDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'

/**
 * Flyers Service - Manage flyers/announcements in Firestore
 */

/**
 * Get all flyers, optionally filtered by date
 */
export async function getFlyers() {
  try {
    const flyers = await getAllDocuments('flyers', [], 'date', 'desc')
    return flyers
  } catch (error) {
    console.error('Error getting flyers:', error)
    throw error
  }
}

/**
 * Get a single flyer by ID
 */
export async function getFlyer(flyerId) {
  try {
    return await getDocument('flyers', flyerId)
  } catch (error) {
    console.error('Error getting flyer:', error)
    throw error
  }
}

/**
 * Create a new flyer
 */
export async function createFlyer(flyerData) {
  try {
    // Handle date - convert Date to Timestamp if provided
    let date = null
    if (flyerData.date) {
      if (flyerData.date instanceof Date) {
        date = Timestamp.fromDate(flyerData.date)
      } else if (flyerData.date.toDate) {
        // Already a Firestore Timestamp
        date = flyerData.date
      } else {
        // Assume it's a string date, convert to Date then Timestamp
        date = Timestamp.fromDate(new Date(flyerData.date))
      }
    } else {
      date = serverTimestamp()
    }
    
    const flyer = {
      title: flyerData.title,
      pdfUrl: flyerData.pdfUrl || null,
      date: date,
      description: flyerData.description || null,
      isActive: flyerData.isActive !== undefined ? flyerData.isActive : true,
    }
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'flyers'), {
      ...flyer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error creating flyer:', error)
    throw error
  }
}

/**
 * Update an existing flyer
 */
export async function updateFlyer(flyerId, flyerData) {
  try {
    const updateData = { ...flyerData }
    
    // Handle date - convert Date to Timestamp if provided
    if (updateData.date) {
      if (updateData.date instanceof Date) {
        updateData.date = Timestamp.fromDate(updateData.date)
      } else if (!updateData.date.toDate && typeof updateData.date === 'string') {
        // If it's a string, convert to Date then Timestamp
        updateData.date = Timestamp.fromDate(new Date(updateData.date))
      }
    }
    
    // Add updatedAt timestamp
    updateData.updatedAt = serverTimestamp()
    
    await updateDocument('flyers', flyerId, updateData)
    return flyerId
  } catch (error) {
    console.error('Error updating flyer:', error)
    throw error
  }
}

/**
 * Delete a flyer
 */
export async function deleteFlyer(flyerId) {
  try {
    await deleteDocument('flyers', flyerId)
    return true
  } catch (error) {
    console.error('Error deleting flyer:', error)
    throw error
  }
}

