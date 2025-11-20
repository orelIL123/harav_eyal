import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * סקריפט לבדיקה ויצירת משתמש Admin
 * בודק אם המשתמש קיים ב-Firestore, ואם לא - יוצר אותו
 * הרץ עם: node scripts/ensureAdmin.js
 */

const ADMIN_EMAIL = 'orel895@gmail.com'
const ADMIN_PASSWORD = '123456'

// Initialize Firebase Admin
try {
  const serviceAccountPath = join(__dirname, '../new/eyalamrami-1d69e-firebase-adminsdk-fbsvc-38e7445329.json')
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
  }
  
  console.log('✅ Firebase Admin initialized\n')
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message)
  console.log('\n💡 Make sure the service account file exists at: new/eyalamrami-1d69e-firebase-adminsdk-fbsvc-38e7445329.json')
  process.exit(1)
}

const db = admin.firestore()
const auth = admin.auth()

async function ensureAdmin() {
  try {
    console.log('🔍 Checking if admin user exists...\n')
    
    // Check if user exists in Auth
    let user
    try {
      user = await auth.getUserByEmail(ADMIN_EMAIL)
      console.log(`✅ User found in Auth: ${user.uid}`)
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('⚠️  User not found in Auth, creating...')
        
        // Create user in Auth
        user = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: 'Naor Baruch (Admin)',
          emailVerified: true
        })
        console.log(`✅ User created in Auth: ${user.uid}`)
      } else {
        throw error
      }
    }
    
    // Check if user document exists in Firestore
    const userDocRef = db.collection('users').doc(user.uid)
    const userDoc = await userDocRef.get()
    
    if (userDoc.exists) {
      const userData = userDoc.data()
      console.log(`✅ User document exists in Firestore`)
      console.log(`   Email: ${userData.email}`)
      console.log(`   Role: ${userData.role || 'not set'}`)
      console.log(`   Tier: ${userData.tier || 'not set'}`)
      
      // Check if role is admin
      if (userData.role !== 'admin') {
        console.log('\n⚠️  User exists but role is not "admin", updating...')
        await userDocRef.update({
          role: 'admin',
          tier: 'vip',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        console.log('✅ Role updated to "admin"')
      } else {
        console.log('✅ User already has admin role')
      }
    } else {
      console.log('⚠️  User document not found in Firestore, creating...')
      
      // Create user document in Firestore
      await userDocRef.set({
        uid: user.uid,
        email: ADMIN_EMAIL,
        phone: null,
        displayName: 'Naor Baruch (Admin)',
        photoURL: null,
        tier: 'vip',
        role: 'admin', // ← This is the important part!
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        notificationsEnabled: true,
        fcmTokens: [],
        streakDays: 0,
        completedCourses: [],
        metadata: {
          onboardingCompleted: true,
          preferredLanguage: 'he'
        }
      })
      
      console.log('✅ User document created in Firestore with admin role')
    }
    
    console.log('\n🎉 Admin user is ready!')
    console.log('\n📌 Login credentials:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log(`   UID: ${user.uid}`)
    console.log(`   Role: admin`)
    console.log(`   Tier: vip`)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    process.exit(1)
  } finally {
    // Close the connection
    process.exit(0)
  }
}

// Run the script
ensureAdmin()

