import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function AboutScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>אודות</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={64} color={PRIMARY_RED} />
        </View>

        <Text style={styles.title}>מוסדות כאייל תערוג</Text>
        <Text style={styles.subtitle}>הרב אייל עמרמי שליט"א</Text>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>אודות הרב אייל עמרמי שליט"א</Text>
          <Text style={styles.sectionText}>
            ראש מוסדות "כאיל תערוג" בהר חומה, ירושלים
          </Text>
          <Text style={styles.sectionText}>
            הרב אייל עמרמי שליט"א הוא מהדמויות המרכזיות והמוערכות בתחום הפצת האמונה וחיזוק הלבבות בדורנו. מאות שיעורים שנמסרים על ידו מדי שנה בארץ ובעולם, מצליחים לגעת באלפי יהודים מכל גווני הקשת, לעורר חיבור עמוק לאמונה, ולהחזיר אור פנימי לחיים.
          </Text>
          <Text style={styles.sectionText}>
            שיעוריו של הרב מאופיינים בבהירות, חום לב, גישה ישירה ואמיתית, ובעיקר – ביכולת נדירה להנגיש את יסודות האמונה גם למי שרחוקים ממנה. הרב מכתת רגליו ממקום למקום במסירות עצומה מתוך שליחות אחת: לחזק כל יהודי באשר הוא בארץ או בעולם.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>הפצת אמונה – לב ליבה של השליחות</Text>
          <Text style={styles.sectionText}>
            שיעוריו של הרב אייל עמרמי שליט"א מהווים תחנת מפנה עבור רבים. הם שזורים בדברי תורה, אמונה, חיזוק ותובנות עמוקות לחיים – ומוגשים בגישה חמה, ישירה ונוגעת ללב. התגובות הרבות והעדויות האישיות מעידות על עומק ההשפעה: אנשים מספרים כיצד מילה אחת, שיעור אחד, או מבט של חום ואמת – שינו להם את החיים, חיזקו את האמונה והעניקו להם כוחות מחודשים להתמודדות ולצמיחה.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>מוסדות "כאיל תערוג"</Text>
          <Text style={styles.sectionSubtitle}>חממה לחינוך ולקירוב לבבות</Text>
          <Text style={styles.sectionText}>
            לצד פעילותו האישית המרשימה, עומד הרב עמרמי בראש מערך חינוכי-רוחני רחב היקף. מוסדות "כאיל תערוג", הפועלים בשכונת הר חומה בירושלים, כוללים:
          </Text>
          <Text style={styles.bulletText}>• גני ילדים</Text>
          <Text style={styles.bulletText}>• תלמוד תורה</Text>
          <Text style={styles.bulletText}>• בית ספר לבנות</Text>
          <Text style={styles.bulletText}>• ישיבה קטנה וגדולה</Text>
          <Text style={styles.bulletText}>• כולל אברכים</Text>
          <Text style={styles.bulletText}>• ועוד</Text>
          <Text style={styles.sectionText}>
            המוסדות פועלים מתוך חזון ברור: להעניק לכל יהודי סביבה תומכת ומרוממת, המחברת בין חינוך, רוח ואמונה – באהבה ובכבוד.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>צרו קשר</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>למזכירות המוסד: 1599-50-20-51</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="print-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>פקס: 02-5023504</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>דוא"ל: orhaemuna1@gmail.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>כתובת בית הכנסת "חסדי שמואל":</Text>
            </View>
            <Text style={styles.addressText}>ירושלים, הר חומה, רחוב הרב מן ההר 4</Text>
          </View>
          <Pressable
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactRabbi')}
          >
            <Ionicons name="mail-outline" size={20} color={PRIMARY_RED} />
            <Text style={styles.contactButtonText}>צרו קשר</Text>
          </Pressable>
        </View>
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
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: PRIMARY_GOLD,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textAlign: 'center',
    marginTop: 8,
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 12,
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
    marginBottom: 16,
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
  addressText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    paddingRight: 28,
    marginTop: -8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
    marginTop: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
})

