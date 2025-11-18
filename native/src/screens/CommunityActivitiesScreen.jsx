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

export default function CommunityActivitiesScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>פעילות קהילתית</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={64} color={PRIMARY_RED} />
          </View>

          <Text style={styles.title}>מנהל קהילתי – הר חומה</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionText}>
              קהילת 'כאייל תערוג' אינה רק אסופת אנשים המתגוררים יחדיו בבניינים סמוכים, היא גוף חי מחובר יחדיו. על מנת ליצור זאת קיימות פעולות גיבוש שונות על פני מעגל השנה. אם בסעודות שבת משותפות, אם בטיולים במועדים שונים, פעילויות חסד משותפות ועוד ועוד.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>ארגון החסד הקהילתי</Text>
            <Text style={styles.sectionText}>
              ילדת בשעה טובה? ארגון החסד הקהילתי ידאג למזון ולתעסוקה לילדים כך שתוכלי את ובעלך לאגור כוחות לימים שלאחר הלידה.
            </Text>
            <Text style={styles.sectionText}>
              נזקק להלוואה? גם כאן, ארגון הצדקה הקהילתי יתמוך ויסייע על מנת שתוכלו לגבור יחד על תקופה כלכלית קשה ולצאת מהמצר למרחב.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>'טוב שכן קרוב מאח רחוק'</Text>
            <Text style={styles.sectionText}>
              'טוב שכן קרוב מאח רחוק' אמר שלמה המלך בחוכמתו. הפעילויות הקהילתיות של קהילת 'כאייל תערוג' מוציאות פסוק זה מהכוח אל הפועל, קהילה שהיא בית.
            </Text>
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
})

