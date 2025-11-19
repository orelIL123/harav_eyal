import React, { useState, useRef } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Share, Alert, Modal } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import ViewShot from 'react-native-view-shot'
import { createAndShareStory } from '../utils/storyShare'
import StoryCard from '../components/StoryCard'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

// דוגמאות - בהמשך יגיעו מה-API/אדמין
const COMMUNITY_NEWS = [
  {
    id: 'news-1',
    title: 'חדשות הקהילה',
    date: new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: 'עדכונים וחדשות מהקהילה',
    imageUrl: null,
  },
  {
    id: 'news-2',
    title: 'אירוע קהילתי קרוב',
    date: new Date(Date.now() + 7 * 86400000).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: 'אירועים ופעילויות קהילתיות קרובות',
    imageUrl: null,
    isEvent: true,
  },
]

export default function CommunityNewsScreen({ navigation }) {
  const [sharingStory, setSharingStory] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const storyRef = useRef(null)

  const handleShare = (article) => {
    Share.share({
      message: `${article.title}\n${article.summary}`
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
        <Text style={styles.headerTitle}>חדשות הקהילה</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>עדכונים וחדשות מהקהילה</Text>

        {COMMUNITY_NEWS.map((article, idx) => (
          <Pressable
            key={article.id}
            style={[styles.articleCard, idx === 0 && styles.articleCardFirst]}
            accessibilityRole="button"
          >
            <View style={styles.articleContent}>
              <View style={styles.articleTextBlock}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleDate}>{article.date}</Text>
                <Text style={styles.articleSummary}>{article.summary}</Text>
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
        ))}

        <View style={styles.footerCard}>
          <Ionicons name="newspaper-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>חדשות נוספות</Text>
            <Text style={styles.footerDesc}>
              חדשות נוספות יופיעו כאן. האדמין יעדכן את החדשות דרך פאנל הניהול.
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
                article={selectedArticle?.isEvent ? null : selectedArticle} 
                event={selectedArticle?.isEvent ? selectedArticle : null} 
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
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  articleCardFirst: {
    marginTop: 6,
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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

