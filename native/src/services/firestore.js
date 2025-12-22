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
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  writeBatch
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
    console.log(`📖 Fetching document: ${collectionName}/${docId}`)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() }
      console.log(`✅ Document found: ${collectionName}/${docId}`, data)
      return data
    }
    console.log(`⚠️ Document not found: ${collectionName}/${docId}`)
    return null
  } catch (error) {
    console.error(`❌ Error getting document ${collectionName}/${docId}:`, error)
    console.error(`   Error code: ${error.code}`)
    console.error(`   Error message: ${error.message}`)
    throw error
  }
}

/**
 * Get all documents from a collection with pagination and limits
 * @param {string} collectionName - Collection name
 * @param {Array} filters - Array of filter objects {field, operator, value}
 * @param {string} orderByField - Field to order by
 * @param {string} orderDirection - 'asc' or 'desc'
 * @param {number} maxResults - Maximum number of results (default: 50, max: 100)
 * @param {DocumentSnapshot} lastDoc - Last document for pagination
 */
export async function getDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'asc', maxResults = 50, lastDoc = null) {
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
    
    // Apply limit (Firestore max is 100, but we use 50 as default for cost optimization)
    const limitValue = Math.min(maxResults, 100)
    q = query(q, limit(limitValue))
    
    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const querySnapshot = await getDocs(q)
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Return documents and last doc for pagination
    return {
      data: documents,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === limitValue
    }
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error)
    throw error
  }
}

/**
 * Get all documents (backward compatible - returns array directly)
 * For new code, use getDocumentsPaginated
 */
export async function getAllDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'asc', maxResults = 50) {
  const result = await getDocuments(collectionName, filters, orderByField, orderDirection, maxResults)
  return result.data
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
 * Check if user is admin (with caching to reduce reads)
 */
export async function isAdmin(userId) {
  try {
    // Import cache dynamically to avoid circular dependencies
    const { getCached, setCached, CACHE_KEYS, CACHE_TTL } = await import('../utils/cache')
    
    // Check cache first (admin status rarely changes)
    const cacheKey = CACHE_KEYS.USER_ADMIN(userId)
    const cached = await getCached(cacheKey, CACHE_TTL.MEDIUM)
    if (cached !== null) {
      return cached
    }
    
    // Cache miss, fetch from Firestore
    const userDoc = await getDocument('users', userId)
    const isAdminResult = userDoc?.role === 'admin'
    
    // Cache the result
    await setCached(cacheKey, isAdminResult, CACHE_TTL.MEDIUM)
    
    return isAdminResult
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Update a user document in the 'users' collection
 * @param {string} userId - The ID of the user to update
 * @param {object} data - The data to update
 * @returns {Promise<{error: string | null}>}
 */
export async function updateUserData(userId, data) {
  try {
    await updateDocument('users', userId, data);
    return { error: null };
  } catch (error) {
    return { error: 'שגיאה בעדכון פרטי המשתמש.' };
  }
}

/**
 * Batch write operations (more efficient than individual writes)
 * @param {Array} operations - Array of {type: 'set'|'update'|'delete', collection, docId, data}
 */
export async function batchWrite(operations) {
  try {
    const batch = writeBatch(db)
    
    operations.forEach(op => {
      const docRef = doc(db, op.collection, op.docId)
      
      if (op.type === 'set') {
        batch.set(docRef, {
          ...op.data,
          updatedAt: serverTimestamp(),
          ...(op.merge ? {} : { createdAt: serverTimestamp() })
        }, { merge: op.merge !== false })
      } else if (op.type === 'update') {
        batch.update(docRef, {
          ...op.data,
          updatedAt: serverTimestamp()
        })
      } else if (op.type === 'delete') {
        batch.delete(docRef)
      }
    })
    
    await batch.commit()
    return true
  } catch (error) {
    console.error('Error in batch write:', error)
    throw error
  }
}

