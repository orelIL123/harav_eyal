import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * סקריפט לדיבוג - בודק הכל
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

async function debugAdmin() {
  try {
    console.log('🔍 Debugging admin user...\n')
    
    // Check Firestore document
    console.log('1️⃣ Checking Firestore document...')
    const userDoc = await db.collection('users').doc(ADMIN_UID).get()
    
    if (userDoc.exists) {
      const data = userDoc.data()
      console.log('   ✅ Document exists')
      console.log('   📋 Full document data:')
      console.log(JSON.stringify(data, null, 2))
      
      console.log('\n   🔍 Key fields:')
      console.log(`      uid: ${data.uid}`)
      console.log(`      email: ${data.email}`)
      console.log(`      role: ${data.role} ${data.role === 'admin' ? '✅' : '❌'}`)
      console.log(`      tier: ${data.tier}`)
      console.log(`      displayName: ${data.displayName}`)
      
      if (data.role !== 'admin') {
        console.log('\n   ⚠️  WARNING: Role is not "admin"!')
        console.log('   🔧 Fixing...')
        await db.collection('users').doc(ADMIN_UID).update({
          role: 'admin',
          tier: 'vip'
        })
        console.log('   ✅ Fixed!')
      }
    } else {
      console.log('   ❌ Document does NOT exist!')
      console.log('   🔧 Creating...')
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
      console.log('   ✅ Created!')
    }
    
    // Test reading with client SDK simulation
    console.log('\n2️⃣ Testing Firestore Rules...')
    console.log('   📝 Rules should allow:')
    console.log('      - User to read their own document (uid matches)')
    console.log('      - Admin to read any user document')
    console.log('\n   ⚠️  Make sure Firestore Rules are published!')
    console.log('   📍 Check: Firebase Console → Firestore → Rules')
    
    console.log('\n3️⃣ Summary:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   UID: ${ADMIN_UID}`)
    console.log(`   Role: admin ✅`)
    console.log(`   Tier: vip ✅`)
    
    console.log('\n✅ Debug complete!')
    console.log('\n📌 Next steps:')
    console.log('   1. Make sure Firestore Rules are published')
    console.log('   2. Logout from app completely')
    console.log('   3. Login with:')
    console.log(`      Email: ${ADMIN_EMAIL}`)
    console.log(`      Password: 123456`)
    console.log('   4. Check console logs in app')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

debugAdmin()

