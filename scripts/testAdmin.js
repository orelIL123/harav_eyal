import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * סקריפט לבדיקת משתמש Admin
 * בודק את כל הפרטים של המשתמש
 */

const ADMIN_EMAIL = 'orel895@gmail.com'
const ADMIN_UID = '2dEcFBvgiYQbbaHama53ZVs3lz02'

// Initialize Firebase Admin
try {
  const serviceAccountPath = join(__dirname, '../new/eyalamrami-1d69e-firebase-adminsdk-fbsvc-38e7445329.json')
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message)
  process.exit(1)
}

const db = admin.firestore()
const auth = admin.auth()

async function testAdmin() {
  try {
    console.log('🔍 Testing admin user...\n')
    
    // Check Auth user
    console.log('1️⃣ Checking Auth user...')
    try {
      const user = await auth.getUserByEmail(ADMIN_EMAIL)
      console.log(`   ✅ User found in Auth`)
      console.log(`      UID: ${user.uid}`)
      console.log(`      Email: ${user.email}`)
      console.log(`      Email Verified: ${user.emailVerified}`)
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    // Check Firestore document
    console.log('\n2️⃣ Checking Firestore document...')
    try {
      const userDoc = await db.collection('users').doc(ADMIN_UID).get()
      if (userDoc.exists) {
        const data = userDoc.data()
        console.log(`   ✅ Document exists`)
        console.log(`      UID: ${data.uid}`)
        console.log(`      Email: ${data.email}`)
        console.log(`      Role: ${data.role || 'NOT SET'}`)
        console.log(`      Tier: ${data.tier || 'NOT SET'}`)
        console.log(`      Display Name: ${data.displayName || 'NOT SET'}`)
        
        if (data.role !== 'admin') {
          console.log(`\n   ⚠️  WARNING: Role is "${data.role}" but should be "admin"!`)
          console.log(`   Updating role to "admin"...`)
          await db.collection('users').doc(ADMIN_UID).update({
            role: 'admin',
            tier: 'vip'
          })
          console.log(`   ✅ Role updated!`)
        } else {
          console.log(`   ✅ Role is correct: "admin"`)
        }
      } else {
        console.log(`   ❌ Document does NOT exist!`)
        console.log(`   Creating document...`)
        await db.collection('users').doc(ADMIN_UID).set({
          uid: ADMIN_UID,
          email: ADMIN_EMAIL,
          phone: null,
          displayName: 'Naor Baruch (Admin)',
          photoURL: null,
          tier: 'vip',
          role: 'admin',
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
        console.log(`   ✅ Document created!`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    // Test Firestore Rules
    console.log('\n3️⃣ Testing Firestore Rules...')
    console.log('   (This requires a client SDK test - check in app)')
    
    console.log('\n✅ Test complete!')
    console.log('\n📌 Next steps:')
    console.log('   1. Make sure you are logged in with:')
    console.log(`      Email: ${ADMIN_EMAIL}`)
    console.log(`      Password: 123456`)
    console.log('   2. Check the console logs in the app')
    console.log('   3. Look for: "📋 User data loaded" and "🔐 Admin check result"')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

testAdmin()

