import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'
import * as FileSystem from 'expo-file-system'

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

