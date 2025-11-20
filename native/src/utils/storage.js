import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { Alert } from 'react-native'
import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Request permissions for image picker
 */
export async function requestImagePermissions() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('הרשאה נדרשת', 'אנחנו צריכים גישה לגלריית התמונות כדי להעלות תמונות')
    return false
  }
  return true
}

/**
 * Pick an image from the library
 */
export async function pickImage(options = {}) {
  const hasPermission = await requestImagePermissions()
  if (!hasPermission) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: options.aspect || [16, 9],
    quality: options.quality || 0.8,
    ...options,
  })

  if (result.canceled) return null

  return {
    uri: result.assets[0].uri,
    width: result.assets[0].width,
    height: result.assets[0].height,
    type: result.assets[0].type,
  }
}

/**
 * Upload image to Firebase Storage
 */
export async function uploadImageToStorage(uri, path, onProgress) {
  try {
    const { storage } = await import('../config/firebase')
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
    
    // Convert URI to blob for React Native
    const response = await fetch(uri)
    const blob = await response.blob()
    
    // Create storage reference
    const storageRef = ref(storage, path)
    
    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob)
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error('Error getting download URL:', error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Generate a unique file path for storage
 */
export function generateStoragePath(folder, filename) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const extension = filename.split('.').pop() || 'jpg'
  return `${folder}/${timestamp}_${random}.${extension}`
}

/**
 * Generate storage path for cards
 */
export function generateCardImagePath(cardKey, filename) {
  return generateStoragePath(`cards/${cardKey}`, filename)
}

/**
 * Generate storage path for news
 */
export function generateNewsImagePath(newsId, filename) {
  return generateStoragePath(`news/${newsId}`, filename)
}

/**
 * Request camera permissions
 */
export async function requestCameraPermissions() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('הרשאה נדרשת', 'אנחנו צריכים גישה למצלמה כדי לצלם וידאו')
    return false
  }
  return true
}

/**
 * Pick a video from the library
 */
export async function pickVideo(options = {}) {
  const hasPermission = await requestImagePermissions()
  if (!hasPermission) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: options.allowsEditing !== false,
    quality: options.quality || 1,
    videoMaxDuration: options.videoMaxDuration || 60, // Max 60 seconds for daily videos
    ...options,
  })

  if (result.canceled) return null

  return {
    uri: result.assets[0].uri,
    width: result.assets[0].width,
    height: result.assets[0].height,
    duration: result.assets[0].duration,
    type: result.assets[0].type,
  }
}

/**
 * Record a video using the camera
 */
export async function recordVideo(options = {}) {
  const hasPermission = await requestCameraPermissions()
  if (!hasPermission) return null

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: options.allowsEditing !== false,
    quality: options.quality || 1,
    videoMaxDuration: options.videoMaxDuration || 60, // Max 60 seconds for daily videos
    ...options,
  })

  if (result.canceled) return null

  return {
    uri: result.assets[0].uri,
    width: result.assets[0].width,
    height: result.assets[0].height,
    duration: result.assets[0].duration,
    type: result.assets[0].type,
  }
}

/**
 * Upload video to Firebase Storage
 */
export async function uploadVideoToStorage(uri, path, onProgress) {
  try {
    const { storage } = await import('../config/firebase')
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
    
    // Convert URI to blob for React Native
    const response = await fetch(uri)
    const blob = await response.blob()
    
    // Create storage reference
    const storageRef = ref(storage, path)
    
    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'video/mp4',
    })
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error('Error getting download URL:', error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    throw error
  }
}

/**
 * Generate storage path for daily videos
 */
export function generateDailyVideoPath(date, filename) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
  return generateStoragePath(`video/stories/${dateStr}`, filename)
}

/**
 * Generate storage path for daily video thumbnails
 */
export function generateDailyVideoThumbnailPath(date, filename) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date
  return generateStoragePath(`video/stories_thumbs/${dateStr}`, filename)
}

/**
 * Pick an audio file using document picker
 */
export async function pickAudio() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*'],
      copyToCacheDirectory: true,
    })

    if (result.canceled) return null

    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      mimeType: result.assets[0].mimeType,
      size: result.assets[0].size,
    }
  } catch (error) {
    console.error('Error picking audio:', error)
    Alert.alert('שגיאה', 'לא ניתן לבחור קובץ אודיו')
    return null
  }
}

/**
 * Pick a PDF file using document picker
 */
export async function pickPDF() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      copyToCacheDirectory: true,
    })

    if (result.canceled) return null

    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      mimeType: result.assets[0].mimeType,
      size: result.assets[0].size,
    }
  } catch (error) {
    console.error('Error picking PDF:', error)
    Alert.alert('שגיאה', 'לא ניתן לבחור קובץ PDF')
    return null
  }
}

/**
 * Upload audio file to Firebase Storage
 */
export async function uploadAudioToStorage(uri, path, onProgress) {
  try {
    const { storage } = await import('../config/firebase')
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
    
    // Convert URI to blob for React Native
    const response = await fetch(uri)
    const blob = await response.blob()
    
    // Create storage reference
    const storageRef = ref(storage, path)
    
    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'audio/mpeg', // Default to MP3, can be adjusted based on file type
    })
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error('Error getting download URL:', error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error('Error uploading audio:', error)
    throw error
  }
}

/**
 * Upload PDF file to Firebase Storage
 */
export async function uploadPDFToStorage(uri, path, onProgress) {
  try {
    const { storage } = await import('../config/firebase')
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
    
    // Convert URI to blob for React Native
    const response = await fetch(uri)
    const blob = await response.blob()
    
    // Create storage reference
    const storageRef = ref(storage, path)
    
    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'application/pdf',
    })
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error('Error getting download URL:', error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error('Error uploading PDF:', error)
    throw error
  }
}

// ========== CREDENTIALS STORAGE ==========

const CREDENTIALS_KEY = '@app:credentials'
const CONSENT_KEY = '@app:consent_accepted'
const TERMS_KEY = '@app:terms_accepted'

/**
 * Save login credentials (email only, password is never stored)
 */
export async function saveCredentials(email) {
  try {
    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ email }))
  } catch (error) {
    console.error('Error saving credentials:', error)
  }
}

/**
 * Get saved credentials
 */
export async function getCredentials() {
  try {
    const data = await AsyncStorage.getItem(CREDENTIALS_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error getting credentials:', error)
    return null
  }
}

/**
 * Clear saved credentials
 */
export async function clearCredentials() {
  try {
    await AsyncStorage.removeItem(CREDENTIALS_KEY)
  } catch (error) {
    console.error('Error clearing credentials:', error)
  }
}

/**
 * Check if user has accepted consent
 */
export async function hasAcceptedConsent() {
  try {
    const value = await AsyncStorage.getItem(CONSENT_KEY)
    return value === 'true'
  } catch (error) {
    console.error('Error checking consent:', error)
    return false
  }
}

/**
 * Save consent acceptance
 */
export async function saveConsentAccepted() {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, 'true')
  } catch (error) {
    console.error('Error saving consent:', error)
  }
}

/**
 * Check if user has accepted terms
 */
export async function hasAcceptedTerms() {
  try {
    const value = await AsyncStorage.getItem(TERMS_KEY)
    return value === 'true'
  } catch (error) {
    console.error('Error checking terms:', error)
    return false
  }
}

/**
 * Save terms acceptance
 */
export async function saveTermsAccepted() {
  try {
    await AsyncStorage.setItem(TERMS_KEY, 'true')
  } catch (error) {
    console.error('Error saving terms:', error)
  }
}

/**
 * Clear consent (for testing/debugging)
 */
export async function clearConsent() {
  try {
    await AsyncStorage.removeItem(CONSENT_KEY)
    await AsyncStorage.removeItem(TERMS_KEY)
  } catch (error) {
    console.error('Error clearing consent:', error)
  }
}

/**
 * Clear all app data (for testing/debugging)
 */
export async function clearAllAppData() {
  try {
    await AsyncStorage.removeItem(CONSENT_KEY)
    await AsyncStorage.removeItem(TERMS_KEY)
    await AsyncStorage.removeItem(CREDENTIALS_KEY)
  } catch (error) {
    console.error('Error clearing app data:', error)
  }
}

