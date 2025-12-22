import React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Share, TextInput, Modal, Alert, ActivityIndicator, Image, Animated, Dimensions, Linking, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Audio, Video } from 'expo-av'
import * as DocumentPicker from 'expo-document-picker'
import { getDailyVideos } from '../services/dailyVideosService'
import { useAuth } from '../utils/AuthContext'
import { pickVideo, recordVideo, uploadVideoToStorage, generateDailyVideoPath, saveDailyInsightLastViewed } from '../utils/storage'
import { createDailyVideo } from '../services/dailyVideosService'
import { getDailyInsightContent, saveDailyInsightContent } from '../services/cardsService'
import { useTranslation } from 'react-i18next'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const DEEP_BLUE = '#0b1b3a'
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// ============ 3D ANIMATED COMPONENTS ============

// Floating Particles Background
const FloatingParticle = ({ delay, x, size, duration }) => {
  const animY = React.useRef(new Animated.Value(SCREEN_HEIGHT + 50)).current
  const animOpacity = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    const animate = () => {
      animY.setValue(SCREEN_HEIGHT + 50)
      animOpacity.setValue(0)
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animY, { toValue: -50, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(animOpacity, { toValue: 0.6, duration: duration * 0.2, useNativeDriver: true }),
            Animated.timing(animOpacity, { toValue: 0.6, duration: duration * 0.6, useNativeDriver: true }),
            Animated.timing(animOpacity, { toValue: 0, duration: duration * 0.2, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => animate())
    }
    animate()
  }, [])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: PRIMARY_GOLD,
        left: x,
        transform: [{ translateY: animY }],
        opacity: animOpacity,
      }}
    />
  )
}

const FloatingParticles = React.memo(() => {
  const particles = React.useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 3,
      x: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 3000,
      duration: 4000 + Math.random() * 2000,
    })), []
  )
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => <FloatingParticle key={p.id} {...p} />)}
    </View>
  )
})

// Glowing Ring Animation
const GlowingRing = ({ size = 100, color = PRIMARY_RED }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current
  const opacityAnim = React.useRef(new Animated.Value(0.5)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.15, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        transform: [{ scale: pulseAnim }],
        opacity: opacityAnim,
      }}
    />
  )
}

// 3D Card Component with flip effect
const Card3D = ({ children, style, delay = 0, index = 0 }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current
  const scaleValue = React.useRef(new Animated.Value(0.85)).current
  const rotateY = React.useRef(new Animated.Value(0)).current
  const floatValue = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(animatedValue, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.spring(scaleValue, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(rotateY, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ]).start()

    // Continuous floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, { toValue: 1, duration: 2500 + index * 200, useNativeDriver: true }),
        Animated.timing(floatValue, { toValue: 0, duration: 2500 + index * 200, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const translateY = floatValue.interpolate({ inputRange: [0, 1], outputRange: [0, -6] })
  const rotate = rotateY.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] })
  const opacity = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })

  return (
    <Animated.View style={[style, {
      opacity,
      transform: [{ perspective: 1000 }, { rotateY: rotate }, { scale: scaleValue }, { translateY }],
    }]}>
      {children}
    </Animated.View>
  )
}

// 3D Story Card with wobble
const StoryCard3D = ({ story, index, onPress }) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const glowAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 3000 + index * 400, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 3000 + index * 400, useNativeDriver: true }),
      ])
    ).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.9, tension: 100, friction: 5, useNativeDriver: true }).start()
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }).start()

  const rotateZ = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] })
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] })

  return (
    <Animated.View style={{ alignItems: 'center', gap: 6, transform: [{ perspective: 800 }, { rotateZ }, { scale: scaleAnim }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ position: 'relative' }}>
        <Animated.View style={{
          position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 38,
          backgroundColor: PRIMARY_RED, opacity: glowOpacity,
        }} />
        <LinearGradient colors={[PRIMARY_RED, '#ef4444', '#f97316']} style={styles3D.storyRing}>
          <View style={styles3D.storyInner}>
            {story.thumbnailUrl ? (
              <Image source={{ uri: story.thumbnailUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <LinearGradient colors={[DEEP_BLUE, '#1e3a5f']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="videocam" size={24} color="#fff" />
              </LinearGradient>
            )}
          </View>
        </LinearGradient>
      </Pressable>
      <Text style={styles3D.storyTitle} numberOfLines={1}>{story.title || 'סרטון'}</Text>
    </Animated.View>
  )
}

// Animated Dedication with slide-in
const DedicationItem3D = ({ dedication, index, isAdminMode, onRemove }) => {
  const { t } = useTranslation()
  const slideAnim = React.useRef(new Animated.Value(100)).current
  const opacityAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 120),
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  return (
    <Animated.View style={[styles3D.dedicationItem, { transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}>
      <View style={styles3D.dedicationGlowBar} />
      <View style={styles.dedicationTypeBadge}>
        <Text style={styles.dedicationTypeText}>{t(`faithInsight.dedicationTypes.${dedication.type}`)}</Text>
      </View>
      <Text style={styles3D.dedicationName}>{dedication.name}</Text>
      {isAdminMode && (
        <Pressable onPress={() => onRemove(dedication.id)} style={{ padding: 4 }}>
          <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
      )}
    </Animated.View>
  )
}

// Animated Waveform for Audio
const AnimatedWaveform = () => {
  const bars = React.useMemo(() => Array.from({ length: 25 }, (_, i) => i), [])
  return (
    <View style={styles3D.waveformContainer}>
      {bars.map(i => <WaveformBar key={i} index={i} />)}
    </View>
  )
}

const WaveformBar = ({ index }) => {
  const heightAnim = React.useRef(new Animated.Value(10)).current

  React.useEffect(() => {
    const baseHeight = 10 + Math.random() * 15
    const animate = () => {
      Animated.sequence([
        Animated.timing(heightAnim, { toValue: baseHeight + Math.random() * 20, duration: 200 + Math.random() * 200, useNativeDriver: false }),
        Animated.timing(heightAnim, { toValue: baseHeight, duration: 200 + Math.random() * 200, useNativeDriver: false }),
      ]).start(() => animate())
    }
    setTimeout(() => animate(), index * 40)
  }, [])

  return <Animated.View style={[styles3D.waveformBar, { height: heightAnim }]} />
}

// 3D specific styles
const styles3D = StyleSheet.create({
  storyRing: { width: 72, height: 72, borderRadius: 36, padding: 3 },
  storyInner: { flex: 1, borderRadius: 33, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  storyTitle: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.8)', maxWidth: 72, textAlign: 'center' },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  translateText: {
    fontSize: 13,
    fontFamily: 'Heebo_500Medium',
    color: '#0b1b3a',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16
  },
  dedicationItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', position: 'relative', overflow: 'hidden',
  },
  dedicationGlowBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: PRIMARY_GOLD },
  dedicationTypeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dedicationTypeText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: '#fff' },
  dedicationName: { flex: 1, fontSize: 15, fontFamily: 'Heebo_600SemiBold', color: '#fff', textAlign: 'right' },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, height: 50, paddingVertical: 16 },
  waveformBar: { width: 4, backgroundColor: PRIMARY_RED, borderRadius: 2, opacity: 0.7 },
})

const DEFAULT_CONTENT = {
  title: 'זריקת אמונה',
  category: 'זריקת אמונה',
  author: 'הרב אייל עמרמי ',
  content: `בלייר עליון - כאייל תערוג.

תובנות מעולם התורה והאמונה.

כל יום הוא הזדמנות חדשה ללמוד, לצמוח ולהתקרב לבורא עולם.

התורה היא אור המאיר את דרכנו ומדריכה אותנו בחיי היום יום.

בואו נמשיך ללמוד יחד, לגדול באמונה ולחזק את הקשר עם הקב"ה.`,
  dedications: [
    { id: 'd1', type: 'neshama', name: 'אסתר בת רחל' },
    { id: 'd2', type: 'refuah', name: 'יוסף בן רות' },
  ],
  audioFiles: [],
}

const DEDICATION_TYPES = [
  { key: 'neshama', icon: 'flame' },
  { key: 'refuah', icon: 'heart' },
  { key: 'success', icon: 'star' },
]

export default function DailyInsightScreen({ navigation }) {
  const { t, i18n } = useTranslation()
  const { isAdmin } = useAuth()
  const [isAdminMode, setIsAdminMode] = React.useState(false)
  const [activeType, setActiveType] = React.useState('text')
  const [audioStatus, setAudioStatus] = React.useState(null)
  const [currentPlayingAudioId, setCurrentPlayingAudioId] = React.useState(null)
  const soundRef = React.useRef(null)

  // Editable content state
  const [contentTitle, setContentTitle] = React.useState(DEFAULT_CONTENT.title)
  const [contentText, setContentText] = React.useState(DEFAULT_CONTENT.content)
  const [dedications, setDedications] = React.useState(DEFAULT_CONTENT.dedications)
  const [audioFiles, setAudioFiles] = React.useState(DEFAULT_CONTENT.audioFiles)
  const [dedicationType, setDedicationType] = React.useState(DEDICATION_TYPES[0].key)
  const [dedicationName, setDedicationName] = React.useState('')

  // Upload states
  const [uploadingVideo, setUploadingVideo] = React.useState(false)
  const [uploadingAudio, setUploadingAudio] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [saving, setSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Animation values
  const headerAnim = React.useRef(new Animated.Value(0)).current
  const cardAnim = React.useRef(new Animated.Value(0)).current
  const contentAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(contentAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start()
  }, [])

  // Stories/Videos
  const [stories, setStories] = React.useState([])
  const [loadingStories, setLoadingStories] = React.useState(true)

  React.useEffect(() => {
    loadDailyVideos()
    loadDailyContent()
    // Mark as viewed when screen opens
    saveDailyInsightLastViewed()
  }, [])

  const loadDailyContent = async () => {
    try {
      const content = await getDailyInsightContent()
      if (content) {
        setContentTitle(content.title ?? DEFAULT_CONTENT.title)
        setContentText(content.content ?? DEFAULT_CONTENT.content)
        setDedications(content.dedications ?? DEFAULT_CONTENT.dedications)
        setAudioFiles(content.audioFiles ?? DEFAULT_CONTENT.audioFiles)
      }
    } catch (error) {
      console.error('Error loading daily content:', error)
    }
  }

  const loadDailyVideos = async () => {
    try {
      setLoadingStories(true)
      const videos = await getDailyVideos()
      const storiesData = videos.map(video => ({
        id: video.id,
        uri: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        title: video.title,
        description: video.description,
        createdAt: video.createdAt?.toDate ? video.createdAt.toDate().getTime() : new Date(video.createdAt).getTime(),
      }))
      setStories(storiesData)
    } catch (error) {
      console.error('Error loading daily videos:', error)
      setStories([])
    } finally {
      setLoadingStories(false)
    }
  }

  // Stories are already filtered by 24 hours in dailyVideosService
  // No need for additional filtering here
  const validStories = stories

  const [currentStoryIndex, setCurrentStoryIndex] = React.useState(0)
  const [isStoryModalVisible, setIsStoryModalVisible] = React.useState(false)

  const openStory = React.useCallback((index) => {
    setCurrentStoryIndex(index)
    setIsStoryModalVisible(true)
  }, [])

  const closeStory = React.useCallback(() => {
    setIsStoryModalVisible(false)
  }, [])

  const handleStoryStatus = React.useCallback((status) => {
    if (status?.didJustFinish) {
      const next = currentStoryIndex + 1
      if (next < validStories.length) {
        setCurrentStoryIndex(next)
      } else {
        setIsStoryModalVisible(false)
      }
    }
  }, [currentStoryIndex, validStories.length])

  // Editable date state
  const [customDate, setCustomDate] = React.useState('')
  
  // Format date for display
  const todayDate = customDate || new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleShare = React.useCallback(() => {
    Share.share({ message: `${contentTitle}\n\n${contentText}` }).catch(() => { })
  }, [contentTitle, contentText])

  // Mark changes
  const markChanged = React.useCallback(() => {
    setHasChanges(true)
  }, [])

  // Handle content changes
  const handleTitleChange = React.useCallback((text) => {
    setContentTitle(text)
    markChanged()
  }, [markChanged])

  const handleContentChange = React.useCallback((text) => {
    setContentText(text)
    markChanged()
  }, [markChanged])

  // Dedication handlers
  const handleAddDedication = React.useCallback(() => {
    const trimmed = dedicationName.trim()
    if (!trimmed) {
      Alert.alert(t('faithInsight.alerts.error'), t('faithInsight.alerts.enterName'))
      return
    }
    setDedications((prev) => [
      ...prev,
      { id: `${Date.now()}`, type: dedicationType, name: trimmed },
    ])
    setDedicationName('')
    markChanged()
  }, [dedicationName, dedicationType, markChanged])

  const handleRemoveDedication = React.useCallback((id) => {
    setDedications((prev) => prev.filter(item => item.id !== id))
    markChanged()
  }, [markChanged])

  // Audio handlers
  const handlePickAudio = React.useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      })

      if (result.canceled) return

      const file = result.assets[0]
      const newAudio = {
        id: `audio-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        uri: file.uri,
        duration: '0:00', // Would need actual duration extraction
      }

      setAudioFiles(prev => [...prev, newAudio])
      setAudioFiles(prev => [...prev, newAudio])
      markChanged()
      Alert.alert(t('faithInsight.alerts.success'), t('faithInsight.alerts.fileAdded'))
    } catch (error) {
      console.error('Error picking audio:', error)
      Alert.alert(t('faithInsight.alerts.error'), t('faithInsight.alerts.errorPick'))
    }
  }, [markChanged])

  const handleRemoveAudio = React.useCallback((id) => {
    setAudioFiles(prev => prev.filter(a => a.id !== id))
    markChanged()
  }, [markChanged])

  const playAudio = React.useCallback(async (audioUri, audioId) => {
    try {
      // Stop current if playing
      if (soundRef.current) {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }

      if (currentPlayingAudioId === audioId) {
        setCurrentPlayingAudioId(null)
        setAudioStatus(null)
        return
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (status) => setAudioStatus(status)
      )
      soundRef.current = sound
      setCurrentPlayingAudioId(audioId)
    } catch (error) {
      console.error('Error playing audio:', error)
      Alert.alert(t('faithInsight.alerts.error'), t('faithInsight.alerts.errorPlay'))
    }
  }, [currentPlayingAudioId])

  // Video upload
  const handleUploadVideo = React.useCallback(async (videoUri) => {
    try {
      setUploadingVideo(true)
      setUploadProgress(0)

      const videoId = 'daily-video-' + Date.now()
      const dateStr = new Date().toISOString().split('T')[0]

      const videoPath = generateDailyVideoPath(dateStr, `${videoId}.mp4`)
      const videoUrl = await uploadVideoToStorage(videoUri, videoPath, (progress) => {
        setUploadProgress(progress)
      })

      await createDailyVideo({
        title: 'זריקת אמונה יומית',
        description: '',
        videoUrl: videoUrl,
        thumbnailUrl: null,
      })


      Alert.alert(t('faithInsight.alerts.success'), t('faithInsight.alerts.videoUploaded'))
      await loadDailyVideos()
    } catch (error) {
      console.error('Error uploading video:', error)
      Alert.alert(t('faithInsight.alerts.error'), t('faithInsight.alerts.errorVideo'))
    } finally {
      setUploadingVideo(false)
      setUploadProgress(0)
    }
  }, [])

  // Save all changes
  const handleSaveAll = React.useCallback(async () => {
    try {
      setSaving(true)

      await saveDailyInsightContent({
        title: contentTitle,
        content: contentText,
        dedications,
        audioFiles
      })

      setHasChanges(false)
      setHasChanges(false)
      Alert.alert(t('faithInsight.alerts.success'), t('faithInsight.alerts.saved'))
    } catch (error) {
      console.error('Error saving:', error)
      Alert.alert(t('faithInsight.alerts.error'), t('faithInsight.alerts.errorSave'))
    } finally {
      setSaving(false)
    }
  }, [contentTitle, contentText, dedications, audioFiles, t])

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => { })
      }
    }
  }, [])

  return (
    <View style={styles.container}>
      {/* Dark gradient background for 3D effect */}
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Glowing orbs */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, { top: -50, right: -50 }]}>
          <GlowingRing size={150} color={PRIMARY_RED} />
        </View>
        <View style={[styles.orb, { bottom: 150, left: -30 }]}>
          <GlowingRing size={100} color={PRIMARY_GOLD} />
        </View>
        <View style={[styles.orb, { top: SCREEN_HEIGHT * 0.4, right: -20 }]}>
          <GlowingRing size={80} color="#3b82f6" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <Animated.View style={[styles.header, {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
          }]}>
            <Pressable
              style={styles.backBtn}
              onPress={() => {
                if (navigation && navigation.goBack) {
                  navigation.goBack()
                }
              }}
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <LinearGradient
                colors={[PRIMARY_RED, '#ef4444']}
                style={styles.backBtnGradient}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </LinearGradient>
            </Pressable>

            <Text style={styles.headerTitle}>{t('faithInsight.title')}</Text>

            {isAdmin ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsAdminMode(!isAdminMode)}
                style={[styles.adminToggle, isAdminMode && styles.adminToggleActive]}
              >
                <Ionicons name={isAdminMode ? 'create' : 'create-outline'} size={18} color="#fff" />
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </Animated.View>

          {/* Admin Edit Mode Banner */}
          {isAdminMode && (
            <View style={styles.adminBanner}>
              <View style={styles.adminBannerContent}>
                <Ionicons name="pencil" size={16} color="#fff" />
                <Text style={styles.adminBannerText}>{t('faithInsight.editMode')}</Text>
              </View>
              {hasChanges && (
                <Pressable
                  style={styles.saveAllBtn}
                  onPress={handleSaveAll}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={PRIMARY_RED} />
                  ) : (
                    <>
                      <Ionicons name="save" size={16} color={PRIMARY_RED} />
                      <Text style={styles.saveAllText}>{t('faithInsight.saveAll')}</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          )}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section with Stories */}
            <Card3D delay={100} index={0} style={styles.heroSection}>
              <LinearGradient
                colors={[DEEP_BLUE, '#1e3a5f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroPattern}>
                  {[...Array(6)].map((_, i) => (
                    <View key={i} style={[styles.patternDot, { left: `${15 + i * 15}%`, top: `${10 + (i % 2) * 20}%` }]} />
                  ))}
                </View>

                <View style={styles.heroContent}>
                  <View style={styles.heroHeader}>
                    <Text style={styles.heroTitle}>{t('faithInsight.dailyVideos')}</Text>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>{t('faithInsight.live')}</Text>
                    </View>
                  </View>
                  <Text style={styles.heroSubtitle}>{t('faithInsight.dailyVideosSubtitle')}</Text>

                  {loadingStories ? (
                    <View style={styles.storiesLoading}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.storiesLoadingText}>{t('common.loading', 'Loading...')}</Text>
                    </View>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.storiesRow}
                    >
                      {/* Admin: Add Video Button */}
                      {isAdminMode && (
                        <View style={styles.adminVideoActions}>
                          <Pressable
                            style={styles.addStoryBtn}
                            onPress={async () => {
                              try {
                                const video = await pickVideo({ videoMaxDuration: 60 })
                                if (video) await handleUploadVideo(video.uri)
                              } catch (error) {
                                Alert.alert(t('faithInsight.alerts.error'), t('faithInsight.alerts.errorPick'))
                              }
                            }}
                            disabled={uploadingVideo}
                          >
                            <LinearGradient
                              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                              style={styles.addStoryGradient}
                            >
                              {uploadingVideo ? (
                                <View style={styles.uploadProgressContainer}>
                                  <ActivityIndicator size="small" color="#fff" />
                                  <Text style={styles.uploadProgressText}>{Math.round(uploadProgress)}%</Text>
                                </View>
                              ) : (
                                <Ionicons name="cloud-upload" size={24} color="#fff" />
                              )}
                            </LinearGradient>
                            <Text style={styles.addStoryText}>{t('faithInsight.upload')}</Text>
                          </Pressable>

                          <Pressable
                            style={styles.addStoryBtn}
                            onPress={async () => {
                              try {
                                const video = await recordVideo({ videoMaxDuration: 60 })
                                if (video) await handleUploadVideo(video.uri)
                              } catch (error) {
                                Alert.alert('שגיאה', 'לא ניתן לצלם')
                              }
                            }}
                            disabled={uploadingVideo}
                          >
                            <LinearGradient
                              colors={[PRIMARY_RED, '#ef4444']}
                              style={styles.addStoryGradientRed}
                            >
                              <Ionicons name="camera" size={24} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.addStoryText}>{t('faithInsight.record')}</Text>
                          </Pressable>
                        </View>
                      )}

                      {validStories.map((s, idx) => (
                        <StoryCard3D
                          key={s.id}
                          story={s}
                          index={idx}
                          onPress={() => openStory(idx)}
                        />
                      ))}

                      {validStories.length === 0 && !isAdminMode && (
                        <View style={styles.noStoriesContainer}>
                          <Ionicons name="videocam-off-outline" size={32} color="rgba(255,255,255,0.5)" />
                          <Text style={styles.noStoriesText}>{t('faithInsight.noStories')}</Text>
                        </View>
                      )}
                    </ScrollView>
                  )}
                </View>
              </LinearGradient>
            </Card3D>

            {/* Main Content Card */}
            <Card3D delay={300} index={1} style={styles.mainCard}>
              {/* Category & Date */}
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Ionicons name="flame" size={14} color={PRIMARY_RED} />
                  <Text style={styles.categoryText}>{DEFAULT_CONTENT.category}</Text>
                </View>
                {isAdminMode ? (
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={styles.dateInput}
                      value={customDate}
                      onChangeText={setCustomDate}
                      placeholder="1/4"
                      placeholderTextColor="#9ca3af"
                    />
                    <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                  </View>
                ) : (
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                    <Text style={styles.dateText}>{todayDate}</Text>
                  </View>
                )}
              </View>

              {/* Editable Title */}
              {isAdminMode ? (
                <View style={styles.editableField}>
                  <TextInput
                    value={contentTitle}
                    onChangeText={handleTitleChange}
                    style={styles.titleInput}
                    multiline
                  />
                  <Ionicons name="pencil" size={14} color={PRIMARY_RED} style={styles.editIcon} />
                </View>
              ) : (
                <Text style={styles.cardTitle}>
                  {contentTitle}
                </Text>
              )}

              <View style={styles.separator} />

              {/* Editable Content */}
              {isAdminMode ? (
                <TextInput
                  value={contentText}
                  onChangeText={handleContentChange}
                  style={styles.contentInput}
                  multiline
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.cardContent}>{contentTitle}</Text>
              )}
              {isAdminMode && (
                <View style={styles.editableFieldLabel}>
                  <View style={styles.editableLabel}>
                    <Ionicons name="text" size={14} color={PRIMARY_RED} />
                    <Text style={styles.editableLabelText}>כותרת</Text>
                  </View>
                </View>
              )}

              {/* Reading time */}
              <View style={styles.readTimeRow}>
                <View style={styles.readTimeIndicator}>
                  <View style={styles.readTimeFill} />
                </View>
                <Text style={styles.readTimeText}>2 דקות קריאה</Text>
              </View>

              {/* Type Selector */}
              <View style={styles.typeSelectorRow}>
                <Pressable
                  style={[styles.typeSelector, activeType === 'text' && styles.typeSelectorActive]}
                  onPress={() => setActiveType('text')}
                >
                  <Ionicons name="document-text" size={18} color={activeType === 'text' ? '#fff' : PRIMARY_RED} />
                  <Text style={[styles.typeSelectorText, activeType === 'text' && styles.typeSelectorTextActive]}>קריאה</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeSelector, activeType === 'audio' && styles.typeSelectorActive]}
                  onPress={() => setActiveType('audio')}
                >
                  <Ionicons name="headset" size={18} color={activeType === 'audio' ? '#fff' : PRIMARY_RED} />
                  <Text style={[styles.typeSelectorText, activeType === 'audio' && styles.typeSelectorTextActive]}>האזנה</Text>
                </Pressable>
              </View>

              {/* ============ DEDICATIONS SECTION ============ */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="flame" size={18} color={PRIMARY_GOLD} />
                    <Text style={styles.sectionTitle}>הקדשות</Text>
                  </View>
                  {isAdminMode && (
                    <View style={styles.adminBadge}>
                      <Ionicons name="pencil" size={12} color="#fff" />
                    </View>
                  )}
                </View>

                {dedications.length > 0 && (
                  <View style={styles.dedicationsCard}>
                    <LinearGradient
                      colors={[DEEP_BLUE, '#1e3a5f']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.dedicationsGradient}
                    >
                      <View style={styles.dedicationsList}>
                        {dedications.map((dedication) => (
                          <View key={dedication.id} style={styles.dedicationItem}>
                            <View style={styles.dedicationTypeBadge}>
                              <Text style={styles.dedicationTypeText}>{t(`faithInsight.dedicationTypes.${dedication.type}`)}</Text>
                            </View>
                            <Text style={styles.dedicationName}>{dedication.name}</Text>
                            {isAdminMode && (
                              <Pressable
                                style={styles.dedicationRemove}
                                onPress={() => handleRemoveDedication(dedication.id)}
                              >
                                <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.7)" />
                              </Pressable>
                            )}
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  </View>
                )}

                {/* Admin: Add Dedication */}
                {isAdminMode && (
                  <View style={styles.addDedicationSection}>
                    <View style={styles.dedicationTypesRow}>
                      {DEDICATION_TYPES.map(type => (
                        <Pressable
                          key={type.key}
                          style={[styles.dedicationTypeBtn, dedicationType === type.key && styles.dedicationTypeBtnActive]}
                          onPress={() => setDedicationType(type.key)}
                        >
                          <Ionicons name={type.icon} size={14} color={dedicationType === type.key ? '#fff' : PRIMARY_RED} />
                          <Text style={[styles.dedicationTypeBtnText, dedicationType === type.key && styles.dedicationTypeBtnTextActive]}>
                            {type.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.dedicationInputRow}>
                      <TextInput
                        style={styles.dedicationInput}
                        placeholder="שם להקדשה (לדוגמה: יעקב בן שרה)"
                        placeholderTextColor="#9ca3af"
                        value={dedicationName}
                        onChangeText={setDedicationName}
                      />
                      <Pressable style={styles.addDedicationBtn} onPress={handleAddDedication}>
                        <LinearGradient colors={[PRIMARY_RED, '#ef4444']} style={styles.addBtnGradient}>
                          <Ionicons name="add" size={22} color="#fff" />
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>
                )}

                {dedications.length === 0 && !isAdminMode && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>אין הקדשות להיום</Text>
                  </View>
                )}
              </View>

              {/* ============ CONTENT SECTION ============ */}
              {activeType === 'text' && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="book" size={18} color={PRIMARY_RED} />
                      <Text style={styles.sectionTitle}>תוכן יומי</Text>
                    </View>
                    {isAdminMode && (
                      <View style={styles.adminBadge}>
                        <Ionicons name="pencil" size={12} color="#fff" />
                      </View>
                    )}
                  </View>

                  {isAdminMode ? (
                    <View style={styles.editorContainer}>
                      <TextInput
                        style={styles.contentEditor}
                        multiline
                        placeholder="כתוב את התוכן היומי..."
                        placeholderTextColor="#9ca3af"
                        value={contentText}
                        onChangeText={handleContentChange}
                        textAlignVertical="top"
                      />
                    </View>
                  ) : (
                    <View style={styles.contentBody}>
                      {contentText.split('\n\n').map((para, idx) => (
                        <Text key={idx} style={styles.paragraph}>{para}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* ============ AUDIO SECTION ============ */}
              {activeType === 'audio' && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="musical-notes" size={18} color={PRIMARY_RED} />
                      <Text style={styles.sectionTitle}>הקלטות</Text>
                    </View>
                    {isAdminMode && (
                      <Pressable style={styles.addAudioBtn} onPress={handlePickAudio} disabled={uploadingAudio}>
                        <LinearGradient colors={[PRIMARY_RED, '#ef4444']} style={styles.addAudioBtnGradient}>
                          {uploadingAudio ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Ionicons name="add" size={16} color="#fff" />
                              <Text style={styles.addAudioBtnText}>הוסף הקלטה</Text>
                            </>
                          )}
                        </LinearGradient>
                      </Pressable>
                    )}
                  </View>

                  {audioFiles.length > 0 ? (
                    <View style={styles.audioList}>
                      {audioFiles.map((audio) => (
                        <View key={audio.id} style={styles.audioItem}>
                          <Pressable
                            style={styles.audioPlayBtn}
                            onPress={() => playAudio(audio.uri, audio.id)}
                          >
                            <LinearGradient
                              colors={currentPlayingAudioId === audio.id ? [DEEP_BLUE, '#1e3a5f'] : [PRIMARY_RED, '#ef4444']}
                              style={styles.audioPlayGradient}
                            >
                              <Ionicons
                                name={currentPlayingAudioId === audio.id && audioStatus?.isPlaying ? 'pause' : 'play'}
                                size={20}
                                color="#fff"
                              />
                            </LinearGradient>
                          </Pressable>
                          <View style={styles.audioInfo}>
                            <Text style={styles.audioTitle}>{audio.title}</Text>
                            <Text style={styles.audioDuration}>{audio.duration}</Text>
                          </View>
                          {isAdminMode && (
                            <Pressable
                              style={styles.audioRemoveBtn}
                              onPress={() => handleRemoveAudio(audio.id)}
                            >
                              <Ionicons name="trash-outline" size={18} color={PRIMARY_RED} />
                            </Pressable>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyAudioState}>
                      <Ionicons name="musical-notes-outline" size={48} color="#d1d5db" />
                      <Text style={styles.emptyAudioText}>
                        {isAdminMode ? 'לחץ על "הוסף הקלטה" להעלאת קובץ שמע' : 'אין הקלטות להיום'}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Dedication Button */}
              <Pressable
                style={styles.dedicationButton}
                onPress={() => {
                  const phoneNumber = '972545557248' // 0545557248
                  Linking.openURL(`https://wa.me/${phoneNumber}`).catch(() => {
                    Alert.alert('שגיאה', 'לא ניתן לפתוח את וואטסאפ')
                  })
                }}
              >
                <LinearGradient colors={[PRIMARY_GOLD, '#ffed4e']} style={styles.dedicationButtonGradient}>
                  <Ionicons name="heart" size={18} color="#fff" />
                  <Text style={styles.dedicationButtonText}>להקדשה יומית ליקירכים</Text>
                  <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                </LinearGradient>
              </Pressable>

              {/* Author Section */}
              <View style={styles.authorSection}>
                <View style={styles.authorAvatar}>
                  <LinearGradient
                    colors={[PRIMARY_RED, '#ef4444']}
                    style={styles.authorAvatarGradient}
                  >
                    <Text style={styles.authorInitials}>הר״ע</Text>
                  </LinearGradient>
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{DEFAULT_CONTENT.author}</Text>
                  <Text style={styles.authorRole}>מרצה ומחבר ספרים</Text>
                </View>
                <Pressable style={styles.shareButton} onPress={handleShare}>
                  <LinearGradient
                    colors={[PRIMARY_RED, '#ef4444']}
                    style={styles.shareButtonGradient}
                  >
                    <Ionicons name="share-social" size={18} color="#fff" />
                    <Text style={styles.shareButtonText}>שתף</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Card3D>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Story Modal */}
      <Modal visible={isStoryModalVisible} transparent animationType="fade" onRequestClose={closeStory}>
        <View style={styles.storyModal}>
          <Pressable style={styles.storyCloseBtn} onPress={closeStory}>
            <View style={styles.storyCloseBtnInner}>
              <Ionicons name="close" size={24} color="#fff" />
            </View>
          </Pressable>

          <View style={styles.storyProgressRow}>
            {validStories.map((_, idx) => (
              <View key={idx} style={[styles.storyProgressBar, idx <= currentStoryIndex && styles.storyProgressBarActive]} />
            ))}
          </View>

          {validStories[currentStoryIndex] && (
            <Video
              key={validStories[currentStoryIndex].id}
              style={styles.storyVideo}
              source={{ uri: validStories[currentStoryIndex].uri }}
              resizeMode="contain"
              shouldPlay
              isLooping={false}
              onPlaybackStatusUpdate={handleStoryStatus}
              useNativeControls
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(220,38,38,0.05)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(11,27,58,0.03)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
  },
  backBtnGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrapper: {
    width: 36,
    height: 36,
  },
  headerIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: PRIMARY_RED,
  },
  adminToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_RED,
  },
  adminToggleActive: {
    backgroundColor: PRIMARY_RED,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRIMARY_RED,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  adminBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminBannerText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  saveAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveAllText: {
    color: PRIMARY_RED,
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // Hero Section
  heroSection: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: DEEP_BLUE,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroGradient: {
    padding: 20,
  },
  heroPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    gap: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.7)',
  },
  storiesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  storiesLoadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  storiesRow: {
    gap: 14,
    paddingTop: 8,
  },
  adminVideoActions: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  addStoryBtn: {
    alignItems: 'center',
    gap: 6,
  },
  addStoryGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  addStoryGradientRed: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadProgressContainer: {
    alignItems: 'center',
    gap: 4,
  },
  uploadProgressText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  addStoryText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  storyItem: {
    alignItems: 'center',
    gap: 6,
  },
  storyRingGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
  },
  storyInner: {
    flex: 1,
    borderRadius: 31,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyThumbnail: {
    width: '100%',
    height: '100%',
  },
  storyPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.8)',
    maxWidth: 68,
    textAlign: 'center',
  },
  noStoriesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noStoriesText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },

  // Main Card
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220,38,38,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220,38,38,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  dateInput: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: DEEP_BLUE,
    minWidth: 60,
    textAlign: 'right',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    lineHeight: 38,
  },
  editableField: {
    marginBottom: 12,
  },
  editableLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  editableLabelText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    borderWidth: 2,
    borderColor: 'rgba(220,38,38,0.2)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(220,38,38,0.03)',
  },
  readTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 20,
  },
  readTimeIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  readTimeFill: {
    width: '60%',
    height: '100%',
    backgroundColor: PRIMARY_RED,
    borderRadius: 2,
  },
  readTimeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(220,38,38,0.06)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeSelectorActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  typeSelectorText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  typeSelectorTextActive: {
    color: '#fff',
  },

  // Dedication Button
  dedicationButton: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: PRIMARY_GOLD,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  dedicationButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  dedicationButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },

  // Section Container
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  adminBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dedications
  dedicationsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dedicationsGradient: {
    padding: 16,
  },
  dedicationsList: {
    gap: 10,
  },
  dedicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dedicationTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dedicationTypeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  dedicationName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Heebo_600SemiBold',
    color: '#fff',
    textAlign: 'right',
  },
  dedicationRemove: {
    padding: 4,
  },
  addDedicationSection: {
    marginTop: 12,
    backgroundColor: 'rgba(220,38,38,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.1)',
  },
  dedicationTypesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  dedicationTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(220,38,38,0.3)',
    backgroundColor: '#fff',
  },
  dedicationTypeBtnActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  dedicationTypeBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  dedicationTypeBtnTextActive: {
    color: '#fff',
  },
  dedicationInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dedicationInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Heebo_500Medium',
    textAlign: 'right',
    color: DEEP_BLUE,
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
  },
  addDedicationBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },

  // Content Editor
  editorContainer: {
    backgroundColor: 'rgba(11,27,58,0.03)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(220,38,38,0.15)',
    overflow: 'hidden',
  },
  contentEditor: {
    minHeight: 200,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Heebo_500Medium',
    color: DEEP_BLUE,
    textAlign: 'right',
    lineHeight: 26,
  },
  contentBody: {
    gap: 16,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Heebo_500Medium',
    color: '#374151',
    textAlign: 'right',
    lineHeight: 28,
  },

  // Language Selector
  languageSelectorContainer: {
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  languageSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  languageSelectorTitle: {
    fontSize: 15,
    fontFamily: 'Heebo_600SemiBold',
    color: DEEP_BLUE,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  languageBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageBtnActive: {
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  languageBtnGradient: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 70,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageLabel: {
    fontSize: 13,
    fontFamily: 'Heebo_600SemiBold',
    color: '#6b7280',
  },
  languageLabelActive: {
    color: '#fff',
  },

  // Audio Section
  addAudioBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addAudioBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addAudioBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  audioList: {
    gap: 10,
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(11,27,58,0.04)',
    padding: 12,
    borderRadius: 14,
  },
  audioPlayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  audioPlayGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  audioTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  audioDuration: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  audioRemoveBtn: {
    padding: 8,
  },
  emptyAudioState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyAudioText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Author Section
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,27,58,0.08)',
  },
  authorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  authorAvatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitials: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  authorInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  authorRole: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  shareButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  shareButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },

  // Story Modal
  storyModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  storyCloseBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyProgressRow: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 70,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  storyProgressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
  },
  storyProgressBarActive: {
    backgroundColor: '#fff',
  },
  storyVideo: {
    flex: 1,
  },

  // 3D Effects
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
  },
})
