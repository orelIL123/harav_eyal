import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, Linking, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../utils/AuthContext'
import { getFaithStories } from '../services/faithStoriesService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function FaithStoriesScreen({ navigation }) {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await getFaithStories()
      // Filter only active stories
      const activeStories = (data || []).filter(story => story.isActive !== false)
      setStories(activeStories)
    } catch (error) {
      console.error('Error loading stories:', error)
      // Don't show alert for permission errors - just show empty state
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const handleStoryPress = (story) => {
    if (story.type === 'video' && story.mediaUrl) {
      // Open video URL (YouTube or direct link)
      Linking.openURL(story.mediaUrl).catch(() => {
        Alert.alert('שגיאה', 'לא ניתן לפתוח את הסרטון')
      })
    } else {
      // For text stories, show details
      Alert.alert(
        story.title || 'סיפור אמונה',
        story.content || '',
        [{ text: 'סגור', style: 'cancel' }]
      )
    }
  }

  const handleShare = (story) => {
    const message = story.type === 'video' 
      ? `${story.title}\n${story.mediaUrl || ''}`
      : `${story.title}\n${story.content || ''}`
    
    Alert.alert('שיתוף', 'הפונקציה תתווסף בקרוב')
  }

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
        <Text style={styles.headerTitle}>סיפורי אמונה</Text>
        {isAdmin && (
          <Pressable
            style={styles.adminButton}
            onPress={() => navigation.navigate('Admin', { initialTab: 'faithStories' })}
            accessibilityRole="button"
        >
            <Ionicons name="create-outline" size={18} color={PRIMARY_RED} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>סיפורים קצרים ומעוררי השראה על אמונה וביטחון</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>טוען סיפורים...</Text>
          </View>
        ) : stories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין סיפורים זמינים כרגע</Text>
            {isAdmin && (
              <Pressable
                style={styles.addButton}
                onPress={() => navigation.navigate('Admin', { initialTab: 'faithStories' })}
              >
                <Text style={styles.addButtonText}>הוסף סיפור ראשון</Text>
        </Pressable>
      )}
    </View>
        ) : (
          stories.map((story, idx) => (
            <Pressable
              key={story.id}
              style={[styles.storyCard, idx === 0 && styles.storyCardFirst]}
              onPress={() => handleStoryPress(story)}
              accessibilityRole="button"
              accessibilityLabel={`סיפור ${story.title}`}
            >
              {story.thumbnailUrl || story.mediaUrl ? (
                <ImageBackground
                  source={{ uri: story.thumbnailUrl || story.mediaUrl }}
                  style={styles.storyImage}
                  imageStyle={styles.storyImageRadius}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
                    style={StyleSheet.absoluteFill}
                  />
                  {story.type === 'video' && (
                    <View style={styles.videoBadge}>
                      <Ionicons name="play-circle" size={32} color="#fff" />
                    </View>
                  )}
                  <View style={styles.storyContent}>
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    {story.content && (
                      <Text style={styles.storyText} numberOfLines={2}>
                        {story.content}
                      </Text>
                    )}
                    <View style={styles.storyFooter}>
                      <View style={styles.storyMeta}>
                        <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.storyAuthor}>{story.author || 'הרב אייל עמרמי'}</Text>
                      </View>
                      <View style={styles.storyStats}>
                        {story.views > 0 && (
                          <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.statText}>{story.views}</Text>
                          </View>
                        )}
                        {story.likes > 0 && (
                          <View style={styles.statItem}>
                            <Ionicons name="heart-outline" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.statText}>{story.likes}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={styles.storyCardNoImage}>
                  <LinearGradient
                    colors={[PRIMARY_RED, PRIMARY_GOLD]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.storyContentNoImage}>
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name={story.type === 'video' ? 'videocam-outline' : 'heart-outline'} 
                        size={48} 
                        color="#fff" 
                      />
                    </View>
                    <Text style={styles.storyTitleNoImage}>{story.title}</Text>
                    {story.content && (
                      <Text style={styles.storyTextNoImage} numberOfLines={3}>
                        {story.content}
                      </Text>
                    )}
                    <View style={styles.storyFooterNoImage}>
                      <Text style={styles.storyAuthorNoImage}>
                        {story.author || 'הרב אייל עמרמי'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Pressable>
          ))
        )}

        <View style={styles.footerCard}>
          <Ionicons name="heart-outline" size={28} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>סיפורים נוספים</Text>
            <Text style={styles.footerDesc}>
              סיפורי אמונה נוספים יופיעו כאן בקרוב.
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
  adminButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.12)',
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
    marginBottom: 8,
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
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
  },
  addButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: PRIMARY_RED,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  storyCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    minHeight: 200,
  },
  storyCardFirst: {
    marginTop: 6,
  },
  storyImage: {
    height: 250,
    justifyContent: 'flex-end',
  },
  storyImageRadius: {
    borderRadius: 22,
  },
  videoBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  storyContent: {
    padding: 18,
  },
  storyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  storyText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: 12,
  },
  storyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storyAuthor: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  storyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  storyCardNoImage: {
    borderRadius: 22,
    overflow: 'hidden',
    minHeight: 200,
  },
  storyContentNoImage: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: 16,
  },
  storyTitleNoImage: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  storyTextNoImage: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  storyFooterNoImage: {
    marginTop: 'auto',
  },
  storyAuthorNoImage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
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
})
