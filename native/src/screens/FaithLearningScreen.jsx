import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Linking
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../utils/AuthContext'
import { subscribeToFaithTopics, updateFaithTopic, seedFaithTopics } from '../services/faithService'
import * as ImagePicker from 'expo-image-picker'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Video, ResizeMode } from 'expo-av'
import YoutubePlayer from 'react-native-youtube-iframe'
import { WebView } from 'react-native-webview'
import { useFocusEffect } from '@react-navigation/native'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'
const CHIP_BG = 'rgba(220,38,38,0.08)'

export default function FaithLearningScreen({ navigation, route }) {
  const { isAdmin } = useAuth()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  // Navigation param or default to first topic if available
  const initialCategory = route?.params?.category
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'shalom-bayit')

  // Edit Mode State
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)
  const [saving, setSaving] = useState(false)

  // Video Upload State
  const [uploadProgress, setUploadProgress] = useState(0)

  // 1. Fetch Topics from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToFaithTopics((fetchedTopics) => {
      setLoading(false)
      if (fetchedTopics.length > 0) {
        setTopics(fetchedTopics)
        // If we have no active category or the active one doesn't exist, set to first
        if (!fetchedTopics.find(t => t.key === activeCategory) && !activeCategory) {
          setActiveCategory(fetchedTopics[0].key)
        }
      } else {
        // Seed if empty (auto-fix for first run)
        seedFaithTopics()
      }
    })
    return () => unsubscribe()
  }, [])

  // 2. Compute Active Topic
  const activeTopic = useMemo(() => {
    if (!topics.length) return null
    return topics.find(t => t.key === activeCategory) || topics[0]
  }, [activeCategory, topics])

  // 3. Edit Handlers
  const handleEditPress = () => {
    if (!activeTopic) return
    setEditingTopic({ ...activeTopic }) // Clone for editing
    setEditModalVisible(true)
  }

  const handleSave = async () => {
    if (!editingTopic) return
    setSaving(true)
    try {
      await updateFaithTopic(editingTopic.id, editingTopic)
      setEditModalVisible(false)
      setEditingTopic(null)
      Alert.alert('הצלחה', 'השינויים נשמרו בהצלחה')
    } catch (error) {
      console.error(error)
      Alert.alert('שגיאה', 'לא ניתן לשמור את השינויים')
    } finally {
      setSaving(false)
    }
  }

  // 4. Video Upload Logic
  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled && result.assets[0]) {
        uploadVideo(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לבחור סרטון')
    }
  }

  const uploadVideo = async (uri) => {
    setSaving(true) // Reuse saving state for spinner
    try {
      const response = await fetch(uri)
      const blob = await response.blob()

      const storage = getStorage()
      const storageRef = ref(storage, `faith_videos/${Date.now()}_video.mp4`)

      const result = await uploadBytes(storageRef, blob)
      const downloadUrl = await getDownloadURL(result.ref)

      setEditingTopic(prev => ({
        ...prev,
        videoUrl: downloadUrl,
        videoType: 'file'
      }))

      Alert.alert('הצלחה', 'הסרטון הועלה בהצלחה')
    } catch (error) {
      console.error(error)
      Alert.alert('שגיאה', 'העלאת הסרטון נכשלה')
    } finally {
      setSaving(false)
    }
  }

  // Helper: Extract YouTube video ID - handles all YouTube URL formats including live streams
  const extractYoutubeId = (url) => {
    if (!url) return null
    
    // Remove whitespace and clean the URL
    let cleanUrl = url.trim()
    
    // Handle /live/ format (for live streams that ended)
    if (cleanUrl.includes('/live/')) {
      const match = cleanUrl.match(/\/live\/([a-zA-Z0-9_-]+)/)
      if (match && match[1]) {
        return match[1].split('?')[0].split('&')[0]
      }
    }
    
    // Handle watch?v= format
    if (cleanUrl.includes('v=')) {
      const match = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/)
      if (match && match[1]) {
        return match[1].split('&')[0].split('#')[0]
      }
    }
    
    // Handle youtu.be/ format
    if (cleanUrl.includes('youtu.be/')) {
      const match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
      if (match && match[1]) {
        return match[1].split('?')[0].split('&')[0].split('#')[0]
      }
    }
    
    // Handle youtube.com/embed/ format
    if (cleanUrl.includes('youtube.com/embed/')) {
      const match = cleanUrl.match(/embed\/([a-zA-Z0-9_-]+)/)
      if (match && match[1]) {
        return match[1].split('?')[0].split('&')[0]
      }
    }
    
    // If it's just a video ID (11 characters, alphanumeric, dashes, underscores)
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/
    if (videoIdPattern.test(cleanUrl)) {
      return cleanUrl
    }
    
    return null
  }


  // 5. Video Player Component
  const renderVideoPlayer = () => {
    if (!activeTopic?.videoUrl) return null

    if (activeTopic.videoType === 'youtube') {
      const videoId = extractYoutubeId(activeTopic.videoUrl)
      if (!videoId) return null

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

      return (
        <View style={styles.videoContainer}>
          {/* YouTube thumbnail with play button - opens in VideoPlayer screen */}
          <Pressable
            style={styles.youtubePreview}
            onPress={() => navigation.navigate('VideoPlayer', {
              videoId,
              title: activeTopic.title,
              description: activeTopic.summary
            })}
          >
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.youtubeThumbnail}
              resizeMode="cover"
            />
            <View style={styles.youtubeThumbnailOverlay}>
              <View style={styles.playIconCircle}>
                <Ionicons name="play" size={40} color="#fff" />
              </View>
              <View style={styles.playTextBadge}>
                <Ionicons name="logo-youtube" size={16} color="#fff" style={{ marginLeft: 6 }} />
                <Text style={styles.playText}>צפה בסרטון</Text>
              </View>
            </View>
          </Pressable>

          {/* Open in YouTube button */}
          <Pressable
            style={styles.openYoutubeBtn}
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}
          >
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <Text style={styles.openYoutubeBtnText}>פתח ב-YouTube</Text>
          </Pressable>
        </View>
      )
    }

    // Direct file
    return (
      <View style={styles.videoContainer}>
        <Video
          style={styles.video}
          source={{ uri: activeTopic.videoUrl }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
        />
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY_RED} />
        <Text style={{ marginTop: 10, fontFamily: 'Heebo_500Medium' }}>טוען תכנים...</Text>
      </View>
    )
  }

  if (!activeTopic) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>לא נוצרו קטגוריות עדיין</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f8f8f8']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable accessibilityRole="button" style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={PRIMARY_RED} />
        </Pressable>

        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>לימוד אמונה</Text>
          <Text style={styles.headerSubtitle}>בחרו נושא לחיזוק ממוקד</Text>
        </View>

        <View style={{ width: 40, alignItems: 'flex-end' }}>
          {isAdmin && (
            <Pressable onPress={handleEditPress} style={styles.adminEditBtn}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Chips */}
        <View style={styles.topicRow}>
          {topics.map(topic => (
            <Pressable
              key={topic.key}
              accessibilityRole="button"
              style={[styles.topicChip, activeCategory === topic.key && styles.topicChipActive]}
              onPress={() => setActiveCategory(topic.key)}
            >
              <Text style={[styles.topicChipText, activeCategory === topic.key && styles.topicChipTextActive]}>
                {topic.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.topicLabel}>מיקוד יומי</Text>
          <Text style={styles.topicTitle}>{activeTopic.title}</Text>
          <Text style={styles.topicVerse}>{activeTopic.verse}</Text>
          <Text style={styles.topicSummary}>{activeTopic.summary}</Text>

          <View style={styles.spotlightBox}>
            <Ionicons name="bulb-outline" size={20} color={PRIMARY_RED} />
            <Text style={styles.spotlightText}>{activeTopic.spotlight}</Text>
          </View>
        </View>

        {/* Video Section */}
        {activeTopic.videoUrl && (
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
              <Text style={styles.sectionTitle}>שיעור וידאו</Text>
              <Ionicons name="videocam-outline" size={20} color={PRIMARY_RED} />
            </View>
            <View style={{ marginTop: 12 }}>
              {renderVideoPlayer()}
            </View>
          </View>
        )}

        {/* Focus Points */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>תובנות מרכזיות</Text>
            <Ionicons name="book-outline" size={20} color={PRIMARY_RED} />
          </View>
          {activeTopic.focusPoints?.map((point, idx) => (
            <View key={idx} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Practices */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>עבודת היום</Text>
            <Ionicons name="calendar-outline" size={20} color={PRIMARY_RED} />
          </View>
          {activeTopic.practices?.map((practice, idx) => (
            <View key={idx} style={styles.practiceRow}>
              <Text style={styles.practiceIndex}>{idx + 1}</Text>
              <Text style={styles.practiceText}>{practice}</Text>
            </View>
          ))}
        </View>

        {/* Sources */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>מקורות מומלצים</Text>
            <Ionicons name="bookmark-outline" size={20} color={PRIMARY_RED} />
          </View>
          {activeTopic.sources?.map((source, idx) => (
            <Text key={idx} style={styles.sourceText}>• {source}</Text>
          ))}
        </View>

        <View style={styles.ctaCard}>
          {!activeTopic.videoUrl && (
            <>
              <Text style={styles.ctaTitle}>בקרוב: שיעורי וידאו לכל קטגוריה</Text>
              <Text style={styles.ctaSubtitle}>האדמין יוכל להעלות שיעורים, קבצי PDF והקלטות ייעודיות</Text>
            </>
          )}
          {activeTopic.videoUrl && (
            <Text style={styles.ctaTitle}>צפייה מהנה ומחזקת!</Text>
          )}
          <View style={styles.ctaActions}>
            <Pressable accessibilityRole="button" style={styles.ctaBtnPrimary} onPress={() => navigation.navigate('DailyInsight')}>
              <Ionicons name="flame-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnPrimaryText}>זריקת אמונה</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>עריכת נושא: {editingTopic?.title}</Text>
            <Pressable onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close-circle" size={30} color="#6b7280" />
            </Pressable>
          </View>

          {editingTopic && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.inputLabel}>פסוק / כותרת משנה</Text>
              <TextInput
                style={styles.input}
                value={editingTopic.verse}
                onChangeText={(t) => setEditingTopic({ ...editingTopic, verse: t })}
                multiline
              />

              <Text style={styles.inputLabel}>סיכום / תוכן</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={editingTopic.summary}
                onChangeText={(t) => setEditingTopic({ ...editingTopic, summary: t })}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>זרקור (טיפ קצר)</Text>
              <TextInput
                style={styles.input}
                value={editingTopic.spotlight}
                onChangeText={(t) => setEditingTopic({ ...editingTopic, spotlight: t })}
                multiline
              />

              <Text style={styles.divider}>📹 הוספת שיעור וידאו</Text>

              <View style={styles.videoOptionCard}>
                <View style={styles.videoOptionHeader}>
                  <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                  <Text style={styles.videoOptionTitle}>אפשרות 1: קישור יוטיוב</Text>
                </View>
                <Text style={styles.videoOptionDesc}>הדבק קישור לסרטון מיוטיוב - יוצג עם תצוגה מקדימה</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor="#9ca3af"
                  value={editingTopic.videoType === 'youtube' ? editingTopic.videoUrl : ''}
                  onChangeText={(t) => setEditingTopic({ ...editingTopic, videoUrl: t, videoType: 'youtube' })}
                />
                {editingTopic.videoType === 'youtube' && editingTopic.videoUrl && (
                  <View style={styles.videoStatusRow}>
                    <View style={styles.videoPreviewStatus}>
                      <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                      <Text style={styles.videoPreviewText}>קישור יוטיוב נשמר</Text>
                    </View>
                    <Pressable
                      style={styles.removeVideoBtn}
                      onPress={() => setEditingTopic({ ...editingTopic, videoUrl: '', videoType: null })}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      <Text style={styles.removeVideoBtnText}>הסר</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <Text style={[styles.inputLabel, { alignSelf: 'center', marginVertical: 12, color: '#6b7280' }]}>או</Text>

              <View style={styles.videoOptionCard}>
                <View style={styles.videoOptionHeader}>
                  <Ionicons name="cloud-upload" size={24} color={PRIMARY_RED} />
                  <Text style={styles.videoOptionTitle}>אפשרות 2: העלאת קובץ וידאו</Text>
                </View>
                <Text style={styles.videoOptionDesc}>העלה סרטון ישירות מהמכשיר שלך</Text>
                <Pressable style={styles.uploadBtn} onPress={pickVideo} disabled={saving}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                  <Text style={styles.uploadBtnText}>
                    {saving ? 'מעלה...' : 'בחר סרטון להעלאה'}
                  </Text>
                </Pressable>
                {editingTopic.videoUrl && editingTopic.videoType === 'file' && (
                  <View style={styles.videoStatusRow}>
                    <View style={styles.videoPreviewStatus}>
                      <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                      <Text style={styles.videoPreviewText}>סרטון הועלה בהצלחה</Text>
                    </View>
                    <Pressable
                      style={styles.removeVideoBtn}
                      onPress={() => setEditingTopic({ ...editingTopic, videoUrl: '', videoType: null })}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      <Text style={styles.removeVideoBtnText}>הסר</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <Pressable style={[styles.saveBtn, saving && styles.disabledBtn]} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>שמור שינויים</Text>
                )}
              </Pressable>

              <View style={{ height: 50 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row-reverse', // Align for Hebrew naturally in flex row
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,118,111,0.12)',
  },
  headerTextBlock: {
    alignItems: 'flex-end',
    flex: 1,
    marginRight: 10,
  },
  headerTitle: {
    color: PRIMARY_RED,
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 18,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    backgroundColor: CHIP_BG,
  },
  topicChipActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  topicChipText: {
    fontSize: 13,
    color: PRIMARY_RED,
    fontFamily: 'Poppins_600SemiBold',
  },
  topicChipTextActive: {
    color: '#fff',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15,91,142,0.15)',
  },
  topicLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'right',
  },
  topicTitle: {
    fontSize: 24,
    color: '#0b1b3a',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
    marginTop: 4,
  },
  topicVerse: {
    marginTop: 8,
    color: PRIMARY_RED,
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    textAlign: 'right',
  },
  topicSummary: {
    marginTop: 12,
    color: '#1f2937',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  spotlightBox: {
    marginTop: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(12,118,111,0.08)',
    padding: 12,
    borderRadius: 12,
  },
  spotlightText: {
    flex: 1,
    color: '#0c766f',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0b1b3a',
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
  },
  listItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY_RED,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  practiceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  practiceIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CHIP_BG,
    color: PRIMARY_RED,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 26,
  },
  practiceText: {
    flex: 1,
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  sourceText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
    marginBottom: 6,
  },
  ctaCard: {
    backgroundColor: '#0b1b3a',
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  ctaSubtitle: {
    color: '#cbd5f5',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Heebo_400Regular',
  },
  ctaActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  ctaBtnPrimary: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaBtnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  adminEditBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_RED,
    borderRadius: 18,
  },
  adminEditText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  videoContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 220,
  },
  youtubeWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  youtubePreview: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
  },
  youtubeThumbnail: {
    width: '100%',
    height: '100%',
  },
  youtubeThumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 12,
  },
  playTextBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Heebo_600SemiBold',
  },
  openYoutubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  openYoutubeBtnText: {
    color: '#FF0000',
    fontSize: 14,
    fontFamily: 'Heebo_600SemiBold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  modalContent: {
    padding: 16,
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    textAlign: 'right',
    color: '#111',
  },
  divider: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    marginVertical: 10,
    textAlign: 'center',
  },
  videoOptionCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  videoOptionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  videoOptionTitle: {
    fontSize: 16,
    fontFamily: 'Heebo_600SemiBold',
    color: '#111827',
  },
  videoOptionDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'right',
    fontFamily: 'Heebo_400Regular',
    lineHeight: 18,
  },
  videoStatusRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoPreviewStatus: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  videoPreviewText: {
    fontSize: 13,
    color: '#10b981',
    fontFamily: 'Heebo_500Medium',
  },
  removeVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  removeVideoBtnText: {
    fontSize: 12,
    color: '#ef4444',
    fontFamily: 'Heebo_600SemiBold',
  },
  uploadBtn: {
    backgroundColor: PRIMARY_RED,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Heebo_600SemiBold',
  },
  fileStatus: {
    textAlign: 'center',
    color: 'green',
    marginTop: 5,
  },
  saveBtn: {
    backgroundColor: PRIMARY_RED,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  disabledBtn: {
    opacity: 0.7,
  }
})




