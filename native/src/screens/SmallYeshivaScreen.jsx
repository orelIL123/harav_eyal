import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Animated, Linking, Alert } from 'react-native'
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

export default function SmallYeshivaScreen({ navigation }) {
  const fade = useFadeIn()

  const handleCall = () => {
    Linking.openURL('tel:0527145159').catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הטלפון')
    })
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
        <Text style={styles.headerTitle}>ישיבה קטנה 'אמרי שפר'</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.iconContainer}>
            <Ionicons name="library" size={64} color={PRIMARY_RED} />
          </View>

          <Text style={styles.title}>ישיבה קטנה לצעירים מצויינים "אמרי שפר"</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionText}>
              הישיבה לצעירים 'אמרי שפר' הוקמה לפני מספר שנים על ידי הרב אייל עמרמי שליט"א בברכתו ועידודו של מרן מלכא שר התורה הרב עובדיה יוסף זצוק"ל.
            </Text>
            <Text style={styles.sectionText}>
              צוות חינוכי מהמעלה הראשונה מלווה את הישיבה, צוות בעל למעלה מ- 20 שנות ניסיון חינוכי בכלל וחינוך בחורים בפרט.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>דרך הלימוד בישיבה</Text>
            <Text style={styles.sectionText}>
              דרך הלימוד בישיבה הינה כמסורת הישיבות: לימוד גמרא ומפרשיה הן בעומק העיון והן בהגשת בקיאות, דקדוק הלכה ומנהג, והקפדה על שמירת הסדרים ותפילות ישיבתיות.
            </Text>
            <Text style={styles.sectionText}>
              לצד ההעמקה בלימוד מושם דגש מיוחד בישיבה על יראת שמים, מידות ודרך ארץ ותיקון המעשים. סדר המוסר בישיבה מהווה גולת כותרת ייחודית, ממנו יסוד וממנו פינה לפיתוח ושכלול "בין האדם לחבירו".
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>מספר התלמידים</Text>
            <Text style={styles.sectionText}>
              הישיבה מונה כיום כ- 25 תלמידים, כאשר מדי שנה עולה המספר עקב רצונם של טובי התלמידים בעיר להסתופף בצילה.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>'זמן אלול'</Text>
            <Text style={styles.sectionText}>
              'זמן אלול' הינו זמן ידוע בכוחו המיוחד ובהשפעתו הרבה על עיצוב השנה כולה ברמה התורנית בפרט, היסודות האמיתיים ניטעים בזמן זה.
            </Text>
            <Text style={styles.sectionText}>
              עם התקרבותנו ל'זמן אלול', ההרשמה לשנת הלימודים תופסת תאוצה, ומספר המקומות מוגבל.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>לפרטים והרשמה</Text>
            <View style={styles.contactInfo}>
              <Pressable style={styles.contactRow} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color={PRIMARY_RED} />
                <Text style={styles.contactText}>הרב יקותיאל – 052-7145159</Text>
                <Ionicons name="call" size={18} color={PRIMARY_RED} style={{ marginRight: 4 }} />
              </Pressable>
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

