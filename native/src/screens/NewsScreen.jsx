import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, Share, Linking, Alert, Image, ActivityIndicator, Modal } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import ViewShot from 'react-native-view-shot'
import { getNews } from '../services/newsService'
import { useAuth } from '../utils/AuthContext'
import { createAndShareStory } from '../utils/storyShare'
import StoryCard from '../components/StoryCard'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function NewsScreen({ navigation }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharingStory, setSharingStory] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const storyRef = useRef(null)
  const { isAdmin } = useAuth()

  useEffect(() => {
    loadNews()
  }, [])

  // Reload news when screen comes into focus (e.g., returning from AdminScreen)
  useFocusEffect(
    React.useCallback(() => {
      loadNews()
    }, [])
  )

  const loadNews = async () => {
    try {
      setLoading(true)
      // Get only published news
      const allNews = await getNews(null, true)
      setNews(allNews)
    } catch (error) {
      console.error('Error loading news:', error)
      Alert.alert('שגיאה', 'לא ניתן לטעון את החדשות')
    } finally {
      setLoading(false)
    }
  }
  const handleShare = React.useCallback((article) => {
    const content = article.content || article.summary || ''
    Share.share({
      message: `${article.title}\n${content}`
    }).catch(() => {})
  }, [])

  const handleShareStory = React.useCallback(async (article) => {
    try {
      setSelectedArticle(article)
      setSharingStory(true)
      
      // Wait a bit for the view to render
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (storyRef.current) {
        const success = await createAndShareStory(storyRef.current)
        if (success) {
          Alert.alert('הצלחה!', 'הסטורי מוכן לשיתוף')
        }
      }
    } catch (error) {
      console.error('Error sharing story:', error)
      Alert.alert('שגיאה', 'לא ניתן ליצור את הסטורי')
    } finally {
      setSharingStory(false)
      setTimeout(() => setSelectedArticle(null), 1000)
    }
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
        <View style={styles.headerActions}>
          <Text style={styles.subtitle}>מידע על המוסדות, תמונות ועוד</Text>
          {isAdmin && (
            <Pressable
              style={styles.adminButton}
              onPress={() => navigation.navigate('Admin', { initialTab: 'news' })}
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={18} color={PRIMARY_RED} />
              <Text style={styles.adminButtonText}>ניהול חדשות</Text>
            </Pressable>
          )}
        </View>

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

        {/* News Articles */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>טוען חדשות...</Text>
          </View>
        ) : news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין חדשות זמינות כרגע</Text>
          </View>
        ) : (
          news.map((article, idx) => {
            const articleDate = article.publishedAt 
              ? (article.publishedAt.toDate 
                  ? article.publishedAt.toDate().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })
                  : new Date(article.publishedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }))
              : new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })
            
            const articleSummary = article.content 
              ? (article.content.length > 100 ? article.content.substring(0, 100) + '...' : article.content)
              : ''

            return (
              <Pressable
                key={article.id}
                style={[styles.articleCard, idx === 0 && styles.articleCardFirst]}
                onPress={() => {
                  // Navigate to news detail or show full content
                  Alert.alert(article.title, article.content || articleSummary)
                }}
                accessibilityRole="button"
                accessibilityLabel={`כתבה ${article.title}`}
              >
                {article.imageUrl ? (
                  <ImageBackground 
                    source={{ uri: article.imageUrl }} 
                    style={styles.articleCover} 
                    imageStyle={styles.articleCoverRadius}
                  >
                    <LinearGradient colors={[ 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.1)' ]} style={StyleSheet.absoluteFill} />
                    <View style={styles.articleTopRow}>
                      <View style={styles.datePill}>
                        <Ionicons name="calendar-outline" size={14} color={PRIMARY_RED} />
                        <Text style={styles.dateText}>{articleDate}</Text>
                      </View>
                      <View style={styles.shareButtons}>
                        <Pressable
                          onPress={() => handleShareStory(article)}
                          style={[styles.shareIconBtn, styles.storyShareBtn]}
                          hitSlop={12}
                          accessibilityRole="button"
                          accessibilityLabel={`שתף בסטורי ${article.title}`}
                        >
                          <Ionicons name="logo-instagram" size={18} color="#E4405F" />
                        </Pressable>
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
                    </View>
                    <View style={styles.articleBottom}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <Text style={styles.articleSummary} numberOfLines={2}>{articleSummary}</Text>
                    </View>
                  </ImageBackground>
                ) : (
                  <View style={styles.articleCardNoImage}>
                    <View style={styles.articleTopRow}>
                      <View style={styles.datePill}>
                        <Ionicons name="calendar-outline" size={14} color={PRIMARY_RED} />
                        <Text style={styles.dateText}>{articleDate}</Text>
                      </View>
                      <View style={styles.shareButtons}>
                        <Pressable
                          onPress={() => handleShareStory(article)}
                          style={[styles.shareIconBtn, styles.storyShareBtn]}
                          hitSlop={12}
                          accessibilityRole="button"
                          accessibilityLabel={`שתף בסטורי ${article.title}`}
                        >
                          <Ionicons name="logo-instagram" size={18} color="#E4405F" />
                        </Pressable>
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
                    </View>
                    <View style={styles.articleBottomNoImage}>
                      <Text style={styles.articleTitleNoImage}>{article.title}</Text>
                      <Text style={styles.articleSummaryNoImage} numberOfLines={3}>{articleSummary}</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            )
          })
        )}

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

      {/* Story Generation Modal (Hidden) */}
      {selectedArticle && (
        <Modal visible={sharingStory} transparent animationType="none">
          <View style={styles.storyModal}>
            <ViewShot ref={storyRef} options={{ format: 'png', quality: 1.0 }}>
              <StoryCard 
                article={selectedArticle} 
                event={null}
              />
            </ViewShot>
          </View>
        </Modal>
      )}
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
    backgroundColor: 'rgba(30,58,138,0.2)',
  },
  dateText: {
    color: '#fef9c3',
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
