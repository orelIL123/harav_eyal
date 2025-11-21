import React, { useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, Share, Linking, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Analytics } from '../services/analyticsService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'
const { width } = Dimensions.get('window')

export default function NewsDetailScreen({ navigation, route }) {
  const { t } = useTranslation()
  const article = route?.params?.article

  // Track news view in Analytics
  useEffect(() => {
    if (article?.id) {
      Analytics.viewNews(article.id)
    }
  }, [article])

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('news.detailTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('news.articleNotFound')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const articleDate = article.publishedAt 
    ? (article.publishedAt.toDate 
        ? article.publishedAt.toDate().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date(article.publishedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }))
    : new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleShare = () => {
    const content = article.content || article.summary || ''
    Share.share({
      message: `${article.title}\n\n${content}`
    }).then(() => {
      // Track share event
      Analytics.shareContent('news', article.id)
    }).catch(() => {})
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f4f6f9']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('lessons.back')}
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
          <Text style={styles.headerTitle}>{t('news.detailTitle')}</Text>
        <Pressable
          style={styles.shareBtn}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel={t('news.share')}
        >
          <Ionicons name="share-social-outline" size={24} color={PRIMARY_RED} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Date */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.dateText}>{articleDate}</Text>
        </View>

        {/* Image */}
        {article.imageUrl && (
          <ImageBackground
            source={{ uri: article.imageUrl }}
            style={styles.articleImage}
            imageStyle={styles.articleImageRadius}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.0)']}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{article.content || article.summary || ''}</Text>
        </View>

        {/* Share Button */}
        <Pressable
          style={styles.shareButton}
          onPress={handleShare}
          accessibilityRole="button"
        >
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>{t('news.shareArticle')}</Text>
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
    paddingBottom: 8,
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
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    lineHeight: 38,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  articleImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  articleImageRadius: {
    borderRadius: 16,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  contentText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    textAlign: 'right',
    lineHeight: 26,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY_RED,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
})

