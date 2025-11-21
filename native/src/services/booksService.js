import { 
  getAllDocuments, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firestore'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Books Service - Manage books in Firestore
 */

/**
 * Get all books
 */
export async function getBooks() {
  try {
    const books = await getAllDocuments('books', [], 'createdAt', 'desc')
    return books
  } catch (error) {
    console.error('Error getting books:', error)
    throw error
  }
}

/**
 * Get a single book by ID
 */
export async function getBook(bookId) {
  try {
    return await getDocument('books', bookId)
  } catch (error) {
    console.error('Error getting book:', error)
    throw error
  }
}

/**
 * Create a new book
 */
export async function createBook(bookData) {
  try {
    const book = {
      title: bookData.title,
      imageUrl: bookData.imageUrl || null,
      purchaseLink: bookData.purchaseLink || null,
      isActive: bookData.isActive !== undefined ? bookData.isActive : true,
    }
    
    // Add document with auto-generated ID
    const docRef = await addDoc(collection(db, 'books'), {
      ...book,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error creating book:', error)
    throw error
  }
}

/**
 * Update an existing book
 */
export async function updateBook(bookId, bookData) {
  try {
    const updateData = { ...bookData }
    
    // Add updatedAt timestamp
    updateData.updatedAt = serverTimestamp()
    
    await updateDocument('books', bookId, updateData)
    return bookId
  } catch (error) {
    console.error('Error updating book:', error)
    throw error
  }
}

/**
 * Delete a book
 */
export async function deleteBook(bookId) {
  try {
    await deleteDocument('books', bookId)
    return true
  } catch (error) {
    console.error('Error deleting book:', error)
    throw error
  }
}

