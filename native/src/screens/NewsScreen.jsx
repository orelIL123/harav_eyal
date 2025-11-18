import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, Share, Linking, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const ARTICLES = [
  {
    id: 'news-1',
    title: 'מוסדות הרב',
    date: new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: 'מידע על המוסדות, תמונות ועוד',
    image: require('../../assets/icon.png'),
  },
  {
    id: 'news-2',
    title: 'זריקת אמונה',
    date: new Date(Date.now() - 86400000).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: 'תובנות מעולם התורה והאמונה',
    image: require('../../assets/photos/זריקת אמונה.png'),
  },
  {
    id: 'news-3',
    title: 'שיעורי הרב',
    date: new Date(Date.now() - 172800000).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: 'שיעורי תורה לצפייה',
    image: require('../../assets/photos/שיעורי_הרב.jpg'),
  },
]

export default function NewsScreen({ navigation }) {
  const handleShare = React.useCallback((article) => {
    Share.share({
      message: `${article.title}\n${article.summary}`
    }).catch(() => {})
  }, [])

  const handleOpenCharityLink = React.useCallback(() => {
    const url = 'https://www.jgive.com/new/he/ils/charity-organizations/1711'
    Linking.openURL(url).catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f4f6f9']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>מוסדות הרב</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>מידע על המוסדות, תמונות ועוד</Text>

        {/* קישור לדף העמותה */}
        <Pressable
          style={styles.charityLinkCard}
          onPress={handleOpenCharityLink}
          accessibilityRole="button"
        >
          <Ionicons name="link-outline" size={28} color={PRIMARY_RED} />
          <View style={styles.charityLinkTextBlock}>
            <Text style={styles.charityLinkTitle}>דף העמותה</Text>
            <Text style={styles.charityLinkDesc}>
              למידע נוסף על העמותה באתר JGive
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
        </Pressable>

        {/* על העמותה */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>על העמותה</Text>
          <Text style={styles.sectionText}>
            בשנת תש"ע הוקמה קהילת 'כאייל תערוג' בשכונת הר חומה בירושלים, על ידי איש החסד הגאון הרב אייל עמרמי שליט"א. מוסדות 'כאייל תערוג' מונות גני ילדים, בית ספר לבנות, סמינר לבנות, תלמוד תורה לבנים, ישיבה קטנה וגדולה, מועדונית נוער לכיתות ו'-ח', כולל אברכים, ומרכז תורה וחסד הפועל 24 שעות ביממה שבעה ימים בשבוע. קהילת 'כאייל תערוג' מונה כ-750 משפחות, 93 אנשי צוות ומעל 1,000 תלמידים ואברכים ועוד היד נטויה. בימים אלו מורנו הרה"ג אייל עמרמי שליט"א מגשים את חזון להקמת בית התבשיל הגדול בירושלים ולהאכיל 400 מנות בכל יום.
          </Text>
        </View>

        {ARTICLES.map((article, idx) => (
          <Pressable
            key={article.id}
            style={[styles.articleCard, idx === 0 && styles.articleCardFirst]}
            onPress={() => navigation.navigate('DailyInsight')}
            accessibilityRole="button"
            accessibilityLabel={`כתבה ${article.title}`}
          >
            <ImageBackground source={article.image} style={styles.articleCover} imageStyle={styles.articleCoverRadius}>
              <LinearGradient colors={[ 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.1)' ]} style={StyleSheet.absoluteFill} />
              <View style={styles.articleTopRow}>
                <View style={styles.datePill}>
                  <Ionicons name="calendar-outline" size={14} color={PRIMARY_RED} />
                  <Text style={styles.dateText}>{article.date}</Text>
                </View>
                <Pressable
                  onPress={() => handleShare(article)}
                  style={styles.shareIconBtn}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`שיתוף ${article.title}`}
                >
                  <Ionicons name="share-social-outline" size={18} color={PRIMARY_RED} />
                </Pressable>
              </View>
              <View style={styles.articleBottom}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
              </View>
            </ImageBackground>
          </Pressable>
        ))}

        <Pressable
          style={styles.contactCard}
          onPress={() => navigation.navigate('ContactRabbi')}
          accessibilityRole="button"
        >
          <Ionicons name="mail-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.contactTextBlock}>
            <Text style={styles.contactTitle}>צרו קשר</Text>
            <Text style={styles.contactDesc}>
              לשאלות, בקשות או פניות למוסדות הרב
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
        </Pressable>

        <View style={styles.footerCard}>
          <Ionicons name="create-outline" size={28} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>עדכונים נוספים</Text>
            <Text style={styles.footerDesc}>
              עדכונים נוספים מבית המדרש יופיעו כאן בקרוב.
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
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 18,
  },
  subtitle: {
    alignSelf: 'flex-end',
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  articleCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  articleCardFirst: {
    marginTop: 6,
  },
  articleCover: {
    height: 220,
    justifyContent: 'space-between',
  },
  articleCoverRadius: {
    borderRadius: 22,
  },
  articleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(30,58,138,0.2)',
  },
  dateText: {
    color: '#fef9c3',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  shareIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  articleBottom: {
    padding: 18,
    alignItems: 'flex-end',
    gap: 8,
  },
  articleTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  articleSummary: {
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
  },
  footerCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  footerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  footerTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  footerDesc: {
    color: '#475569',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
    gap: 16,
    marginTop: 12,
  },
  contactTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  contactTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  contactDesc: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
  },
  charityLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
    gap: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  charityLinkTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  charityLinkTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  charityLinkDesc: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
  },
  aboutSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 26,
  },
})
