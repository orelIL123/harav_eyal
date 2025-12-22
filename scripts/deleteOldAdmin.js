import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Firebase Admin SDK credentials
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../new/eyalamrami-1d69e-firebase-adminsdk-fbsvc-38e7445329.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'eyalamrami-1d69e'
});

const db = admin.firestore();
const auth = admin.auth();

// User to delete
const OLD_USER_UID = 'Dmo2nS82UROHhKc3yms4wqEvJNf2'
const OLD_USER_EMAIL = 'admin-qw132h@harav-eyal.app'

async function deleteOldUser() {
  try {
    console.log('🗑️  Deleting old admin user...\n')
    console.log(`📧 Email: ${OLD_USER_EMAIL}`)
    console.log(`🆔 UID: ${OLD_USER_UID}\n`)
    
    // Delete Firestore document
    try {
      await db.collection('users').doc(OLD_USER_UID).delete()
      console.log('✅ Deleted user document from Firestore')
    } catch (error) {
      if (error.code === 5) { // NOT_FOUND
        console.log('ℹ️  User document not found in Firestore (might already be deleted)')
      } else {
        console.error('⚠️  Error deleting Firestore document:', error.message)
      }
    }
    
    // Delete auth user
    try {
      await auth.deleteUser(OLD_USER_UID)
      console.log('✅ Deleted auth user from Authentication')
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('ℹ️  Auth user not found (might already be deleted)')
      } else {
        console.error('⚠️  Error deleting auth user:', error.message)
      }
    }
    
    console.log('\n✅ Old user deletion completed!')
    
  } catch (error) {
    console.error('❌ Error deleting old user:', error.message)
    throw error
  } finally {
    await admin.app().delete()
  }
}

// Run the script
deleteOldUser()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

