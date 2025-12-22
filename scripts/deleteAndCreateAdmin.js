import { initializeApp } from 'firebase/app'
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'

/**
 * סקריפט למחיקת משתמש אדמין קיים ויצירת אחד חדש
 */

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
const db = getFirestore(app)
const auth = getAuth(app)

// User to delete
const OLD_USER_UID = 'Dmo2nS82UROHhKc3yms4wqEvJNf2'
const OLD_USER_EMAIL = 'admin-qw132h@harav-eyal.app'

// New user credentials
const NEW_ADMIN_EMAIL = 'admin123@harav-eyal.app'
const NEW_ADMIN_PASSWORD = '296543?'
const NEW_ADMIN_NAME = 'Admin 123'

async function deleteOldUser() {
  try {
    console.log('🗑️  Deleting old admin user...\n')
    
    // Delete Firestore document
    try {
      await deleteDoc(doc(db, 'users', OLD_USER_UID))
      console.log('✅ Deleted user document from Firestore')
    } catch (error) {
      if (error.code === 'not-found') {
        console.log('ℹ️  User document not found in Firestore (might already be deleted)')
      } else {
        console.error('⚠️  Error deleting Firestore document:', error.message)
      }
    }
    
    // Note: We can't delete auth user without being authenticated as that user
    // The user will need to be deleted manually from Firebase Console if needed
    console.log('ℹ️  Note: Auth user deletion requires admin SDK or manual deletion from Firebase Console')
    console.log('   You can delete it from: Firebase Console → Authentication → Users\n')
    
  } catch (error) {
    console.error('❌ Error deleting old user:', error.message)
  }
}

async function createNewAdmin() {
  try {
    console.log('🚀 Creating new admin user...\n')
    console.log('📧 Email:', NEW_ADMIN_EMAIL)
    console.log('🔑 Password:', NEW_ADMIN_PASSWORD)
    console.log('👤 Name:', NEW_ADMIN_NAME)
    console.log('')

    // Create auth user
    console.log('⏳ Creating authentication user...')
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      NEW_ADMIN_EMAIL,
      NEW_ADMIN_PASSWORD
    )

    const userId = userCredential.user.uid
    console.log(`✅ Auth user created: ${userId}`)

    // Create user document in Firestore
    console.log('⏳ Creating Firestore document...')
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: NEW_ADMIN_EMAIL,
      phone: null,
      displayName: NEW_ADMIN_NAME,
      photoURL: null,
      tier: 'vip',
      role: 'admin', // ← This is the important part!
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      notificationsEnabled: true,
      fcmTokens: [],
      expoPushTokens: [],
      streakDays: 0,
      completedCourses: [],
      metadata: {
        onboardingCompleted: true,
        preferredLanguage: 'he'
      }
    })

    console.log('✅ User document created in Firestore')
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Admin user created successfully!')
    console.log('='.repeat(60))
    console.log('\n📌 Login credentials:')
    console.log('─'.repeat(60))
    console.log(`📧 Email:    ${NEW_ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${NEW_ADMIN_PASSWORD}`)
    console.log(`👤 Name:     ${NEW_ADMIN_NAME}`)
    console.log(`🆔 UID:      ${userId}`)
    console.log('─'.repeat(60))
    console.log('\n✅ You can now login with these credentials in the app.')
    console.log('')

    return {
      email: NEW_ADMIN_EMAIL,
      password: NEW_ADMIN_PASSWORD,
      uid: userId,
      name: NEW_ADMIN_NAME
    }

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message)
    console.error('Error code:', error.code)
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('\n💡 This email is already in use. The user might already exist.')
    } else if (error.code === 'auth/invalid-email') {
      console.error('\n💡 Invalid email format.')
    } else if (error.code === 'auth/weak-password') {
      console.error('\n💡 Password is too weak.')
    }
    
    throw error
  }
}

// Run the script
async function main() {
  try {
    // Delete old user
    await deleteOldUser()
    
    // Create new user
    await createNewAdmin()
    
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  }
}

main()

