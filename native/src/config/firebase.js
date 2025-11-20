import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import Constants from 'expo-constants'

// Firebase configuration from environment variables
const getFirebaseConfig = () => {
  const extra = Constants.expoConfig?.extra || {}
  
  // Get configuration from app.json extra or environment variables
  const config = {
    apiKey: extra.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: extra.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: extra.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: extra.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: extra.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: extra.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: extra.firebaseMeasurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
  }
  
  // Validate that all required fields are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  const missingFields = requiredFields.filter(field => !config[field])
  
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase configuration fields: ${missingFields.join(', ')}. ` +
      'Please ensure your .env file is properly configured and loaded.'
    )
  }
  
  return config
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

