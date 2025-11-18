import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

function useFadeIn(delay = 0) {
  const anim = React.useRef(new Animated.Value(0)).current
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start()
  }, [anim, delay])
  return anim
}

export default function GirlsSchoolScreen({ navigation }) {
  const fade = useFadeIn()

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>בית ספר לבנות</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={64} color={PRIMARY_RED} />
          </View>

          <Text style={styles.title}>בית יעקב לבנות "כאייל תערוג"</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>רוחניות ללא פשרות</Text>
            <Text style={styles.sectionText}>
              בית הספר בית יעקב "כאייל תערוג" הוקם כמענה לצרכיה של הקהילה המתפתחת בהתמדה, והפך עד מהרה למגדלור רוחני בשכונת הר חומה וסביבותיה. דגש רב הושם בהקמת בית הספר על בחירת הצוות החינוכי והמקצועי. צוות המורות נבחר בקפידה, מורות יראות שמים בתכלית, כאלו המהוות סמל ודוגמה לתלמידות תחי'.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>משהו טוב צומח כאן</Text>
            <Text style={styles.sectionText}>
              בית הספר שם בראש מעייניו את הצלחת תלמידותיו – למידה תוך כדי חוויה והנאה אך ללא פשרות על מקצועיות החינוך. צוות המורות המיומן מביא עמו תפיסה וגישה ייחודית בלמידה, גישה הממצה מכל תלמידה את הפוטנציאל הייחודי לה. לצד ההשקעה הפרטנית בכל תלמידה מכין בית הספר את כלל התלמידות למבחנים הארציים ומבחני המיצ"ב במשרד החינוך. בבית הספר 8 כיתות מ- א' עד ח'.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>הצוות שלנו</Text>
            <Text style={styles.bulletText}>• צוות חינוכי מקצועי חם ומסור</Text>
            <Text style={styles.bulletText}>• מורות יראות שמים בעלות תארים אקדמיים בתחומי חינוך</Text>
            <Text style={styles.bulletText}>• רכזות מקצוע בעלות ניסיון עשיר בתחומן</Text>
            <Text style={styles.bulletText}>• צוות מורות שילוב והוראה פרטנית</Text>
            <Text style={styles.bulletText}>• יועצת מקצועית בעלת ניסיון של 15 שנים בתחום</Text>
            <Text style={styles.bulletText}>• פסיכולוג קליני</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>יתרונות פדגוגיים</Text>
            <Text style={styles.sectionText}>
              בית הספר מחזיק בפרויקט חונכות ייחודי שמטרתו להעצים בצורה חווייתית את בנות כיתות ד' – ז'. שמונה עשר חונכות איכותיות ויראות שמיים, בנות סמינר מהטובים בירושלים תחנוכנה בפעילות שבועית את בנות הכיתות, בסדרת מפגשים שכל כולם מכוונים לפיתוח והעצמה אישית, יצירת מוטיבציה וקידום תהליכי למידה. המפגשים מתקיימים ללא עלות.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>הפרוייקטים שלנו</Text>
            
            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>מקצועיות</Text>
              <Text style={styles.sectionText}>
                פרויקט חינוך לצד הכלה – פרויקט שמטרתו להעניק כלים חינוכיים משמעותיים לצוות החינוכי.
              </Text>
            </View>

            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>זהירות בדרכים</Text>
              <Text style={styles.sectionText}>
                מתוך דאגה לקידומו הלימודי והרגשי של כל תלמיד, הוקם צוות שילוב מקצועי שמטרתו לפתח ולהעצים יכולות למידה באופן פרטני אצל התלמידים הזקוקים לכך. לכל תלמיד מותאמת תכנית אישית המועברת בצורה חווייתית ומהנה, כאשר השיעורים עצמם נמסרים ע"י מלמדים מקצועיים ומנוסים בעלי וותק ותארים ומפוקחים ע"י פיקוח מטעם משרד החינוך.
              </Text>
            </View>

            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>מוכנות לכיתה א'</Text>
              <Text style={styles.sectionText}>
                מדי שנה מתקיימת תכנית המוכנות לכיתה א'. התכנית מותאמת אישית לרמתה של כל בת. הנרשמות לתכנית נהנות ממפגשי אתגר חווייתיים היוצרים היכרות עם המערכת הלימודית העל גנית לקראת העליה לכיתה א'.
              </Text>
            </View>

            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>מוגנות</Text>
              <Text style={styles.sectionText}>
                תכנית המוגנות הינה מיזם מבורך פרי שיתוף קרן "ידידות טורונטו" עם רשת החינוך "בני יוסף". התכנית כוללת הנחיה לצוות המורות וההורים מאנשי מקצוע מומחים בתחום אשר יעניק כלים להנחלת הנושא בקרב התלמידות, על מנת להכין ולמנוע מקרים חלילה.
              </Text>
            </View>

            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>בית ספר מקדם בריאות</Text>
              <Text style={styles.sectionText}>
                בית הספר קיבל את אות שלושת כוכבי הבריאות כהוקרה על מיזם לקידום והנגשת נושא הבריאות לבנות בית הספר. במסגרת המיזם נעשתה היכרות נרחבת של נושא הבריאות בהיבטים כגון: הגיינה אישית, פעילות גופנית, תזונה מאוזנת, שתיית מים, אוויר נקי ועוד. מדי חודש הועלה מיזם מרתק ששולב בצורה ספיראלית עם אקטואליית החודש בשילוב למידה.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: PRIMARY_RED,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 24,
  },
  bulletText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 4,
    paddingRight: 8,
  },
  projectCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: PRIMARY_RED,
    textAlign: 'right',
    marginBottom: 8,
  },
})

