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
 * Get all active flyers (for regular users)
 * Filters by isActive == true to optimize query and match security rules
 * Documents without isActive field are handled by security rules (defaults to true)
 */
export async function getFlyers() {
  try {
    // Filter by isActive == true to optimize query
    // Security rules allow isActive != false (including missing/null), but querying for == true
    // is more efficient. Documents without isActive should have it set to true by default.
    const flyers = await getAllDocuments('flyers', [
      { field: 'isActive', operator: '==', value: true }
    ], 'date', 'desc')
    return flyers
  } catch (error) {
    console.error('Error getting flyers:', error)
    throw error
  }
}

/**
 * Get all flyers including inactive ones (for admins only)
 * Security rules will enforce admin access
 */
export async function getAllFlyersForAdmin() {
  try {
    // No filter - get all flyers (admins can see inactive ones)
    // Security rules will ensure only admins can access inactive flyers
    const flyers = await getAllDocuments('flyers', [], 'date', 'desc')
    return flyers
  } catch (error) {
    console.error('Error getting all flyers for admin:', error)
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
      imageUrl: flyerData.imageUrl || null,
      fileType: flyerData.fileType || (flyerData.pdfUrl ? 'pdf' : flyerData.imageUrl ? 'image' : null), // 'pdf' or 'image'
      date: date,
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

