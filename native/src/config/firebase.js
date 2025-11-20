import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpXIaHTcvamaoKXrl657nU3zFm9Nh389A",
  authDomain: "eyalamrami-1d69e.firebaseapp.com",
  projectId: "eyalamrami-1d69e",
  storageBucket: "eyalamrami-1d69e.firebasestorage.app",
  messagingSenderId: "990847614280",
  appId: "1:990847614280:web:431b7f340e07bd7f3b477d",
  measurementId: "G-P7YM9RTHK6"
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

