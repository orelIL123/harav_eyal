import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

/**
 * סקריפט ליצירת התוכן הראשוני של faith_topics
 * הרץ עם: node scripts/seedFaithTopicsClient.js
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

const FAITH_TOPICS = [
  {
    key: 'shalom-bayit',
    title: 'שלום בית',
    color: '#DC2626',
    verse: '"דרכיה דרכי נעם וכל נתיבותיה שלום" (משלי ג׳, י״ז)',
    summary: 'חיזוק הקשר הזוגי מתוך הקשבה, אחריות ותפילה משותפת. לימוד מסודר מאפשר לתקן דיבור, ליצור אחדות ולבנות אמון.',
    focusPoints: [
      'בחינת הדיבור היומי – האם הוא מחזק או מחליש את שלום הבית',
      'קביעת זמן זוגי קבוע ללא מכשירים',
      'הודאה הדדית על נקודה טובה בכל יום'
    ],
    practices: [
      'פרק אחד בספר "בית של תורה" או "שלום איש ואשתו"',
      'כתיבת מחברת תודה הדדית פעם בשבוע',
      'אמירת פרקי תהילים לישועת הזוגיות (למשל ק״כ-קכ״ט)'
    ],
    sources: [
      'אגרת הרמב״ן – פרשיית הדיבור הרך',
      'בן איש חי – שנה א׳, שופטים, הלכה א׳'
    ],
    spotlight: 'שלום הבית הוא כלי הכרחי לגילוי שכינה בבית יהודי. עבודת הלב והדיבור היא הצינור לאחדות.'
  },
  {
    key: 'parnasa',
    title: 'פרנסה',
    color: '#0f5b8e',
    verse: '"וידעת כי ה׳ אלקיך הוא הנותן לך כח לעשות חיל" (דברים ח׳, י״ח)',
    summary: 'אמונה בהשגחה פרטית בכל ענייני הפרנסה, לצד פעולה מסודרת והשתדלות מתוקנת. לימוד אמיתי מאזן בין תפילה, עבודה ותודעת שפע.',
    focusPoints: [
      'בדיקת אמונות מגבילות סביב כסף והמרתן בפסוקים של ביטחון',
      'מסגרת חשבונאית פשוטה ליום ולשבוע',
      'תרומה קבועה כאקט של אמון במקור השפע'
    ],
    practices: [
      'אמירת "פרשת המן" מדי יום',
      'התבוננות יומית ב-3 השגחות פרטיות מהיום הקודם',
      'קביעת מזמור תהילים קי״ט אות "אמן" לפרנסה בכבוד'
    ],
    sources: [
      'חובת הלבבות – שער הביטחון פרק ג׳',
      'ליקוטי מוהר״ן תנינא, תורה י״א (שפע בפרנסה)'
    ],
    spotlight: 'ככל שהאדם מתקן את הביטחון בה׳, כך נפתחים הצינורות לפרנסה רחבה מתוך שמחה.'
  },
  {
    key: 'chatzot',
    title: 'חצות לילה',
    color: '#4a1d95',
    verse: '"קומי רוני בלילה לראש אשמורות" (איכה ב׳, י״ט)',
    summary: 'קביעת עת ללמוד ולהתבודד בזמן שבו השערים פתוחים במיוחד. חצות היא הזדמנות לרחמים, תשובה ותיקון כללי של היום.',
    focusPoints: [
      'לוח זמנים קצר: קינה, תהילים, התבודדות',
      'שמירה על תודעה רגועה לפני השינה לצורך קימה קלה',
      'שיתוף המשפחה והקהילה במסע החצות לקבלת חיזוק'
    ],
    practices: [
      'אמירת "תיקון חצות" לפחות פעם בשבוע להתחלה',
      'לימוד בספר "ליקוטי הלכות – השכמה לחצות"',
      'כתיבת בקשות אישיות לאחר הלימוד – "מחברת חצות"'
    ],
    sources: [
      'שולחן ערוך אורח חיים, סימן א׳, סעיף ג׳',
      'ליקוטי מוהר״ן תורה רל״ט – מעלת החצות'
    ],
    spotlight: 'החיבור לחצות יוצר האצה בתיקונים ומקרב את האדם לעבודת ה׳ בשמחה ובדבקות.'
  },
  {
    key: 'tefila',
    title: 'תפילה',
    color: '#0c766f',
    verse: '"קרוב ה׳ לכל קוראיו לכל אשר יקראוהו באמת" (תהילים קמ״ה, י״ח)',
    summary: 'תפילה חיה משלבת ביטחון, הודיה, בקשה וקבלת עול מלכות שמיים. לימוד אמונה בתפילה הופך כל דקה לקשר אישי עם הבורא.',
    focusPoints: [
      'כוונת מילות התפילה והבנה פשוטה של הפסוקים',
      'תפילה אישית אחרי כל ברכה שמרגישה קרובה ללב',
      'הכנת רשימת בקשות והודיה יומית מובנית'
    ],
    practices: [
      'לימוד "שערי תפילה" לרב שוורץ או "מסילת ישרים" פרק י״ט',
      'הוספת פרקי תהילים אישיים לפני/אחרי התפילה',
      'התבודדות קצרה של 10 דקות ביום קבוע'
    ],
    sources: [
      'רבינו נחמן מברסלב – שיחות הר״ן, תפילה והתבודדות',
      'רב קוק – עולת ראיה, חלק א׳'
    ],
    spotlight: 'כשהלב פתוח בתפילה, כל היום מתמלא בהשראה, הכוונה ותחושת שליחות מחודשת.'
  }
]

async function seedFaithTopics() {
  try {
    console.log('🔑 Please provide admin credentials to seed faith topics...')

    // You need to login as admin first
    const email = process.argv[2] || 'orel895@gmail.com'
    const password = process.argv[3]

    if (!password) {
      console.error('❌ Please provide password as second argument:')
      console.error('   node scripts/seedFaithTopicsClient.js orel895@gmail.com YOUR_PASSWORD')
      process.exit(1)
    }

    console.log(`🔐 Logging in as ${email}...`)
    await signInWithEmailAndPassword(auth, email, password)
    console.log('✅ Logged in successfully')

    // Check if already seeded
    console.log('🔍 Checking if faith topics already exist...')
    const querySnapshot = await getDocs(collection(db, 'faith_topics'))
    if (!querySnapshot.empty) {
      console.log('⚠️  Faith topics already seeded. Collection has', querySnapshot.size, 'documents')
      process.exit(0)
    }

    console.log('📝 Starting to seed faith topics...')
    const batch = writeBatch(db)

    FAITH_TOPICS.forEach((topic, index) => {
      const docRef = doc(db, 'faith_topics', topic.key)
      batch.set(docRef, {
        ...topic,
        order: index,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`   ✓ Added ${topic.title} to batch`)
    })

    await batch.commit()
    console.log('✅ Successfully seeded faith topics collection!')
    console.log(`   Created ${FAITH_TOPICS.length} topics`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding faith topics:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  }
}

seedFaithTopics()
