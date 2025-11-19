import ViewShot from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Alert, Platform } from 'react-native'

/**
 * Share content as Instagram Story
 * Creates an image from a View and shares it
 */

/**
 * Generate story image from view ref
 */
export async function generateStoryImage(viewRef, options = {}) {
  try {
    if (!viewRef || !viewRef.current) {
      throw new Error('View ref is not available')
    }
    
    const uri = await viewRef.current.capture({
      format: 'png',
      quality: 1.0,
      result: 'tmpfile',
      width: 1080, // Instagram Story width
      height: 1920, // Instagram Story height
      ...options,
    })
    return uri
  } catch (error) {
    console.error('Error generating story image:', error)
    throw error
  }
}

/**
 * Share image as story
 */
export async function shareAsStory(imageUri, message = '') {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync()
    if (!isAvailable) {
      Alert.alert('שגיאה', 'שיתוף לא זמין במכשיר זה')
      return false
    }

    // Share the image
    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: 'שתף בסטורי',
      UTI: 'public.png',
    })

    return true
  } catch (error) {
    console.error('Error sharing story:', error)
    Alert.alert('שגיאה', 'לא ניתן לשתף את התמונה')
    return false
  }
}

/**
 * Create and share story from view
 */
export async function createAndShareStory(viewRef, options = {}) {
  try {
    if (!viewRef || !viewRef.current) {
      Alert.alert('שגיאה', 'לא ניתן ליצור את הסטורי')
      return false
    }

    // Generate image
    const imageUri = await generateStoryImage(viewRef, options)
    
    if (!imageUri) {
      Alert.alert('שגיאה', 'לא ניתן ליצור את תמונת הסטורי')
      return false
    }
    
    // Share
    const success = await shareAsStory(imageUri)
    
    // Clean up temp file after a delay
    if (imageUri && (imageUri.startsWith(FileSystem.cacheDirectory) || imageUri.startsWith('file://'))) {
      setTimeout(async () => {
        try {
          const fileInfo = await FileSystem.getInfoAsync(imageUri)
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(imageUri, { idempotent: true })
          }
        } catch (error) {
          console.error('Error cleaning up temp file:', error)
        }
      }, 10000) // 10 seconds delay
    }
    
    return success
  } catch (error) {
    console.error('Error creating and sharing story:', error)
    Alert.alert('שגיאה', 'לא ניתן ליצור ולשתף את הסטורי')
    return false
  }
}

/**
 * Share text as story (fallback if no image)
 */
export async function shareTextAsStory(text, url = '') {
  try {
    const message = url ? `${text}\n\n${url}` : text
    
    if (Platform.OS === 'ios') {
      // On iOS, we can use the native share sheet
      const { Share } = await import('react-native')
      await Share.share({
        message,
        url: url || undefined,
      })
    } else {
      // On Android, use expo-sharing
      await Sharing.shareAsync(message)
    }
    
    return true
  } catch (error) {
    console.error('Error sharing text:', error)
    return false
  }
}

