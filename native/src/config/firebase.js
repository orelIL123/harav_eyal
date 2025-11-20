import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import Constants from 'expo-constants'

// Firebase configuration from environment variables
// Fallback to hardcoded values for development if env vars are not set
const getFirebaseConfig = () => {
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
}

const firebaseConfig = getFirebaseConfig()

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore with persistence
let db
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // For React Native
  })
} catch (error) {
  // If already initialized, get the existing instance
  db = getFirestore(app)
}

// Initialize Auth
let auth
try {
  auth = getAuth(app)
} catch (error) {
  console.error('Error initializing auth:', error)
  auth = getAuth(app)
}

// Initialize Storage
const storage = getStorage(app)

export { db, auth, storage }
export default app

