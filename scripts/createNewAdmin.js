import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

/**
 * סקריפט ליצירת משתמש Admin חדש
 * הרץ עם: node scripts/createNewAdmin.js
 * 
 * יוצר משתמש אדמין חדש עם אימייל וסיסמה אקראיים
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

// Generate random email and password
function generateRandomString(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateStrongPassword() {
  const length = 12
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const all = uppercase + lowercase + numbers + special
  
  let password = ''
  // Ensure at least one of each type
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += special.charAt(Math.floor(Math.random() * special.length))
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length))
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

async function createNewAdmin() {
  try {
    console.log('🚀 Creating new admin user...\n')

    // Generate random credentials
    const randomId = generateRandomString(6)
    const adminEmail = `admin-${randomId}@harav-eyal.app`
    const adminPassword = generateStrongPassword()
    const adminName = `Admin ${randomId.toUpperCase()}`

    console.log('📧 Generated credentials:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Name: ${adminName}\n`)

    // Create auth user
    console.log('⏳ Creating authentication user...')
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    )

    const userId = userCredential.user.uid
    console.log(`✅ Auth user created: ${userId}`)

    // Create user document in Firestore
    console.log('⏳ Creating Firestore document...')
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: adminEmail,
      phone: null,
      displayName: adminName,
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
    console.log(`📧 Email:    ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    console.log(`👤 Name:     ${adminName}`)
    console.log(`🆔 UID:      ${userId}`)
    console.log('─'.repeat(60))
    console.log('\n⚠️  IMPORTANT:')
    console.log('   1. Save these credentials securely!')
    console.log('   2. Change the password after first login!')
    console.log('   3. This user has full admin access!')
    console.log('\n✅ You can now login with these credentials in the app.')
    console.log('')

    // Return credentials for potential use
    return {
      email: adminEmail,
      password: adminPassword,
      uid: userId,
      name: adminName
    }

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message)
    console.error('Error code:', error.code)
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('\n💡 This email is already in use. Try running again to generate a new one.')
    } else if (error.code === 'auth/invalid-email') {
      console.error('\n💡 Invalid email format. This should not happen with generated emails.')
    } else if (error.code === 'auth/weak-password') {
      console.error('\n💡 Password is too weak. This should not happen with generated passwords.')
    } else {
      console.error('\n💡 Check your Firebase configuration and network connection.')
    }
    
    throw error
  }
}

// Run the script
createNewAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

