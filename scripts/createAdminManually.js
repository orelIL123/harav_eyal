import { db, auth } from '../src/config/firebase.js'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'

/**
 * סקריפט ליצירת Admin User ישירות ב-Firestore
 * המשתמש כבר קיים ב-Authentication, רק צריך להוסיף אותו ל-Firestore
 */

const ADMIN_EMAIL = 'orel895@gmail.com'
const ADMIN_PASSWORD = '123456'
const ADMIN_UID = 'tewQ0ZYs4bMeondJMSAS5T0XnTC3' // הייתה שגיאה קודם, נשתמש בזה

async function createAdminDocument() {
  try {
    console.log('🚀 Logging in as admin...\n')

    // Login with the existing user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    )

    console.log(`✅ Logged in successfully: ${userCredential.user.uid}`)

    // Create user document in Firestore
    console.log('\n📝 Creating admin document in Firestore...')

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

    console.log('✅ Admin document created in Firestore!')
    console.log('\n🎉 Success! You can now run:')
    console.log('   node scripts/initFirestore.js')
    console.log('\n📌 Admin credentials:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log(`   Role: admin`)

  } catch (error) {
    console.error('❌ Error:', error.message)

    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 User not found. Run: node scripts/createAdmin.js first')
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n💡 Wrong password. Check your credentials.')
    } else if (error.code === 'permission-denied') {
      console.log('\n💡 Make sure Firestore Rules allow authenticated writes!')
      console.log('   Go to Firebase Console → Firestore → Rules')
      console.log('   And temporarily set: allow read, write: if request.auth != null;')
    }
  }
}

createAdminDocument()
