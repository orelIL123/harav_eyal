import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../utils/AuthContext'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function NewsScreen({ navigation }) {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()

  const handleOpenCharityLink = React.useCallback(() => {
    const url = 'https://www.jgive.com/new/he/ils/charity-organizations/1711'
    Linking.openURL(url).catch(() => {
      Alert.alert(t('error'), t('institutions.linkError'))
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
          accessibilityLabel={t('lessons.back')}
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('institutions.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerActions}>
          <Text style={styles.subtitle}>{t('institutions.subtitle')}</Text>
        </View>

        {/* קישור לדף העמותה */}
        <Pressable
          style={styles.charityLinkCard}
          onPress={handleOpenCharityLink}
          accessibilityRole="button"
        >
          <Ionicons name="link-outline" size={28} color={PRIMARY_RED} />
          <View style={styles.charityLinkTextBlock}>
            <Text style={styles.charityLinkTitle}>{t('institutions.charityPage')}</Text>
            <Text style={styles.charityLinkDesc}>
              {t('institutions.charityPageDesc')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
        </Pressable>

        {/* על העמותה */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>{t('institutions.aboutTitle')}</Text>
          <Text style={styles.sectionText}>
            בשנת תש"ע הוקמה קהילת 'כאייל תערוג' בשכונת הר חומה בירושלים, על ידי איש החסד הגאון הרב אייל עמרמי שליט"א. מוסדות 'כאייל תערוג' מונות גני ילדים, בית ספר לבנות, סמינר לבנות, תלמוד תורה לבנים, ישיבה קטנה וגדולה, מועדונית נוער לכיתות ו'-ח', כולל אברכים, ומרכז תורה וחסד הפועל 24 שעות ביממה שבעה ימים בשבוע. קהילת 'כאייל תערוג' מונה כ-750 משפחות, 93 אנשי צוות ומעל 1,000 תלמידים ואברכים ועוד היד נטויה. בימים אלו מורנו הרה"ג אייל עמרמי שליט"א מגשים את חזון להקמת בית התבשיל הגדול בירושלים ולהאכיל 400 מנות בכל יום.
          </Text>
        </View>

        <Pressable
          style={styles.contactCard}
          onPress={() => navigation.navigate('ContactRabbi')}
          accessibilityRole="button"
        >
          <Ionicons name="mail-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.contactTextBlock}>
            <Text style={styles.contactTitle}>{t('institutions.contact')}</Text>
            <Text style={styles.contactDesc}>
              {t('institutions.contactDesc')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
        </Pressable>

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  adminButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
  },
  articleCardNoImage: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    padding: 18,
  },
  articleBottomNoImage: {
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  articleTitleNoImage: {
    color: DEEP_BLUE,
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  articleSummaryNoImage: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(10px)',
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  datePillNoImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  dateTextNoImage: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  articleTopRowNoImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  readMoreIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  readMoreText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  readMoreIndicatorNoImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  readMoreTextNoImage: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  shareIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  storyShareBtn: {
    backgroundColor: 'rgba(228,64,95,0.3)',
  },
  storyModal: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
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
