import React, { useState, useRef } from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, Dimensions, Linking, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import YoutubePlayer from 'react-native-youtube-iframe'
import { useTranslation } from 'react-i18next'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Helper function to extract YouTube ID from URL
function extractYouTubeId(url) {
  if (!url) return null
  
  // Clean the URL - remove whitespace
  const cleanUrl = url.trim()
  
  // Try multiple patterns to catch all YouTube URL formats
  const patterns = [
    // Live stream URLs: youtube.com/live/VIDEO_ID or youtube.com/live/VIDEO_ID?si=...
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    // Shorts URLs: youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    // Standard watch URLs: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
    // Short URLs: youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URLs: youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // Mobile URLs: m.youtube.com/watch?v=VIDEO_ID
    /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // Short URLs with parameters: youtu.be/VIDEO_ID?t=...
    /youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|&|$)/,
    // Alternative format: youtube.com/v/VIDEO_ID
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  // Fallback: try to extract any 11-character alphanumeric string after common YouTube patterns
  const fallbackPattern = /(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const fallbackMatch = cleanUrl.match(fallbackPattern)
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1]
  }
  
  return null
}

export default function VideoPlayerScreen({ navigation, route }) {
  const { t } = useTranslation()
  const { videoId, title, url } = route?.params || {}
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const playerRef = useRef(null)

  // Extract video ID from URL if not provided directly
  const getVideoId = () => {
    if (videoId) return videoId
    if (url) {
      return extractYouTubeId(url)
    }
    return null
  }

  const finalVideoId = getVideoId()

  const onStateChange = (state) => {
    if (state === 'ended') {
      setIsPlaying(false)
    } else if (state === 'playing') {
      setIsPlaying(true)
      setLoading(false)
      setError(false)
    } else if (state === 'paused') {
      setIsPlaying(false)
    }
  }

  if (!finalVideoId) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('lessons.back')}
          >
            <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('lessons.videoPlayer')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={PRIMARY_RED} />
          <Text style={styles.errorText}>{t('lessons.invalidVideo')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Handle player ready
  const handlePlayerReady = () => {
    setLoading(false)
    setError(false)
  }

  // Handle player error
  const handlePlayerError = (error) => {
    console.error('YouTube player error:', error)
    setLoading(false)
    setError(true)
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || t('lessons.videoPlayer')}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>{t('lessons.loadingVideo')}</Text>
          </View>
        )}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={PRIMARY_RED} />
            <Text style={styles.errorText}>{t('lessons.videoLoadError')}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setError(false)
                setLoading(true)
                setIsPlaying(true)
              }}
            >
              <Text style={styles.retryButtonText}>{t('lessons.retry')}</Text>
            </Pressable>
            <Pressable
              style={[styles.retryButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: PRIMARY_RED }]}
              onPress={() => {
                const youtubeUrl = `https://www.youtube.com/watch?v=${finalVideoId}`
                Linking.openURL(youtubeUrl).catch(() => {
                  Alert.alert(t('lessons.error'), t('lessons.cannotOpenLink'))
                })
              }}
            >
              <Ionicons name="logo-youtube" size={20} color={PRIMARY_RED} style={{ marginRight: 8 }} />
              <Text style={[styles.retryButtonText, { color: PRIMARY_RED }]}>{t('lessons.watchOnYouTube')}</Text>
            </Pressable>
          </View>
        ) : (
          <YoutubePlayer
            ref={playerRef}
            height={SCREEN_WIDTH * 0.5625} // 16:9 aspect ratio
            play={isPlaying}
            videoId={finalVideoId}
            onChangeState={onStateChange}
            onReady={handlePlayerReady}
            onError={handlePlayerError}
            webViewStyle={{ opacity: 0.99 }}
            initialPlayerParams={{
              controls: 1,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
            }}
          />
        )}
      </View>

      {/* Video Info */}
      {title && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>{title}</Text>
        </View>
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
    paddingBottom: 8,
    backgroundColor: BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  videoContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: PRIMARY_RED,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
    lineHeight: 26,
  },
})

