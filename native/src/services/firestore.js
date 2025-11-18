import { db } from '../config/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

/**
 * Generic Firestore helper functions
 */

/**
 * Get a single document
 */
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error(`Error getting document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * Get all documents from a collection
 */
export async function getDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'asc') {
  try {
    let q = collection(db, collectionName)
    
    // Apply filters
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value))
    })
    
    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection))
    }
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error)
    throw error
  }
}

/**
 * Create or update a document
 */
export async function setDocument(collectionName, docId, data, merge = true) {
  try {
    const docRef = doc(db, collectionName, docId)
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    if (merge) {
      await setDoc(docRef, dataWithTimestamp, { merge: true })
    } else {
      await setDoc(docRef, {
        ...dataWithTimestamp,
        createdAt: serverTimestamp()
      })
    }
    
    return docId
  } catch (error) {
    console.error(`Error setting document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * Update a document
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    return docId
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId) {
  try {
    const userDoc = await getDocument('users', userId)
    return userDoc?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

