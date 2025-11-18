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

export default function KindergartenScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>גני ילדים</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.iconContainer}>
            <Ionicons name="flower" size={64} color={PRIMARY_RED} />
          </View>

          <Text style={styles.title}>גני ילדים ותלמוד תורה כאייל תערוג</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionText}>
              מתחם הגנים של הת"ת מפעיל ששה גני ילדים: 3 גני בנים ו- 3 גני בנות.
            </Text>
            <Text style={styles.sectionText}>
              צוות הגננות הינו צוות חם ומקצועי, שנבחר בקפידה ובזהירות רבה, גננות בעלות התמחות בחינוך לגיל הרך והמחזיקות בתארים אקדמיים רלוונטיים.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>יתרונות פדגוגיים</Text>
            
            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>מוכנות לכיתה א'</Text>
              <Text style={styles.sectionText}>
                כחלק מהכנת הפעוטות לעליה למערכת הלימודים העל-גנית, מתקיימת מדי שנה תכנית מיוחדת – "מוכנות לכיתה א'" תכנית פרטנית המותאמת לרמה האישית של כל ילד. הנרשמים לתוכנית ייהנו ממפגשים העורכים היכרות חווייתית עם אתגרי העלייה לכיתה א'. את לימודי הטרום קריאה יערכו בשיטה ייחודית ומקצועית בליווי מכון ברנשטיין המתמחה בלימוד הקריאה בישראל.
              </Text>
            </View>

            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>ריכוז חברתי</Text>
              <Text style={styles.sectionText}>
                דגש מיוחד מושם בת"ת על חשיבות "בין האדם לחבירו" ועזרה לזולת, זאת באמצעות מבצעים ותגמולים ופעילויות חברתיות המחנכות לנושאים חשובים אלו. פעילויות חברתיות נערכות גם בשוטף אם בזמן ההפסקות אם באמצעות אתגרי למידה, חידונים ושעשועונים במהלכם זוכים התלמידים בפרסים יקרי ערך – בכך מתקיים בהם בפועל "ללמוד וללמד לשמור ולעשות".
              </Text>
            </View>

            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>זה"ב</Text>
              <Text style={styles.sectionText}>
                תחום הזהירות בדרכים מקבל מימד חשוב לאין ערוך בהנגשת כללי הבטיחות בצורה מאתגרת וחווייתית הן בזמן המוקצה ללמידה תיאורטית והן בלימוד מעשי בשטח.
              </Text>
            </View>

            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>פרויקט "מעברים"</Text>
              <Text style={styles.sectionText}>
                פרויקט חינוך לצד הכלה – פרויקט שמטרתו להעניק כלים חינוכיים משמעותיים לצוות החינוכי.
              </Text>
            </View>
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

