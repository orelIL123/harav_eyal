import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Animated, Linking } from 'react-native'
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

export default function TalmudTorahScreen({ navigation }) {
  const fade = useFadeIn()

  const handleCall = () => {
    Linking.openURL('tel:1599502051')
  }

  const handleFax = () => {
    Linking.openURL('tel:15326225955')
  }

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
        <Text style={styles.headerTitle}>תלמוד תורה</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.iconContainer}>
            <Ionicons name="book" size={64} color={PRIMARY_RED} />
          </View>

          <Text style={styles.title}>תלמוד תורה כאייל תערוג</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionText}>
              בתלמוד התורה, מתקבצים ומתעלים במידות טובות ובתורה עשרות תלמידים מכל קצוות העיר. תלמידים הבאים להתחנך בדרך התורה והיראה ושאיפתם להתעלות בדרך החינוך המסורה לנו, דרך ישראל סבא.
            </Text>
            <Text style={styles.sectionText}>
              צוות מלמדי ומחנכי הת"ת הינו צוות אנשים מנוסים יראי שמים בעלי עשרות שנות וותק בהוראה ומחזיקי תעודת תואר ראשון בתחום.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>כיום מכיל התלמוד תורה –</Text>
            <Text style={styles.bulletText}>• מעונות יום לתינוקות</Text>
            <Text style={styles.bulletText}>• גן לילדי 4-3</Text>
            <Text style={styles.bulletText}>• מכינה א' לילדי 4-5</Text>
            <Text style={styles.bulletText}>• מכינה ב' לילדי 5-6 (גן חובה)</Text>
            <Text style={styles.bulletText}>• כיתות א' – ו'</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>התלמידים נהנים ממיטב התנאים, ביניהם:</Text>
            <Text style={styles.bulletText}>• כיתות מרווחות</Text>
            <Text style={styles.bulletText}>• חצר גדולה ועשירה התורמת להתפתחות הילדים</Text>
            <Text style={styles.bulletText}>• פעילויות וימי כיף</Text>
            <Text style={styles.bulletText}>• ארוחות חמות ומזינות</Text>
            <Text style={styles.bulletText}>• מקצועיות</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>מקצועיות</Text>
            <Text style={styles.sectionText}>
              מתוך ראיה חינוכית כוללת, והרצון למצות את הפוטנציאל הגלום בכל תלמיד ותלמיד, הושם דגש על פיתוח ושכלול המקצועות הנלמדים כך שיכילו ערך מוסף כמו גם את ממד החוויה וההנאה לצד מקצועיות בלתי מתפשרת. אנו מאמינים כי שילוב זה, של מלמדים מקצועיים בעלי ניסיון מחד ולמידה חווייתית מאידך, אכן יובילו בעזרת השם לתוצאה המקווה והיא – תלמיד הממצה את יכולותיו עד מידת גבול היכולת.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>שילוב בית ספרי</Text>
            <Text style={styles.sectionText}>
              מתוך דאגה לקידומו הלימודי והרגשי של כל תלמיד, הוקם צוות שילוב מקצועי שמטרתו לפתח ולהעצים יכולות למידה באופן פרטני אצל התלמידים הזקוקים לכך. לכל תלמיד מותאמת תכנית אישית המועברת בצורה חווייתית ומהנה, כאשר השיעורים עצמם נמסרים ע"י מלמדים מקצועיים ומנוסים בעלי וותק ותארים ומפוקחים ע"י פיקוח מטעם משרד החינוך.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>תחום ריכוז מקצוע האנגלית</Text>
            <Text style={styles.sectionText}>
              שפת האנגלית היא שפת העסקים והמסחר הבינלאומית, והשפה הראשונה הנרכשת כשפה שניה ברחבי העולם. קידום למידת השפה בת"ת תופס חלק ניכר ומשמעותי כחלק מקידום הלמידה הכללית, והיא מתבצעת באופן חווייתי ומגוון. העשרת אוצר המילים ושליטה מקצועית בשפה, בדיבור קריאה וכתיבה הינה אחת מבין המטרות המוצבות לפני צוות ההוראה בתחום האנגלית. השאיפה לחולל בתלמידים עניין ומוטיבציה עצמיים לרכישת השפה באה לידי ביטוי הן בשיעורים המלווים בעזרי למידה מתאימים, הן במבצעים מאתגרים וחוברות למידה ועוד. במסגרת תחום זה מבוצעים פרויקטים שנתיים ע"י המורים המלווים ועוקבים אחר התקדמותו של כל תלמיד, מתוך מטרה להכין ולהגיש את התלמידים למבחני המיצ"ב של הרשת ומשרד החינוך.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>תחום הבנת הנקרא</Text>
            <Text style={styles.sectionText}>
              על מנת להעשיר את שפת התלמידים ולפתח הבנת נקרא יצירתית וחשיבה עצמית, משולבים בתוכנית למידת הקריאה שירים וסיפורים ואמצעי העשרה שפתית נוספים. כלל התוכנית נבנתה מתוך שיקול דעת חינוכית ודידקטית ברמה מקצועית ואמנותית גבוהה.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>תחום ריכוז מתמטיקה</Text>
            <Text style={styles.sectionText}>
              לימוד המתמטיקה מכיל בתוכו יכולות אנליטיות חשובות. תוך כדי לימוד המקצוע נחשפים התלמידים למושגים מתמטיים שונים, אופרטורים ויחסים בין מספרים, ניתוח וייצוג שאלות בצורה מתמטית, הסקה לוגית לצרכי הנמקה, הכללה ועוד. תכנית הלמידה מבוצעת בהתאמה לתכנית הלימודים החדשה של משרד החינוך, תכנית השמה דגש על פיתוח חשיבה מתמטית, שליטה במיומנויות כמו גם מציאת אסטרטגיות פתרון שונות, הכרת השפה המתמטית והשימוש הנכון בה, התמודדות עם בעיות ומשימות חקר. הילדים לומדים בצורה הדרגתית – מהקל אל הקשה, מהמוחשי אל המופשט. הלמידה נעשית תוך קישור לסיטואציות מחיי היום יום תוך ביצוע התאמות לכיתה הטרוגנית, הכל מתוך מטרה לחבב את המקצוע על התלמידים ללא ויתור על רמת הלמידה.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>מחשבים</Text>
            <Text style={styles.sectionText}>
              חדר מחשבים מאובזר ומקצועי המלווה בעזרים טכנולוגיים מתקדמים ייפתח בקרוב.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>להרשמה</Text>
            <View style={styles.contactInfo}>
              <Pressable style={styles.contactRow} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color={PRIMARY_RED} />
                <Text style={styles.contactText}>טל: 1599-50-20-51 שלוחה 3</Text>
              </Pressable>
              <Pressable style={styles.contactRow} onPress={handleFax}>
                <Ionicons name="print-outline" size={20} color={PRIMARY_RED} />
                <Text style={styles.contactText}>פקס: 1532-6225955</Text>
              </Pressable>
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={20} color={PRIMARY_RED} />
                <Text style={styles.contactText}>רח' מרינוב 10, הר חומה ירושלים</Text>
              </View>
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
  contactInfo: {
    gap: 12,
    marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
  },
})

