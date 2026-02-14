import React, { useState, useEffect, useCallback } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import {
  getPersonalFaithStories,
  createPersonalFaithStory,
} from '../services/personalFaithStoriesService'
import { customAlert } from '../utils/customAlert'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'עכשיו'
  if (diff < 3600000) return `לפני ${Math.floor(diff / 60000)} דקות`
  if (diff < 86400000) return `לפני ${Math.floor(diff / 3600000)} שעות`
  if (diff < 604800000) return `לפני ${Math.floor(diff / 86400000)} ימים`
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PersonalFaithStoryScreen({ navigation }) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [authorDisplayName, setAuthorDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadStories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getPersonalFaithStories()
      setStories(data || [])
    } catch (error) {
      console.error('Error loading stories:', error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStories()
  }, [loadStories])

  const handleSubmit = async () => {
    const trimmed = (content || '').trim()
    if (!trimmed) {
      customAlert('נא למלא סיפור', 'כתוב את סיפור האמונה שלך בשדה הטקסט.')
      return
    }
    if (trimmed.length < 20) {
      customAlert('סיפור קצר מדי', 'נא לכתוב לפחות משפט או שניים (כ־20 תווים).')
      return
    }
    try {
      setSubmitting(true)
      const displayName = (authorDisplayName || '').trim() || 'אנונימי'
      const newId = await createPersonalFaithStory({
        content: trimmed,
        authorDisplayName: displayName,
      })
      setContent('')
      setAuthorDisplayName('')
      // Show the new story immediately (optimistic update)
      const newStory = {
        id: newId,
        content: trimmed,
        authorDisplayName: displayName,
        createdAt: new Date(),
      }
      setStories((prev) => [newStory, ...prev])
      customAlert('תודה!', 'סיפורך נשלח ומוצג לכולם.')
      // Refetch from server after a short delay so list stays in sync
      setTimeout(() => loadStories(), 500)
    } catch (error) {
      console.error('Error submitting story:', error)
      customAlert('שגיאה', 'לא ניתן לשלוח כרגע. נסה שוב מאוחר יותר.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>סיפור אישי</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Write your story */}
          <View style={styles.writeCard}>
            <Text style={styles.writeTitle}>שתף את סיפור האמונה שלך</Text>
            <Text style={styles.writeDesc}>הסיפור יוצג לכולם (במלל בלבד)</Text>
            <TextInput
              style={styles.input}
              placeholder="כתוב כאן את סיפור האמונה שלך..."
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{content.length} / 2000</Text>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="שם (אופציונלי - אם ריק יוצג 'אנונימי')"
              placeholderTextColor="#9ca3af"
              value={authorDisplayName}
              onChangeText={setAuthorDisplayName}
            />
            <Pressable
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <LinearGradient
                colors={[PRIMARY_RED, PRIMARY_GOLD]}
                style={styles.submitGradient}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>שלח סיפור</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Stories list */}
          <Text style={styles.sectionTitle}>סיפורים מהקהילה</Text>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={PRIMARY_RED} />
              <Text style={styles.loadingText}>טוען סיפורים...</Text>
            </View>
          ) : stories.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="heart-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>אין עדיין סיפורים. תהיה הראשון לשתף!</Text>
            </View>
          ) : (
            stories.map((story) => (
              <View key={story.id} style={styles.storyCard}>
                <View style={styles.storyHeader}>
                  <Ionicons name="person-circle-outline" size={20} color={PRIMARY_RED} />
                  <Text style={styles.storyAuthor}>
                    {story.authorDisplayName || 'אנונימי'}
                  </Text>
                  <Text style={styles.storyDate}>{formatDate(story.createdAt)}</Text>
                </View>
                <Text style={styles.storyContent}>{story.content}</Text>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  writeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  writeTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    marginBottom: 4,
  },
  writeDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nameInput: {
    minHeight: 48,
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'left',
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_RED,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  storyAuthor: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  storyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  storyContent: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#374151',
    lineHeight: 24,
    textAlign: 'right',
  },
})
