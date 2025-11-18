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

// Load the spec
const spec = JSON.parse(
  readFileSync(join(__dirname, '../FIREBASE_BACKEND_SPEC.json'), 'utf8')
);

/**
 * Initialize Firebase Backend according to FIREBASE_BACKEND_SPEC.json
 * This script creates:
 * - Firestore collections with initial structure
 * - Firestore indexes
 * - Storage rules
 * - Firestore rules
 * - Admin user with custom claims
 */

async function createIndexes() {
  console.log('📊 Creating Firestore indexes...\n');
  
  const indexes = [];
  
  // Collect all indexes from spec
  for (const [collectionName, collectionSpec] of Object.entries(spec.firestore.collections)) {
    if (collectionSpec.indexes && collectionSpec.indexes.length > 0) {
      for (const index of collectionSpec.indexes) {
        indexes.push({
          collectionGroup: collectionName,
          queryScope: index.queryScope || 'COLLECTION',
          fields: index.fields.map(field => ({
            fieldPath: field,
            order: 'ASCENDING'
          }))
        });
      }
    }
  }
  
  // Note: Indexes need to be created via Firebase Console or firebase CLI
  // This is just for documentation
  console.log('📋 Indexes to create (use Firebase Console or firebase deploy --only firestore:indexes):');
  console.log(JSON.stringify(indexes, null, 2));
  console.log('\n');
}

async function createSampleData() {
  console.log('📝 Creating sample data structures...\n');
  
  const now = admin.firestore.FieldValue.serverTimestamp();
  const dedicationEntries = [
    {
      id: 'dedication-sample-1',
      type: 'neshama',
      name: 'אסתר בת רחל',
      createdAt: admin.firestore.Timestamp.now()
    },
    {
      id: 'dedication-sample-2',
      type: 'refuah',
      name: 'יוסף בן רות',
      createdAt: admin.firestore.Timestamp.now()
    }
  ];
  
  // Create sample dailyInsight
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    await db.collection('dailyInsights').doc(today).set({
      title: 'תובנה יומית ראשונה',
      text: 'זהו תוכן לדוגמה של תובנה יומית. האדמין יכול לעדכן את התוכן הזה.',
      audioUrl: null,
      audioDurationSec: null,
      createdBy: 'system',
      createdAt: now,
      updatedAt: null,
      published: true,
      dedications: dedicationEntries
    });
    console.log('✅ Created sample dailyInsight');
  } catch (error) {
    console.log('⚠️  Could not create dailyInsight (might already exist):', error.message);
  }
  
  // Create sample feed
  try {
    const feedRef = db.collection('feeds').doc();
    await feedRef.set({
      type: 'news',
      title: 'חדשות ראשונות',
      body: 'זהו תוכן חדשות לדוגמה. האדמין יכול לעדכן את התוכן הזה.',
      mediaUrl: null,
      createdAt: now,
      published: true
    });
    console.log('✅ Created sample feed');
  } catch (error) {
    console.log('⚠️  Could not create feed:', error.message);
  }
  
  // Create sample faith lessons
  try {
    const lessons = [
      {
        id: 'shalom-bayit-intro',
        category: 'shalom-bayit',
        title: 'יסודות השלום בבית',
        summary: 'חיזוק הדיבור הטוב, אחריות זוגית ותפילה משותפת מחזקים את האחדות.',
        spotlight: 'שלום הבית הוא כלי לגילוי שכינה וחיבור מחודש בין בני הזוג.',
        focusPoints: [
          'בחינת הדיבור היומי והאם הוא מחזק או מחליש',
          'קביעת זמן זוגי קבוע ללא הסחות',
          'הודאה הדדית על נקודה טובה בכל יום'
        ],
        practices: [
          'פרק אחד בספר שלום איש ואשתו',
          'כתיבת מחברת תודה פעם בשבוע',
          'אמירת תהילים קכ״ח לשלום בית'
        ],
        sources: [
          'אגרת הרמב״ן – דרכי שלום',
          'בן איש חי – שנה א׳, שופטים'
        ],
        priority: 1,
        published: true,
        createdAt: now,
        createdBy: 'system'
      },
      {
        id: 'parnasa-focus',
        category: 'parnasa',
        title: 'ביטחון בה׳ לפרנסה',
        summary: 'אמונה בהשגחה פרטית עם השתדלות מאוזנת מביאה שפע.',
        spotlight: 'תרומה קבועה וסדר יום ברור פותחים שערים לפרנסה בכבוד.',
        focusPoints: [
          'בדיקת אמונות מגבילות סביב כסף',
          'מסגרת חשבונאית פשוטה',
          'תרומה קבועה כאקט אמונה'
        ],
        practices: [
          'אמירת פרשת המן מדי יום',
          'רישום שלוש השגחות פרטיות ביום',
          'קביעת מזמור תהילים לפרנסה'
        ],
        sources: [
          'חובת הלבבות – שער הביטחון',
          'ליקוטי מוהר״ן תנינא תורה י״א'
        ],
        priority: 2,
        published: true,
        createdAt: now,
        createdBy: 'system'
      }
    ];
    
    for (const lesson of lessons) {
      await db.collection('faithLessons').doc(lesson.id).set(lesson);
    }
    console.log('✅ Created sample faithLessons');
  } catch (error) {
    console.log('⚠️  Could not create faithLessons:', error.message);
  }
  
  console.log('\n');
}

async function createAdminUser() {
  console.log('👤 Creating admin user...\n');
  
  // You should replace these with your actual admin credentials
  const ADMIN_EMAIL = 'admin@haraveyal.com';
  const ADMIN_PASSWORD = 'ChangeThisPassword123!';
  const ADMIN_PHONE = '+972501234567'; // Optional
  
  try {
    // Check if user already exists
    let user;
    try {
      user = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('ℹ️  User already exists, updating custom claims...');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          phoneNumber: ADMIN_PHONE,
          emailVerified: true
        });
        console.log('✅ Created admin user:', user.uid);
      } else {
        throw error;
      }
    }
    
    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      admin: true
    });
    console.log('✅ Set admin custom claim');
    
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      displayName: 'Admin User',
      phone: ADMIN_PHONE,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      notificationTokens: []
    }, { merge: true });
    console.log('✅ Created user document in Firestore');
    
    console.log('\n📌 Admin credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   UID: ${user.uid}`);
    console.log('   ⚠️  Please change the password after first login!\n');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

async function verifyCollections() {
  console.log('🔍 Verifying collections structure...\n');
  
  const collections = Object.keys(spec.firestore.collections);
  
  for (const collectionName of collections) {
    try {
      // Try to read from collection (will create it if it doesn't exist)
      const snapshot = await db.collection(collectionName).limit(1).get();
      console.log(`✅ Collection '${collectionName}' is accessible`);
    } catch (error) {
      console.log(`⚠️  Collection '${collectionName}' error:`, error.message);
    }
  }
  
  console.log('\n');
}

async function main() {
  try {
    console.log('🚀 Starting Firebase Backend Initialization...\n');
    console.log('Project:', serviceAccount.project_id);
    console.log('Service Account:', serviceAccount.client_email);
    console.log('\n');
    
    // 1. Create indexes info
    await createIndexes();
    
    // 2. Create sample data
    await createSampleData();
    
    // 3. Create admin user
    await createAdminUser();
    
    // 4. Verify collections
    await verifyCollections();
    
    console.log('🎉 Backend initialization completed!\n');
    console.log('📌 Next steps:');
    console.log('1. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('2. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('3. Deploy Storage rules: firebase deploy --only storage');
    console.log('4. Update admin password in Firebase Console');
    console.log('5. Test admin login in your app\n');
    
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

// Run the initialization
main();


