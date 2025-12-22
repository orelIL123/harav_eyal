import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert, Image, ImageBackground, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { LESSON_CATEGORIES } from '../data/lessons'
import { getLessons } from '../services/lessonsService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function LessonsLibraryScreen({ navigation, route }) {
  const { t } = useTranslation()
  const initialCategory = route?.params?.initialCategory || LESSON_CATEGORIES[0]?.key || 'emuna'
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  
  // Ensure activeCategory is always valid
  React.useEffect(() => {
    if (!activeCategory || !LESSON_CATEGORIES.find(cat => cat.key === activeCategory)) {
      setActiveCategory(LESSON_CATEGORIES[0]?.key || 'emuna')
    }
  }, [])
  const [selectedRandomVideo, setSelectedRandomVideo] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollViewRef = React.useRef(null)
  const videoRefs = React.useRef({})
  
  // Update category if route params change
  React.useEffect(() => {
    if (route?.params?.initialCategory) {
      setActiveCategory(route.params.initialCategory)
    }
  }, [route?.params?.initialCategory])

  // Load lessons from Firestore
  useEffect(() => {
    loadLessons()
  }, [activeCategory])

  const loadLessons = async () => {
    try {
      setLoading(true)
      // Ensure activeCategory is always set
      const categoryToLoad = activeCategory || LESSON_CATEGORIES[0].key
      console.log('Loading lessons for category:', categoryToLoad)
      
      // Get static lessons for this category
      const currentCategory = LESSON_CATEGORIES.find(cat => cat.key === categoryToLoad) || LESSON_CATEGORIES[0]
      const staticVideos = currentCategory.videos || []
      console.log('Static lessons for category:', staticVideos.length)
      
      // Get Firestore lessons for this category
      let firestoreVideos = []
      try {
        const firestoreLessons = await getLessons(categoryToLoad)
        console.log('Loaded lessons from Firestore:', firestoreLessons.length)
        
        // Convert Firestore lessons to video format
        firestoreVideos = firestoreLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          date: lesson.date || '',
          videoId: lesson.videoId || '',
          url: lesson.url || `https://www.youtube.com/watch?v=${lesson.videoId}`,
          thumbnailUrl: lesson.thumbnailUrl || null,
          category: lesson.category || categoryToLoad,
          source: 'firestore', // Mark as from Firestore
        }))
      } catch (firestoreError) {
        console.error('Error loading from Firestore:', firestoreError)
        // Continue with static data if Firestore fails
      }
      
      // Combine static and Firestore videos
      // Use a Set to avoid duplicates based on videoId
      const videoMap = new Map()
      
      // Add static videos first
      staticVideos.forEach(video => {
        if (video.videoId) {
          videoMap.set(video.videoId, {
            ...video,
            source: 'static',
          })
        }
      })
      
      // Add Firestore videos (they will override static ones with same videoId)
      firestoreVideos.forEach(video => {
        if (video.videoId) {
          videoMap.set(video.videoId, video)
        } else {
          // If no videoId, use id as key
          videoMap.set(video.id, video)
        }
      })
      
      // Convert map to array and sort by date/order
      const allVideos = Array.from(videoMap.values())
      
      // Sort: Firestore lessons first (by order desc), then static lessons
      allVideos.sort((a, b) => {
        // Firestore lessons with order field come first
        if (a.source === 'firestore' && a.order && b.source === 'static') return -1
        if (b.source === 'firestore' && b.order && a.source === 'static') return 1
        if (a.source === 'firestore' && a.order && b.source === 'firestore' && b.order) {
          return (b.order || 0) - (a.order || 0)
        }
        return 0
      })
      
      console.log('Total videos after merge:', allVideos.length)
      setLessons(allVideos)
    } catch (error) {
      console.error('Error loading lessons:', error)
      // Fallback to static data if everything fails
      const currentCategory = LESSON_CATEGORIES.find(cat => cat.key === (activeCategory || LESSON_CATEGORIES[0].key)) || LESSON_CATEGORIES[0]
      setLessons(currentCategory.videos || [])
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = LESSON_CATEGORIES.find(cat => cat.key === activeCategory) || LESSON_CATEGORIES[0]
  const displayVideos = lessons.length > 0 ? lessons : (currentCategory.videos || [])

  const openVideo = (video) => {
    // Navigate to video player screen instead of opening YouTube externally
    navigation.navigate('VideoPlayer', {
      videoId: video.videoId,
      title: video.title,
      url: video.url,
    })
  }

  const openRandomVideo = () => {
    if (displayVideos && displayVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * displayVideos.length)
      const randomVideo = displayVideos[randomIndex]
      setSelectedRandomVideo(randomVideo.id)
      
      // Scroll to the random video after a short delay
      setTimeout(() => {
        const videoRef = videoRefs.current[randomVideo.id]
        if (videoRef && scrollViewRef.current) {
          videoRef.measureLayout(
            scrollViewRef.current,
            (x, y) => {
              scrollViewRef.current?.scrollTo({ y: y - 20, animated: true })
            },
            () => {
              // Fallback: try measureInWindow
              videoRef.measureInWindow((x, y) => {
                scrollViewRef.current?.scrollTo({ y: y - 100, animated: true })
              })
            }
          )
        }
      }, 300)
    } else {
      Alert.alert(t('lessons.noLessons'), t('lessons.noLessonsInCategory'))
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />

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
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>{t('lessons.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('lessons.subtitle')}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {LESSON_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[
              styles.categoryPill,
              activeCategory === cat.key && styles.categoryPillActive
            ]}
            onPress={() => setActiveCategory(cat.key)}
            accessibilityRole="button"
            accessibilityLabel={cat.title}
          >
            <Ionicons
              name={cat.icon}
              size={20}
              color={activeCategory === cat.key ? '#fff' : PRIMARY_RED}
            />
            <Text 
              style={[
                styles.categoryPillText,
                activeCategory === cat.key && styles.categoryPillTextActive
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {cat.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Videos List */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryHeader}>
          <View style={styles.categoryHeaderContent}>
            <Ionicons name={currentCategory.icon} size={28} color={PRIMARY_RED} />
            <View style={styles.categoryHeaderText}>
              <Text style={styles.categoryTitle}>{currentCategory.title}</Text>
              <Text style={styles.categoryCount}>
                {t('lessons.lessonsCount', { count: displayVideos.length })}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.randomButton}
            onPress={openRandomVideo}
            accessibilityRole="button"
            accessibilityLabel={t('lessons.randomLesson')}
          >
            <Ionicons name="shuffle" size={22} color="#fff" />
            <Text style={styles.randomButtonText}>{t('lessons.randomLesson')}</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>{t('lessons.loading')}</Text>
          </View>
        ) : (
          displayVideos.map((video, idx) => {
          // Use custom thumbnail if available, otherwise use YouTube thumbnail
          const thumbnailUrl = video.thumbnailUrl || (video.videoId ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` : null)
          const isSelected = selectedRandomVideo === video.id
          return (
            <View
              key={video.id}
              ref={(ref) => {
                if (ref) {
                  videoRefs.current[video.id] = ref
                }
              }}
            >
              <Pressable
                style={[
                  styles.videoCard, 
                  idx === 0 && styles.videoCardFirst,
                  isSelected && styles.videoCardSelected
                ]}
                onPress={() => openVideo(video)}
                accessibilityRole="button"
                accessibilityLabel={t('lessons.lessonLabel', { title: video.title })}
              >
              {thumbnailUrl ? (
                <ImageBackground
                  source={{ uri: thumbnailUrl }}
                  style={styles.videoThumbnail}
                  imageStyle={styles.videoThumbnailImage}
                  defaultSource={require('../../assets/icon.png')}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.playButtonOverlay}>
                    <Ionicons name="play-circle" size={48} color="#fff" />
                  </View>
                </ImageBackground>
              ) : (
                <View style={[styles.videoThumbnail, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="play-circle-outline" size={64} color={PRIMARY_RED} />
                </View>
              )}
              <View style={styles.videoContent}>
                <View style={styles.videoTextBlock}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  {video.date && (
                    <View style={styles.videoDateRow}>
                      <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                      <Text style={styles.videoDate}>{video.date}</Text>
                    </View>
                  )}
                  <View style={styles.videoMetaRow}>
                    <Ionicons name="play-circle" size={16} color={PRIMARY_RED} />
                    <Text style={styles.videoMeta}>{t('lessons.watchVideo')}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
              </View>
              </Pressable>
            </View>
          )
        })
        )}

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
  headerTextBlock: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(220,38,38,0.2)',
    minWidth: 110,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textAlign: 'center',
    lineHeight: 18,
  },
  categoryPillTextActive: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  categoryHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryHeaderText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  categoryTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  categoryCount: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  videoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
    marginBottom: 10,
  },
  videoCardFirst: {
    marginTop: 4,
  },
  videoCardSelected: {
    borderWidth: 3,
    borderColor: PRIMARY_RED,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  videoThumbnail: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnailImage: {
    resizeMode: 'cover',
  },
  playButtonOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
    padding: 8,
  },
  videoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  videoTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  videoTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
    lineHeight: 24,
  },
  videoDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-end',
  },
  videoDate: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
  },
  videoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-end',
  },
  videoMeta: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
    textAlign: 'right',
  },
  adminNote: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(220,38,38,0.08)',
  },
  adminNoteText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  adminNoteTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  adminNoteDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
    lineHeight: 18,
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY_RED,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  randomButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    letterSpacing: 0.3,
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
})
