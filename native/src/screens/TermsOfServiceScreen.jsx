import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f7f7f7']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>תנאי שימוש</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>1. כללי</Text>
          <Text style={styles.text}>
            אפליקציית "הרב אייל עמרמי" הינה אפליקציה חינמית המיועדת לספק תוכן רוחני, שיעורים, חדשות ומידע על מוסדות הרב. השימוש באפליקציה הינו ללא תשלום וללא רכישות כלשהן.
          </Text>

          <Text style={styles.sectionTitle}>2. שימוש באפליקציה</Text>
          <Text style={styles.text}>
            • האפליקציה מיועדת לשימוש אישי בלבד{'\n'}
            • אסור להעתיק, לשכפל או להפיץ את התוכן ללא רשות{'\n'}
            • אסור להשתמש באפליקציה למטרות מסחריות{'\n'}
            • המשתמש מתחייב להשתמש באפליקציה בהתאם לחוק
          </Text>

          <Text style={styles.sectionTitle}>3. תוכן</Text>
          <Text style={styles.text}>
            כל התוכן באפליקציה, כולל טקסטים, תמונות, סרטונים וקבצי אודיו, הינם בבעלות מוסדות הרב אייל עמרמי או בעלי זכויות אחרים. כל הזכויות שמורות.
          </Text>

          <Text style={styles.sectionTitle}>4. פרטיות</Text>
          <Text style={styles.text}>
            אנו מכבדים את פרטיות המשתמשים. פרטים אישיים שנאספים (כגון שם, טלפון, אימייל) ישמשו למטרות קשר, שליחת הודעות והתראות בלבד, בהתאם להסכמה שניתנה.
          </Text>

          <Text style={styles.sectionTitle}>5. אחריות</Text>
          <Text style={styles.text}>
            האפליקציה מסופקת "כפי שהיא" ללא אחריות מכל סוג שהוא. אנו לא נהיה אחראים לכל נזק שייגרם כתוצאה משימוש או אי-שימוש באפליקציה.
          </Text>

          <Text style={styles.sectionTitle}>6. שינויים</Text>
          <Text style={styles.text}>
            אנו שומרים לעצמנו את הזכות לעדכן, לשנות או להפסיק את האפליקציה בכל עת, ללא הודעה מוקדמת.
          </Text>

          <Text style={styles.sectionTitle}>7. רכישות ותשלומים</Text>
          <Text style={styles.text}>
            האפליקציה הינה חינמית לחלוטין ואינה כוללת רכישות, תשלומים או רכישות בתוך האפליקציה (In-App Purchases) מכל סוג שהוא.
          </Text>

          <Text style={styles.sectionTitle}>8. קשר</Text>
          <Text style={styles.text}>
            לכל שאלה או בקשה, ניתן ליצור קשר דרך מסך "צור קשר" באפליקציה או בכתובת: orhaemuna1@gmail.com
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
            </Text>
          </View>
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
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  content: {
    gap: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: PRIMARY_RED,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    lineHeight: 22,
    textAlign: 'right',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(11,27,58,0.1)',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
})

