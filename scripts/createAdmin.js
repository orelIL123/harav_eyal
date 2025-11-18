import { auth, db } from '../src/config/firebase.js'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * סקריפט ליצירת משתמש Admin
 * הרץ עם: node scripts/createAdmin.js
 *
 * ⚠️ שנה את המייל והסיסמה לפני הרצה!
 */

const ADMIN_EMAIL = 'orel895@gmail.com'
const ADMIN_PASSWORD = '123456'

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user...\n')

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    )

    console.log(`✅ Auth user created: ${userCredential.user.uid}`)

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: ADMIN_EMAIL,
      phone: null,
      displayName: 'Naor Baruch (Admin)',
      photoURL: null,
      tier: 'vip',
      role: 'admin', // ← This is the important part!
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      notificationsEnabled: true,
      fcmTokens: [],
      streakDays: 0,
      completedCourses: [],
      metadata: {
        onboardingCompleted: true,
        preferredLanguage: 'he'
      }
    })

    console.log('✅ User document created in Firestore')
    console.log('\n🎉 Admin user created successfully!')
    console.log('\n📌 Login credentials:')
    console.log(`Email: ${ADMIN_EMAIL}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.error('❌ Error: This email is already in use')
      console.log('\n💡 If you want to make an existing user an admin:')
      console.log('1. Go to Firebase Console → Firestore')
      console.log('2. Find the user in the "users" collection')
      console.log('3. Edit the document and change "role" to "admin"')
    } else {
      console.error('❌ Error creating admin:', error.message)
    }
  }
}

// Run the script
createAdmin()
