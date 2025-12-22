import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Firebase configuration from environment variables
// Fallback to hardcoded values for development if env vars are not set
const getFirebaseConfig = () => {
  try {
    const extra = Constants.expoConfig?.extra || {}
    
    return {
      apiKey: extra.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDpXIaHTcvamaoKXrl657nU3zFm9Nh389A",
      authDomain: extra.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "eyalamrami-1d69e.firebaseapp.com",
      projectId: extra.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "eyalamrami-1d69e",
      storageBucket: extra.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "eyalamrami-1d69e.firebasestorage.app",
      messagingSenderId: extra.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "990847614280",
      appId: extra.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:990847614280:web:431b7f340e07bd7f3b477d",
      measurementId: extra.firebaseMeasurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-P7YM9RTHK6"
    }
  } catch (error) {
    console.error('Error getting Firebase config:', error)
    // Fallback to hardcoded config
    return {
      apiKey: "AIzaSyDpXIaHTcvamaoKXrl657nU3zFm9Nh389A",
      authDomain: "eyalamrami-1d69e.firebaseapp.com",
      projectId: "eyalamrami-1d69e",
      storageBucket: "eyalamrami-1d69e.firebasestorage.app",
      messagingSenderId: "990847614280",
      appId: "1:990847614280:web:431b7f340e07bd7f3b477d",
      measurementId: "G-P7YM9RTHK6"
    }
  }
}

const firebaseConfig = getFirebaseConfig()

// Initialize Firebase with error handling
let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error('Error initializing Firebase app:', error)
  // Try to get existing app instance
  try {
    const { getApps } = require('firebase/app')
    const apps = getApps()
    if (apps.length > 0) {
      app = apps[0]
    } else {
      // Re-throw original error if no existing app
      throw error
    }
  } catch (err) {
    console.error('Critical: Could not initialize Firebase:', err)
    throw err
  }
}

// Initialize Firestore with persistence
let db
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // For React Native
  })
} catch (error) {
  // If already initialized, get the existing instance
  console.warn('Firestore already initialized, getting existing instance')
  db = getFirestore(app)
}

// Initialize Auth with persistence for React Native
let auth
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  })
} catch (error) {
  // If already initialized, get the existing instance
  console.warn('Auth already initialized, getting existing instance')
  try {
    auth = getAuth(app)
  } catch (err) {
    console.error('Error getting Auth instance:', err)
    throw err
  }
}

// Initialize Storage
let storage
try {
  storage = getStorage(app)
} catch (error) {
  console.error('Error initializing Storage:', error)
  throw error
}

export { db, auth, storage }
export default app

