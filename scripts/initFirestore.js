import { db, auth } from '../src/config/firebase.js'
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'

/**
 * סקריפט לאתחול Firestore עם נתונים ראשוניים
 * הרץ עם: node scripts/initFirestore.js
 */

const ADMIN_EMAIL = 'orel895@gmail.com'
const ADMIN_PASSWORD = '123456'

async function initFirestore() {
  try {
    console.log('🚀 Starting Firestore initialization...\n')

    // Login as admin first
    console.log('🔐 Logging in as admin...')
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
    console.log('✅ Logged in successfully!\n')

    // ========== 1. APP CONFIG ==========
    console.log('📝 Creating appConfig...')
    await setDoc(doc(db, 'appConfig', 'config'), {
      headerTitle: 'NAOR BARUCH',
      headerSubtitle: 'Trading • Mindset • Faith',
      marketSnapshot: {
        enabled: true,
        sources: ['TA35', 'NASDAQ', 'BTC']
      },
      quoteOfTheWeek: {
        text: 'הצלחות משמעותיות נבנות מצעדים קטנים ועקביים. התמדה היא הכוח.',
        author: 'נאור ברוך',
        updatedAt: serverTimestamp()
      },
      maintenanceMode: {
        enabled: false,
        message: ''
      },
      version: {
        ios: '1.0.0',
        android: '1.0.0',
        web: '1.0.0',
        forceUpdate: false
      }
    })
    console.log('✅ appConfig created\n')

    // ========== 2. HOME CARDS ==========
    console.log('📝 Creating homeCards...')
    const cards = [
      {
        key: 'daily-insight',
        title: 'ערך יומי',
        desc: 'תובנה מעוררת השראה ליום שלך',
        icon: 'bulb-outline',
        imageUrl: '',
        locked: false,
        order: 1,
        isActive: true,
        route: 'DailyInsight',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        key: 'community',
        title: 'קהילה',
        desc: 'עדכוני קבוצה ושיתופים מהקהילה',
        icon: 'chatbubbles-outline',
        imageUrl: '',
        locked: false,
        order: 2,
        isActive: true,
        route: 'Community',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        key: 'stock-picks',
        title: 'המלצות על מניות',
        desc: 'סיגנלים יומיים/שבועיים למסחר',
        icon: 'trending-up-outline',
        imageUrl: '',
        locked: true,
        order: 3,
        isActive: true,
        route: 'StockPicks',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        key: 'academy',
        title: 'לימודי מסחר',
        desc: 'קורסי וידאו ומסלולי למידה',
        icon: 'school-outline',
        imageUrl: '',
        locked: false,
        order: 4,
        isActive: true,
        route: 'Courses',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        key: 'live-alerts',
        title: 'התראות חמות',
        desc: 'מרכז התראות ופוש בזמן אמת',
        icon: 'notifications-outline',
        imageUrl: '',
        locked: false,
        order: 5,
        isActive: true,
        route: 'LiveAlerts',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ]

    for (const card of cards) {
      await setDoc(doc(db, 'homeCards', card.key), card)
      console.log(`  ✓ Created card: ${card.title}`)
    }
    console.log('✅ All homeCards created\n')

    // ========== 3. SAMPLE COURSES ==========
    console.log('📝 Creating sample courses...')
    const courses = [
      {
        title: 'Foundations of Trading',
        level: 'Beginner',
        duration: '6 פרקים • 3.5 שעות',
        description: 'מבוא למסחר ממושמע — הגדרת מטרות, ניהול סיכונים ובניית שגרה יומית.',
        isPremium: false,
        coverImageUrl: '',
        videoUrl: '',
        order: 1,
        chapters: [],
        metadata: {
          viewCount: 0,
          completionRate: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: 'Advanced Technical Analysis',
        level: 'Intermediate',
        duration: '8 פרקים • 5 שעות',
        description: 'העמקה בתבניות מתקדמות, ניתוח ווליום, וכלים לזיהוי מומנטום.',
        isPremium: true,
        coverImageUrl: '',
        videoUrl: '',
        order: 2,
        chapters: [],
        metadata: {
          viewCount: 0,
          completionRate: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: 'Mindset & Faith Alignment',
        level: 'Mindset',
        duration: '5 פרקים • 2 שעות',
        description: 'איך לחבר בין אמונה, תודעה ומסחר בצורה מאוזנת ויציבה.',
        isPremium: false,
        coverImageUrl: '',
        videoUrl: '',
        order: 3,
        chapters: [],
        metadata: {
          viewCount: 0,
          completionRate: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ]

    for (const course of courses) {
      const docRef = await setDoc(doc(collection(db, 'courses')), course)
      console.log(`  ✓ Created course: ${course.title}`)
    }
    console.log('✅ All courses created\n')

    // ========== 4. SAMPLE ALERT ==========
    console.log('📝 Creating sample alert...')
    await setDoc(doc(collection(db, 'alerts')), {
      symbol: 'AAPL',
      title: 'Apple Inc.',
      type: 'buy',
      price: '$182.45',
      change: '+2.4%',
      message: 'פריצה מעל רמת התנגדות קריטית ב-$180. מומנטום חיובי.',
      priority: 'high',
      targetAudience: ['free', 'premium', 'vip'],
      createdAt: serverTimestamp(),
      createdBy: 'system',
      expiresAt: null,
      isActive: true,
      viewCount: 0,
      clickCount: 0
    })
    console.log('✅ Sample alert created\n')

    // ========== 5. SAMPLE RECOMMENDATION ==========
    console.log('📝 Creating sample recommendation...')
    await setDoc(doc(collection(db, 'recommendations')), {
      title: 'למה אני לא משתמש ב-Stop Loss',
      type: 'video',
      description: 'הסבר מפורט למה זה יכול להזיק למסחר שלך',
      url: 'https://youtube.com/watch?v=example',
      thumbnailUrl: '',
      order: 1,
      isActive: true,
      createdAt: serverTimestamp(),
      expiresAt: null
    })
    console.log('✅ Sample recommendation created\n')

    // ========== 6. SAMPLE NEWS ==========
    console.log('📝 Creating sample news...')
    await setDoc(doc(collection(db, 'news')), {
      title: 'השוק בתנודתיות גבוהה',
      category: 'market',
      content: 'המדדים הראשיים נסחרים בתנודתיות גבוהה היום עקב החלטת הפד...',
      imageUrl: '',
      author: 'נאור ברוך',
      createdAt: serverTimestamp(),
      publishedAt: serverTimestamp(),
      isPublished: true,
      viewCount: 0
    })
    console.log('✅ Sample news created\n')

    // ========== 7. MARKET DATA ==========
    console.log('📝 Creating market data snapshot...')
    await setDoc(doc(db, 'marketData', 'snapshot'), {
      TA35: { value: 1890.25, change: 0.45 },
      NASDAQ: { value: 14780.12, change: -0.32 },
      BTC: { value: 68250, change: 1.25 },
      updatedAt: serverTimestamp()
    })
    console.log('✅ Market data created\n')

    console.log('🎉 Firestore initialization completed successfully!')
    console.log('\n📌 Next steps:')
    console.log('1. Go to Firebase Console → Firestore → Rules')
    console.log('2. Copy the content from firestore.rules and publish')
    console.log('3. Go to Storage → Rules')
    console.log('4. Copy the content from storage.rules and publish')
    console.log('5. Create your admin user with scripts/createAdmin.js')

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error)
  }
}

// Run the initialization
initFirestore()
