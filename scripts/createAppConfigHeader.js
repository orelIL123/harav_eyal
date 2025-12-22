import { db, auth } from '../native/src/config/firebase.js'
import { doc, setDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'

/**
 * סקריפט ליצירת appConfig/header
 * הרץ עם: node scripts/createAppConfigHeader.js
 */

const ADMIN_EMAIL = 'orel895@gmail.com'
const ADMIN_PASSWORD = '123456'

async function createAppConfigHeader() {
  try {
    console.log('🚀 Creating appConfig/header...\n')

    // Login as admin first
    console.log('🔐 Logging in as admin...')
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
    console.log('✅ Logged in successfully!\n')

    // Create appConfig/header
    console.log('📝 Creating appConfig/header...')
    await setDoc(doc(db, 'appConfig', 'header'), {
      title: 'הרב אייל עמרמי',
      subtitle: "הודו לה' כי טוב",
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ appConfig/header created successfully!\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAppConfigHeader()

