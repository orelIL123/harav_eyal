import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
// Project Settings → General → Your apps → Add app → Web app
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "eyalamrami-1d69e.firebaseapp.com",
  projectId: "eyalamrami-1d69e",
  storageBucket: "eyalamrami-1d69e.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

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

