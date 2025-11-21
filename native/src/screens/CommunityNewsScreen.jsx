import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Share, Alert, Modal, Image, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ViewShot from 'react-native-view-shot'
import { createAndShareStory } from '../utils/storyShare'
import StoryCard from '../components/StoryCard'
import { getNews } from '../services/newsService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function CommunityNewsScreen({ navigation }) {
  const { t } = useTranslation()
  const [sharingStory, setSharingStory] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const storyRef = useRef(null)

  useEffect(() => {
    loadPosts()
  }, [])

  // Reload news when screen comes into focus (e.g., returning from AdminScreen)
  useFocusEffect(
    React.useCallback(() => {
      loadPosts()
    }, [])
  )

  const loadPosts = async () => {
    try {
      setLoading(true)
      // Get all published news from Firebase
      const allNews = await getNews(null, true)
      // Filter to ensure we only show published news with valid data
      const publishedNews = (allNews || []).filter(article => {
        return article && article.isPublished === true && article.title
      })
      console.log('📰 Loaded news:', publishedNews.length, 'articles')
      setPosts(publishedNews)
    } catch (error) {
      console.error('Error loading news:', error)
      // Don't show alert for permission errors - just show empty state
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('Permission denied for news - will show empty state')
      }
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleShare = (article) => {
    const content = article.content || article.summary || ''
    Share.share({
      message: `${article.title}\n${content}`
    }).catch(() => {})
  }

  const handleShareStory = async (article) => {
    try {
      setSelectedArticle(article)
      setSharingStory(true)
      
      // Wait a bit for the view to render
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (storyRef.current) {
        const success = await createAndShareStory(storyRef.current)
        if (success) {
          Alert.alert(t('news.shareStorySuccess'), t('news.shareStoryMessage'))
        }
      }
    } catch (error) {
      console.error('Error sharing story:', error)
      Alert.alert(t('error'), t('news.shareStoryError'))
    } finally {
      setSharingStory(false)
      setTimeout(() => setSelectedArticle(null), 1000)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f4f6f9']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('news.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t('news.subtitle')}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>{t('news.loading')}</Text>
          </View>
        ) : posts.length > 0 ? (
          posts.map((article, idx) => {
            // Handle date from publishedAt or createdAt
            const articleDate = article.publishedAt 
              ? (article.publishedAt.toDate 
                  ? article.publishedAt.toDate().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })
                  : new Date(article.publishedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }))
              : (article.createdAt?.toDate 
                  ? article.createdAt.toDate().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })
                  : new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }))
            
            // Use content as summary (first 150 chars)
            const articleSummary = article.content 
              ? (article.content.length > 150 ? article.content.substring(0, 150) + '...' : article.content)
              : (article.summary || '')
            
            return (
              <Pressable
                key={article.id || idx}
                style={[styles.articleCard, idx === 0 && styles.articleCardFirst]}
                onPress={() => {
                  navigation.navigate('NewsDetail', { article })
                }}
                accessibilityRole="button"
                accessibilityLabel={t('news.articleLabel', { title: article.title })}
              >
                {article.imageUrl && (
                  <Image source={{ uri: article.imageUrl }} style={styles.articleImage} resizeMode="cover" />
                )}
                <View style={styles.articleContent}>
                  <View style={styles.articleTextBlock}>
                    <View style={styles.articleHeader}>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                    </View>
                    <Text style={styles.articleDate}>{articleDate}</Text>
                    {articleSummary && (
                      <Text style={styles.articleSummary} numberOfLines={3}>{articleSummary}</Text>
                    )}
                  </View>
                  <View style={styles.shareButtons}>
                    <Pressable
                      style={[styles.shareButton, styles.storyShareButton]}
                      onPress={() => handleShareStory(article)}
                    >
                      <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                    </Pressable>
                    <Pressable
                      style={styles.shareButton}
                      onPress={() => handleShare(article)}
                    >
                      <Ionicons name="share-social-outline" size={20} color={PRIMARY_RED} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            )
          })
        ) : (
          <View style={styles.footerCard}>
            <Ionicons name="newspaper-outline" size={32} color={PRIMARY_RED} />
            <View style={styles.footerTextBlock}>
              <Text style={styles.footerTitle}>{t('news.noNews')}</Text>
              <Text style={styles.footerDesc}>
                {t('news.noNewsDesc')}
              </Text>
            </View>
          </View>
        )}
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
    paddingBottom: 32,
    gap: 18,
  },
  subtitle: {
    alignSelf: 'flex-end',
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  articleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  articleImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  articleCardFirst: {
    marginTop: 6,
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 18,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220,38,38,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  articleTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  articleTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  articleDate: {
    color: PRIMARY_RED,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'right',
  },
  articleSummary: {
    color: '#6b7280',
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 22,
    marginTop: 4,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  shareButton: {
    padding: 8,
  },
  storyShareButton: {
    backgroundColor: 'rgba(228,64,95,0.1)',
    borderRadius: 8,
  },
  storyModal: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
  footerCard: {
    marginTop: 8,
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
    color: '#4b5563',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
})

