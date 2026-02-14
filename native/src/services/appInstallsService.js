import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const INSTALL_TRACKED_KEY = '@app:install_tracked'

/**
 * Track app installation/download
 * This will only record once per device
 */
export async function trackAppInstall() {
  try {
    // Check if we already tracked this install
    const alreadyTracked = await AsyncStorage.getItem(INSTALL_TRACKED_KEY)
    if (alreadyTracked === 'true') {
      return // Already tracked
    }

    // Get device info
    const deviceId = await getDeviceId()

    // Check if this device was already tracked
    const installsRef = collection(db, 'appInstalls')
    const q = query(installsRef, where('deviceId', '==', deviceId))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      // This device was already tracked
      await AsyncStorage.setItem(INSTALL_TRACKED_KEY, 'true')
      return
    }

    // Record new install (works even without authentication)
    await addDoc(collection(db, 'appInstalls'), {
      deviceId,
      platform: Platform.OS,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    })

    // Mark as tracked
    await AsyncStorage.setItem(INSTALL_TRACKED_KEY, 'true')
    console.log('✅ App install tracked')
  } catch (error) {
    console.error('Error tracking app install:', error)
    // Don't throw - this is non-critical
  }
}

/**
 * Get device ID (unique identifier)
 */
async function getDeviceId() {
  try {
    let deviceId = await AsyncStorage.getItem('@app:device_id')
    if (!deviceId) {
      // Generate a unique device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`
      await AsyncStorage.setItem('@app:device_id', deviceId)
    }
    return deviceId
  } catch (error) {
    // Fallback to timestamp-based ID
    return `device_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }
}

/**
 * Get total install count
 */
export async function getInstallCount() {
  try {
    const installsRef = collection(db, 'appInstalls')
    const snapshot = await getDocs(installsRef)
    return snapshot.size
  } catch (error) {
    console.error('Error getting install count:', error)
    return 0
  }
}
