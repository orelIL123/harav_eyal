import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Image, Alert, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { pickImage, pickVideo, uploadImageToStorage, uploadVideoToStorage, generateStoragePath } from '../../utils/storage'
import { createFaithStory, getFaithStories, deleteFaithStory } from '../../services/faithStoriesService'

const PRIMARY_RED = '#DC2626'
const DEEP_BLUE = '#0b1b3a'

export default function FaithStoriesForm() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [stories, setStories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    type: 'text', // text, video
    title: '',
    content: '',
    mediaUri: null,
    mediaUrl: null,
    author: 'הרב אייל עמרמי'
  })

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await getFaithStories()
      setStories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading stories:', error)
      // For admin, show more helpful error message
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        Alert.alert(
          'שגיאת הרשאות', 
          'לא ניתן לטעון סיפורים. ודא שהכללים ב-Firestore מעודכנים וכוללים הרשאות למנהלים.'
        )
      } else {
        Alert.alert('שגיאה', 'שגיאה בטעינת סיפורים')
      }
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const handlePickMedia = async () => {
    if (form.type === 'video') {
      const result = await pickVideo()
      if (result) {
        setForm({ ...form, mediaUri: result.uri, mediaUrl: null })
      }
    } else {
      const result = await pickImage()
      if (result) {
        setForm({ ...form, mediaUri: result.uri, mediaUrl: null })
      }
    }
  }

  const handleUploadMedia = async () => {
    if (!form.mediaUri) return null

    try {
      setUploading(true)
      const folder = form.type === 'video' ? 'video/faith_stories' : 'images/faith_stories'
      const path = generateStoragePath(folder, form.type === 'video' ? 'video.mp4' : 'image.jpg')
      
      let downloadUrl
      if (form.type === 'video') {
        downloadUrl = await uploadVideoToStorage(form.mediaUri, path)
      } else {
        downloadUrl = await uploadImageToStorage(form.mediaUri, path)
      }
      
      setForm(prev => ({ ...prev, mediaUrl: downloadUrl }))
      return downloadUrl
    } catch (error) {
      console.error('Error uploading media:', error)
      Alert.alert(t('error'), 'שגיאה בהעלאת מדיה')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title) {
      Alert.alert(t('error'), 'אנא מלא כותרת')
      return
    }

    if (form.type === 'video' && !form.mediaUri && !form.mediaUrl) {
      Alert.alert(t('error'), 'אנא בחר סרטון')
      return
    }

    try {
      setLoading(true)
      let mediaUrl = form.mediaUrl

      if (form.mediaUri && !mediaUrl) {
        mediaUrl = await handleUploadMedia()
        if (!mediaUrl) {
          setLoading(false)
          return
        }
      }

      await createFaithStory({
        ...form,
        mediaUrl
      })

      Alert.alert('הצלחה', 'הסיפור נוסף בהצלחה')
      setForm({
        type: 'text',
        title: '',
        content: '',
        mediaUri: null,
        mediaUrl: null,
        author: 'הרב אייל עמרמי'
      })
      loadStories()
    } catch (error) {
      console.error('Error creating story:', error)
      Alert.alert(t('error'), 'שגיאה ביצירת הסיפור')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (story) => {
    Alert.alert(
      'מחיקת סיפור',
      'האם אתה בטוח שברצונך למחוק את הסיפור?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFaithStory(story.id)
              loadStories()
            } catch (error) {
              console.error('Error deleting story:', error)
              Alert.alert(t('error'), 'שגיאה במחיקת הסיפור')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>ניהול סיפורי אמונה</Text>
      <Text style={styles.headerDesc}>העלה טקסטים או סרטונים לחיזוק האמונה</Text>

      <View style={styles.card}>
        <View style={styles.typeSelector}>
          <Pressable
            style={[styles.typeButton, form.type === 'text' && styles.typeButtonActive]}
            onPress={() => setForm({ ...form, type: 'text', mediaUri: null, mediaUrl: null })}
          >
            <Ionicons name="document-text-outline" size={20} color={form.type === 'text' ? '#fff' : DEEP_BLUE} />
            <Text style={[styles.typeButtonText, form.type === 'text' && styles.typeButtonTextActive]}>טקסט + תמונה</Text>
          </Pressable>
          <Pressable
            style={[styles.typeButton, form.type === 'video' && styles.typeButtonActive]}
            onPress={() => setForm({ ...form, type: 'video', mediaUri: null, mediaUrl: null })}
          >
            <Ionicons name="videocam-outline" size={20} color={form.type === 'video' ? '#fff' : DEEP_BLUE} />
            <Text style={[styles.typeButtonText, form.type === 'video' && styles.typeButtonTextActive]}>סרטון</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>כותרת</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({ ...form, title: text })}
          placeholder="כותרת הסיפור..."
          textAlign="right"
        />

        <Text style={styles.label}>תוכן / תיאור</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.content}
          onChangeText={text => setForm({ ...form, content: text })}
          placeholder="תוכן הסיפור..."
          multiline
          textAlign="right"
          textAlignVertical="top"
        />

        <Text style={styles.label}>{form.type === 'video' ? 'קובץ וידאו' : 'תמונת רקע (אופציונלי)'}</Text>
        <Pressable style={styles.uploadButton} onPress={handlePickMedia} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={PRIMARY_RED} />
          ) : (
            <Ionicons name={form.type === 'video' ? "videocam" : "image"} size={24} color={PRIMARY_RED} />
          )}
          <Text style={styles.uploadButtonText}>
            {form.mediaUri ? 'קובץ נבחר (לחץ להחלפה)' : form.type === 'video' ? 'בחר סרטון' : 'בחר תמונה'}
          </Text>
        </Pressable>

        {form.mediaUri && (
          <View style={styles.previewContainer}>
            {form.type === 'video' ? (
              <View style={styles.videoPreview}>
                <Ionicons name="play-circle" size={40} color="#fff" />
                <Text style={{color: '#fff'}}>וידאו נבחר</Text>
              </View>
            ) : (
              <Image source={{ uri: form.mediaUri }} style={styles.imagePreview} resizeMode="cover" />
            )}
          </View>
        )}

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading || uploading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>פרסם סיפור</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>סיפורים קיימים ({stories.length})</Text>
      {stories.map(story => (
        <View key={story.id} style={styles.storyItem}>
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyType}>{story.type === 'video' ? '🎥 וידאו' : '📝 טקסט'}</Text>
            <Text style={styles.storyDate}>{story.createdAt?.toDate().toLocaleDateString('he-IL')}</Text>
          </View>
          <Pressable onPress={() => handleDelete(story)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={PRIMARY_RED} />
          </Pressable>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DEEP_BLUE,
    marginBottom: 4,
    textAlign: 'right',
  },
  headerDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'right',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: PRIMARY_RED,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: DEEP_BLUE,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DEEP_BLUE,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    textAlign: 'right',
  },
  textArea: {
    height: 100,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: PRIMARY_RED,
    fontWeight: '500',
  },
  previewContainer: {
    height: 200,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    alignItems: 'center',
    gap: 8,
  },
  submitButton: {
    backgroundColor: PRIMARY_RED,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DEEP_BLUE,
    marginBottom: 12,
    textAlign: 'right',
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  storyInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DEEP_BLUE,
    marginBottom: 4,
  },
  storyType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  storyDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginRight: 12, // actually left in RTL logic but flex-row makes it appear correctly if direction is handled
  },
})

