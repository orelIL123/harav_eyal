import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView, Share, TextInput, Modal, Dimensions, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Audio, Video } from 'expo-av'
import { getDailyVideos } from '../services/dailyVideosService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const todayInsight = {
  title: 'זריקת אמונה',
  date: new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  readTime: '2 דקות קריאה',
  category: 'זריקת אמונה',
  author: 'רב אייל עמרמי',
  content: `בלייר עליון - כאייל תערוג.

תובנות מעולם התורה והאמונה.

כל יום הוא הזדמנות חדשה ללמוד, לצמוח ולהתקרב לבורא עולם.

התורה היא אור המאיר את דרכנו ומדריכה אותנו בחיי היום יום.

בואו נמשיך ללמוד יחד, לגדול באמונה ולחזק את הקשר עם הקב"ה.`,
  dedications: [
    { id: 'd1', type: 'neshama', name: 'אסתר בת רחל' },
    { id: 'd2', type: 'refuah', name: 'יוסף בן רות' },
  ],
}

const DEDICATION_TYPES = [
  { key: 'neshama', label: 'לעילוי נשמת' },
  { key: 'refuah', label: 'לרפואת' },
  { key: 'success', label: 'להצלחת' },
]

const DEDICATION_LABELS = DEDICATION_TYPES.reduce((acc, curr) => {
  acc[curr.key] = curr.label
  return acc
}, {})

export default function DailyInsightScreen({ navigation }) {
  const [isAdminMode, setIsAdminMode] = React.useState(false)
  // Content type selector: we keep it but reorder UI so text is primary
  const [activeType, setActiveType] = React.useState('text') // 'audio' | 'text'
  const [audioStatus, setAudioStatus] = React.useState(null)
  const soundRef = React.useRef(null)
  const videoRef = React.useRef(null)
  const [dedications, setDedications] = React.useState(todayInsight.dedications || [])
  const [dedicationType, setDedicationType] = React.useState(DEDICATION_TYPES[0].key)
  const [dedicationName, setDedicationName] = React.useState('')

  const demoAudio = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  const demoVideo = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'
  const demoRecordings = React.useMemo(() => [
    { id: 'a1', title: 'הקלטה יומית 1', uri: demoAudio },
    { id: 'a2', title: 'הקלטה יומית 2', uri: demoAudio },
  ], [])

  // Stories-like daily clips: load from Firestore
  const [stories, setStories] = React.useState([])
  const [loadingStories, setLoadingStories] = React.useState(true)
  
  React.useEffect(() => {
    loadDailyVideos()
  }, [])
  
  const loadDailyVideos = async () => {
    try {
      setLoadingStories(true)
      const videos = await getDailyVideos()
      // Convert to stories format
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
      // Fallback to empty array on error
      setStories([])
    } finally {
      setLoadingStories(false)
    }
  }
  
  const validStories = React.useMemo(() => {
    const now = Date.now()
    return stories.filter(s => {
      const hoursSinceCreation = (now - s.createdAt) / (1000 * 60 * 60)
      return hoursSinceCreation < 24
    })
  }, [stories])
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

  const handleShare = React.useCallback(() => {
    Share.share({ message: `${todayInsight.title}\n\n${todayInsight.content}` }).catch(() => {})
  }, [])

  const handleAddDedication = React.useCallback(() => {
    const trimmed = dedicationName.trim()
    if (!trimmed) {
      Alert.alert('שגיאה', 'הזן שם להקדשה לפני שמירה')
      return
    }
    setDedications((prev) => [
      ...prev,
      { id: `${Date.now()}`, type: dedicationType, name: trimmed },
    ])
    setDedicationName('')
    Alert.alert('הצלחה', 'ההקדשה התווספה! (שמירה מלאה תחובר ל-Firestore)')
  }, [dedicationName, dedicationType])

  const handleRemoveDedication = React.useCallback((id) => {
    setDedications((prev) => prev.filter(item => item.id !== id))
  }, [])

  const togglePlayAudio = React.useCallback(async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync()
          } else {
            await soundRef.current.playAsync()
          }
          return
        }
      }
      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: demoAudio },
        { shouldPlay: true },
        (s) => setAudioStatus(s)
      )
      soundRef.current = sound
    } catch (e) {}
  }, [])

  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {})
      }
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => Alert.alert('בקרוב', 'מסך התראות יחובר בהמשך')}>
            <Ionicons name="notifications-outline" size={22} color={PRIMARY_RED} />
          </Pressable>
          <Text style={styles.headerTitle}>זריקת אמונה</Text>
        </View>
        <View style={styles.roleToggle}>
          <Pressable accessibilityRole="button" onPress={() => setIsAdminMode(false)} style={[styles.roleBtn, !isAdminMode && styles.roleBtnActive]}>
            <Text style={[styles.roleBtnText, !isAdminMode && styles.roleBtnTextActive]}>אורח</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setIsAdminMode(true)} style={[styles.roleBtn, isAdminMode && styles.roleBtnActive]}>
            <Text style={[styles.roleBtnText, isAdminMode && styles.roleBtnTextActive]}>אדמין</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Types row: For guest show simple icons; for admin show selectable segments */}
          <View style={styles.typesRow}>
            <Pressable accessibilityRole="button" style={[styles.typeBtn, activeType === 'text' && styles.typeBtnActive]} onPress={() => setActiveType('text')}>
              <Ionicons name="book-outline" size={16} color={activeType === 'text' ? '#fff' : PRIMARY_RED} />
              <Text style={[styles.typeBtnText, activeType === 'text' && styles.typeBtnTextActive]}>טקסט</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={[styles.typeBtn, activeType === 'audio' && styles.typeBtnActive]} onPress={() => setActiveType('audio')}>
              <Ionicons name="mic-outline" size={16} color={activeType === 'audio' ? '#fff' : PRIMARY_RED} />
              <Text style={[styles.typeBtnText, activeType === 'audio' && styles.typeBtnTextActive]}>הקלטה</Text>
            </Pressable>
          </View>

          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{todayInsight.category}</Text>
          </View>

          <Text style={styles.title}>{todayInsight.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={PRIMARY_RED} style={styles.metaIcon} />
              <Text style={styles.metaText}>{todayInsight.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={PRIMARY_RED} style={styles.metaIcon} />
              <Text style={styles.metaText}>{todayInsight.readTime}</Text>
            </View>
          </View>

          {dedications.length > 0 && (
            <View style={styles.dedicationCard}>
              <View style={styles.dedicationHeader}>
                <Ionicons name="flame-outline" size={20} color="#fff" />
                <Text style={styles.dedicationTitle}>הלימוד היומי מוקדש</Text>
              </View>
              <View style={styles.dedicationList}>
                {dedications.map((dedication) => (
                  <View key={dedication.id} style={styles.dedicationRow}>
                    <View style={styles.dedicationTypePill}>
                      <Text style={styles.dedicationTypeText}>{DEDICATION_LABELS[dedication.type]}</Text>
                    </View>
                    <Text style={styles.dedicationName}>{dedication.name}</Text>
                    {isAdminMode && (
                      <Pressable
                        accessibilityRole="button"
                        style={styles.dedicationRemoveBtn}
                        onPress={() => handleRemoveDedication(dedication.id)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
              <Text style={styles.dedicationHint}>ההקדשות מתעדכנות מדי יום ונראות לכל המשתמשים</Text>
            </View>
          )}

          {isAdminMode && (
            <View style={styles.dedicationAdminCard}>
              <View style={styles.mediaHeader}>
                <Ionicons name="heart" size={18} color={PRIMARY_RED} />
                <Text style={styles.mediaTitle}>ניהול הקדשות יומיות</Text>
              </View>
              <View style={styles.dedicationTypeRow}>
                {DEDICATION_TYPES.map(type => (
                  <Pressable
                    key={type.key}
                    accessibilityRole="button"
                    style={[styles.dedicationTypeBtn, dedicationType === type.key && styles.dedicationTypeBtnActive]}
                    onPress={() => setDedicationType(type.key)}
                  >
                    <Text style={[styles.dedicationTypeBtnText, dedicationType === type.key && styles.dedicationTypeBtnTextActive]}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={styles.dedicationInput}
                placeholder="שם להקדשה (לדוגמה: יעקב בן שרה)"
                placeholderTextColor="#9ca3af"
                value={dedicationName}
                onChangeText={setDedicationName}
              />
              <Pressable accessibilityRole="button" style={styles.saveBtn} onPress={handleAddDedication}>
                <Ionicons name="save-outline" size={16} color="#fff" />
                <Text style={styles.saveBtnText}>הוסף הקדשה</Text>
              </Pressable>
            </View>
          )}

          {/* Dynamic content by type - editors only for admin */}
          {isAdminMode && activeType === 'text' && (
            <View style={styles.mediaCard}>
              <View style={styles.mediaHeader}>
                <Ionicons name="create" size={18} color={PRIMARY_RED} />
                <Text style={styles.mediaTitle}>טקסט יומי</Text>
              </View>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="כתוב כאן את התוכן היומי..."
                placeholderTextColor="#9ca3af"
                defaultValue={todayInsight.content}
              />
              <View style={styles.textActions}>
                <Pressable accessibilityRole="button" style={styles.saveBtn} onPress={() => {}}>
                  <Ionicons name="save-outline" size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>שמור</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.shareBtn} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={16} color="#fff" />
                  <Text style={styles.shareText}>שיתוף</Text>
                </Pressable>
              </View>
            </View>
          )}

          {isAdminMode && activeType === 'audio' && (
            <View style={styles.mediaCard}>
              <View style={styles.mediaHeader}>
                <Ionicons name="mic" size={18} color={PRIMARY_RED} />
                <Text style={styles.mediaTitle}>הקלטה יומית</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={togglePlayAudio} style={styles.playBtn}>
                <Ionicons name="play-circle" size={28} color="#fff" />
                <Text style={styles.playBtnText}>נגן/השהה</Text>
              </Pressable>
            </View>
          )}

          {!isAdminMode && activeType === 'audio' && (
            <View style={styles.mediaCard}>
              <View style={styles.mediaHeader}>
                <Ionicons name="mic" size={18} color={PRIMARY_RED} />
                <Text style={styles.mediaTitle}>הקלטות זמינות</Text>
              </View>
              {demoRecordings.map(rec => (
                <Pressable key={rec.id} accessibilityRole="button" style={styles.audioItem} onPress={() => {
                  // Play selected recording
                  if (soundRef.current) {
                    soundRef.current.stopAsync().catch(() => {})
                    soundRef.current.unloadAsync().catch(() => {})
                  }
                  Audio.Sound.createAsync({ uri: rec.uri }, { shouldPlay: true }, (s) => setAudioStatus(s)).then(({ sound }) => {
                    soundRef.current = sound
                  }).catch(() => {})
                }}>
                  <Ionicons name="play" size={18} color={PRIMARY_RED} />
                  <Text style={styles.audioItemText}>{rec.title}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.body}>
            {todayInsight.content.split('\n\n').map((para, idx) => (
              <Text key={idx} style={styles.paragraph}>{para}</Text>
            ))}
          </View>

          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>י״ב</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{todayInsight.author}</Text>
            </View>
            <Pressable style={styles.shareBtn} onPress={handleShare} accessibilityRole="button">
              <Ionicons name="share-social-outline" size={16} color="#fff" />
              <Text style={styles.shareText}>שיתוף</Text>
            </Pressable>
          </View>
        </View>

        {/* Stories-like daily clips strip */}
        {loadingStories ? (
          <View style={styles.storiesSection}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={PRIMARY_RED} size="large" />
              <Text style={styles.loadingText}>טוען סרטונים...</Text>
            </View>
          </View>
        ) : validStories.length > 0 ? (
          <View style={styles.storiesSection}>
            <View style={styles.storiesHeader}>
              <Text style={styles.storiesTitle}>סרטונים יומיים (סטורי)</Text>
              <Text style={styles.storiesSub}>נמחקים לאחר 24 שעות</Text>
              {isAdminMode && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable accessibilityRole="button" style={styles.storyActionBtn} onPress={() => navigation?.navigate('Admin', { initialTab: 'daily-videos' })}>
                    <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                    <Text style={styles.storyActionText}>העלה</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" style={[styles.storyActionBtn, { backgroundColor: DEEP_BLUE }]} onPress={() => Alert.alert('צילום וידאו', 'נחבר מצלמה בקרוב')}>
                    <Ionicons name="camera-outline" size={16} color="#fff" />
                    <Text style={styles.storyActionText}>צלם</Text>
                  </Pressable>
                </View>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
              {validStories.map((s, idx) => (
                <Pressable key={s.id} accessibilityRole="button" style={styles.storyBubble} onPress={() => openStory(idx)}>
                  <View style={styles.storyRing}>
                    <Ionicons name="videocam" size={22} color="#fff" />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Stories modal player */}
        <Modal visible={isStoryModalVisible} transparent animationType="fade" onRequestClose={closeStory}>
          <View style={styles.storyModalBackdrop}>
            <View style={styles.storyModalContent}>
              <Pressable accessibilityRole="button" onPress={closeStory} style={styles.storyCloseBtn}>
                <Ionicons name="close" size={26} color="#fff" />
              </Pressable>
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
          </View>
        </Modal>

        {/* Removed next reminder per request */}
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
    backgroundColor: 'rgba(30,58,138,0.12)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  roleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(220,38,38,0.3)',
    backgroundColor: 'rgba(220,38,38,0.06)',
  },
  roleBtnActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  roleBtnText: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  roleBtnTextActive: {
    color: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 64,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  typesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  typeBtnActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  typeBtnText: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  categoryChip: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(30,58,138,0.14)',
  },
  categoryText: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
  },
  title: {
    marginTop: 18,
    textAlign: 'right',
    color: DEEP_BLUE,
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 18,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    marginTop: 1,
  },
  metaText: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  dedicationCard: {
    marginTop: 16,
    backgroundColor: '#0b1b3a',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  dedicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dedicationTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  dedicationList: {
    gap: 10,
    marginTop: 6,
  },
  dedicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dedicationTypePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dedicationTypeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  dedicationName: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    textAlign: 'right',
    fontFamily: 'Heebo_600SemiBold',
  },
  dedicationHint: {
    color: '#cbd5f5',
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'Poppins_400Regular',
  },
  dedicationRemoveBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dedicationAdminCard: {
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(220,38,38,0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(220,38,38,0.04)',
  },
  dedicationTypeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dedicationTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.3)',
  },
  dedicationTypeBtnActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  dedicationTypeBtnText: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  dedicationTypeBtnTextActive: {
    color: '#fff',
  },
  dedicationInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.3)',
    paddingHorizontal: 12,
    textAlign: 'right',
    fontFamily: 'Heebo_500Medium',
    color: '#0b1b3a',
    backgroundColor: '#fff',
  },
  body: {
    marginTop: 20,
    gap: 16,
  },
  mediaCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  mediaTitle: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  playBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  videoBox: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  textInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    padding: 12,
    textAlign: 'right',
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
  },
  textActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DEEP_BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  paragraph: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'right',
    fontFamily: 'Poppins_400Regular',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  authorInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  authorName: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  authorTitle: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  shareText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  storiesSection: {
    marginTop: 14,
    paddingHorizontal: 20,
  },
  storiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  storiesTitle: {
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  storiesSub: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  storiesRow: {
    gap: 12,
    paddingVertical: 8,
  },
  storyBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 2,
    borderColor: PRIMARY_RED,
  },
  storyModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyModalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  storyVideo: {
    width: '100%',
    height: '100%',
  },
  storyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  storyActionText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  audioItemText: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
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
})
