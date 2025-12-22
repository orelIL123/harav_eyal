import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, Image, ActivityIndicator, KeyboardAvoidingView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Video } from 'expo-av'
import { useTranslation } from 'react-i18next'
import { sendLocalNotification, scheduleNotification } from '../utils/notifications'
import { pickImage, pickVideo, pickPDF, pickAudio, uploadImageToStorage, uploadVideoToStorage, uploadPDFToStorage, uploadAudioToStorage, generateStoragePath, generateCardImagePath, generateNewsImagePath, generateDailyVideoPath, generateDailyVideoThumbnailPath } from '../utils/storage'
import { addLesson, getLessons, updateLesson, deleteLesson } from '../services/lessonsService'
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../services/alertsService'
import { getCard, updateCard, getAppConfig, updateAppConfig } from '../services/cardsService'
import { createNews, getNews, updateNews, deleteNews } from '../services/newsService'
import { getInstitutionContent, saveInstitutionContent } from '../services/institutionsService'
import { createPodcast, getAllPodcasts, updatePodcast, deletePodcast, uploadPodcastAudio, uploadPodcastThumbnail } from '../services/podcastsService'
import { createDailyVideo, getDailyVideos, deleteDailyVideo, cleanupExpiredVideos } from '../services/dailyVideosService'
import { createBook, getBooks, getAllBooksForAdmin, updateBook, deleteBook } from '../services/booksService'
import { createFlyer, getFlyers, getAllFlyersForAdmin, updateFlyer, deleteFlyer } from '../services/flyersService'
import { createCommunityPost, getCommunityPosts, updateCommunityPost, deleteCommunityPost } from '../services/communityPostsService'
import { getWhatsAppGroups, getAllWhatsAppGroups, createWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup } from '../services/whatsappGroupsService'
import { clearConsent, clearAllAppData } from '../utils/storage'
import { validateText, validateURL, sanitizeText } from '../utils/validation'
import { STATIC_BOOKS } from '../data/staticBooks'
import { LESSONS_DATA } from '../data/lessons'
import FaithStoriesForm from '../components/admin/FaithStoriesForm'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function AdminScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'lessons')
  
  const TABS = [
    { id: 'lessons', label: t('admin.lessons'), icon: 'library-outline' },
    { id: 'alerts', label: t('admin.alerts'), icon: 'notifications-outline' },
    { id: 'news', label: t('admin.news'), icon: 'newspaper-outline' },
    { id: 'podcasts', label: t('admin.podcasts'), icon: 'headset-outline' },
    { id: 'books', label: t('admin.books'), icon: 'book-outline' },
    { id: 'flyers', label: 'עלונים', icon: 'document-text-outline' },
    { id: 'faithStories', label: 'סיפורי אמונה', icon: 'videocam-outline' },
    { id: 'whatsappGroups', label: 'קבוצות וואטסאפ', icon: 'logo-whatsapp' },
  ]

  // Update tab if route params change
  React.useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab)
    }
    
    // Debug: Log current user UID
    import('../config/firebase').then(({ auth }) => {
      console.log('Current User UID:', auth.currentUser?.uid);
      if (!auth.currentUser) {
        console.warn('⚠️ No user logged in!');
      }
    });
  }, [route?.params?.initialTab])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f7f7f7']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('admin.adminPanel')}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map(tab => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? PRIMARY_RED : '#6b7280'}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'lessons' && <LessonsForm navigation={navigation} />}
          {activeTab === 'alerts' && <AlertsForm />}
          {activeTab === 'news' && <NewsForm />}
          {activeTab === 'podcasts' && <PodcastsForm />}
          {activeTab === 'books' && <BooksForm />}
          {activeTab === 'flyers' && <FlyersForm />}
          {activeTab === 'faithStories' && <FaithStoriesForm />}
          {activeTab === 'whatsappGroups' && <WhatsAppGroupsForm />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ========== LESSONS FORM ========== 
function LessonsForm({ navigation }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    category: 'emuna',
    title: '',
    date: '',
    videoId: '',
    url: '',
    thumbnailUri: null,
    thumbnailUrl: null,
  })
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [filterCategory, setFilterCategory] = useState(null)

  const categories = [
    { value: 'emuna', label: t('admin.lessonsForm.faithAndTrust'), icon: 'shield-checkmark-outline' },
    { value: 'likutei', label: t('admin.lessonsForm.likuteiMoharan'), icon: 'book-outline' },
    { value: 'einYaakov', label: t('admin.lessonsForm.einYaakov'), icon: 'library-outline' },
    { value: 'motseiShabbat', label: t('admin.lessonsForm.motseiShabbat'), icon: 'moon-outline' },
    { value: 'halachotShabbat', label: t('admin.lessonsForm.halachotShabbat'), icon: 'flame-outline' },
    { value: 'shortLessons', label: t('admin.lessonsForm.shortLessons'), icon: 'timer-outline' },
    { value: 'holidays', label: t('admin.lessonsForm.holidays'), icon: 'calendar-outline' },
  ]

  // Load lessons on mount and when category changes
  useEffect(() => {
    loadLessons()
  }, [filterCategory])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const firebaseLessons = await getLessons(filterCategory)
      
      // Convert LESSONS_DATA to flat array format
      const staticLessons = []
      if (LESSONS_DATA) {
        Object.keys(LESSONS_DATA).forEach(categoryKey => {
          const categoryData = LESSONS_DATA[categoryKey]
          if (categoryData && categoryData.videos) {
            categoryData.videos.forEach((video, index) => {
              staticLessons.push({
                id: video.id || `static-${categoryKey}-${index}`,
                category: categoryKey,
                title: video.title || '',
                date: video.date || '',
                url: video.url || '',
                videoId: video.videoId || '',
                order: index + 1,
                isStatic: true // Mark as static for reference
              })
            })
          }
        })
      }
      
      // Filter static lessons by category if needed
      const filteredStaticLessons = filterCategory 
        ? staticLessons.filter(lesson => lesson.category === filterCategory)
        : staticLessons
      
      // Combine static and firebase lessons
      // Firebase lessons take precedence if they have the same ID
      const allLessons = [...filteredStaticLessons, ...(firebaseLessons || [])]
      
      // Remove duplicates by ID (firebase lessons override static ones)
      const uniqueLessons = allLessons.reduce((acc, lesson) => {
        const existingIndex = acc.findIndex(l => l.id === lesson.id)
        if (existingIndex === -1) {
          acc.push(lesson)
        } else {
          // Firebase lesson overrides static one
          acc[existingIndex] = lesson
        }
        return acc
      }, [])
      
      // Sort by order if available, then by date
      uniqueLessons.sort((a, b) => {
        if (a.order && b.order) return b.order - a.order
        if (a.order && !b.order) return -1
        if (b.order && !a.order) return 1
        return 0
      })
      
      setLessons(uniqueLessons)
    } catch (error) {
      console.error('Error loading lessons:', error)
      // Fallback to static lessons on error
      const staticLessons = []
      if (LESSONS_DATA) {
        Object.keys(LESSONS_DATA).forEach(categoryKey => {
          const categoryData = LESSONS_DATA[categoryKey]
          if (categoryData && categoryData.videos) {
            categoryData.videos.forEach((video, index) => {
              if (!filterCategory || categoryKey === filterCategory) {
                staticLessons.push({
                  id: video.id || `static-${categoryKey}-${index}`,
                  category: categoryKey,
                  title: video.title || '',
                  date: video.date || '',
                  url: video.url || '',
                  videoId: video.videoId || '',
                  order: index + 1,
                  isStatic: true
                })
              }
            })
          }
        })
      }
      setLessons(staticLessons)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Validate title
    const titleValidation = validateText(form.title, { minLength: 1, maxLength: 200, required: true })
    if (!titleValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), titleValidation.error)
      return
    }

    // Validate URL
    const urlValidation = validateURL(form.url, { required: true })
    if (!urlValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), urlValidation.error)
      return
    }

    // Validate date if provided
    if (form.date) {
      const dateValidation = validateText(form.date, { maxLength: 50, required: false })
      if (!dateValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), dateValidation.error)
        return
      }
    }

    try {
      setLoading(true)
      
      // Upload thumbnail if selected but not uploaded yet
      let thumbnailUrl = form.thumbnailUrl
      if (form.thumbnailUri && !form.thumbnailUrl) {
        try {
          setUploading(true)
          const lessonId = editingLesson?.id || 'lesson-' + Date.now()
          const path = generateStoragePath(`lessons/${lessonId}`, 'thumbnail.jpg')
          thumbnailUrl = await uploadImageToStorage(form.thumbnailUri, path, (progress) => {
            console.log(`Upload progress: ${progress}%`)
          })
        } catch (error) {
          console.error('Error uploading thumbnail:', error)
          Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
        return
        } finally {
          setUploading(false)
        }
      }

      // Sanitize inputs
      const sanitizedForm = {
        ...form,
        title: titleValidation.sanitized,
        url: form.url.trim(),
        date: form.date ? sanitizeText(form.date) : '',
        category: form.category,
        videoId: form.videoId ? sanitizeText(form.videoId) : '',
        thumbnailUrl: thumbnailUrl,
      }

      if (editingLesson) {
        // Check if it's a static lesson
        if (editingLesson.isStatic) {
          Alert.alert('שים לב', 'לא ניתן לערוך שיעורים סטטיים. ניתן לערוך רק שיעורים מ-Firebase.')
          return
        }
        // Update existing lesson
        await updateLesson(editingLesson.id, sanitizedForm)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.lessonsForm.lessonUpdated'))
        setEditingLesson(null)
      } else {
        // Add new lesson
        await addLesson(sanitizedForm)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.lessonsForm.lessonAdded'))
      }
      
      // Reset form and reload
      setForm({
        category: 'emuna',
        title: '',
        date: '',
        videoId: '',
        url: '',
        thumbnailUri: null,
        thumbnailUrl: null,
      })
      setUploading(false)
      await loadLessons()
    } catch (error) {
      console.error('Error saving lesson:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.lessonsForm.errorSavingLesson'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (lesson) => {
    setEditingLesson(lesson)
    setForm({
      category: lesson.category,
      title: lesson.title,
      date: lesson.date || '',
      videoId: lesson.videoId || '',
      url: lesson.url,
      thumbnailUrl: lesson.thumbnailUrl || null,
      thumbnailUri: null,
    })
  }

  const handleDelete = (lesson) => {
    // Check if it's a static lesson
    if (lesson.isStatic) {
      Alert.alert('שים לב', 'לא ניתן למחוק שיעורים סטטיים. ניתן למחוק רק שיעורים מ-Firebase.')
      return
    }
    
    Alert.alert(
      t('admin.lessonsForm.deleteLessonTitle'),
      t('admin.lessonsForm.deleteLessonMessage', { title: lesson.title }),
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.lessonsForm.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteLesson(lesson.id)
              Alert.alert(t('admin.lessonsForm.success'), t('admin.lessonsForm.lessonDeleted'))
              await loadLessons()
            } catch (error) {
              console.error('Error deleting lesson:', error)
              Alert.alert(t('admin.lessonsForm.error'), t('admin.lessonsForm.errorDeletingLesson'))
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleCancelEdit = () => {
    setEditingLesson(null)
    setForm({
      category: 'emuna',
      title: '',
      date: '',
      videoId: '',
      url: '',
      thumbnailUri: null,
      thumbnailUrl: null,
    })
  }

  const handlePickThumbnail = async () => {
    const image = await pickImage({ aspect: [16, 9] })
    if (image) {
      setForm({ ...form, thumbnailUri: image.uri })
    }
  }

  const handleUploadThumbnail = async () => {
    if (!form.thumbnailUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'))
      return
    }

    setUploading(true)
    try {
      const lessonId = editingLesson?.id || 'lesson-' + Date.now()
      const path = generateStoragePath(`lessons/${lessonId}`, 'thumbnail.jpg')
      const url = await uploadImageToStorage(form.thumbnailUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, thumbnailUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const extractVideoId = (url) => {
    // Extract YouTube video ID from URL
    if (!url || !url.trim()) {
      setForm({...form, url: url || '', videoId: ''})
      return
    }
    
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
    
    let videoId = null
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern)
      if (match && match[1]) {
        videoId = match[1]
        break
      }
    }
    
    // Fallback: try to extract any 11-character alphanumeric string after common YouTube patterns
    if (!videoId) {
      const fallbackPattern = /(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      const fallbackMatch = cleanUrl.match(fallbackPattern)
      if (fallbackMatch && fallbackMatch[1]) {
        videoId = fallbackMatch[1]
      }
    }
    
    if (videoId) {
      setForm({...form, videoId, url: cleanUrl})
    } else {
      setForm({...form, url: cleanUrl, videoId: ''})
    }
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{t('admin.lessonsForm.title')}</Text>
      <Text style={styles.formDesc}>
        {t('admin.lessonsForm.description')}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.lessonsForm.category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {categories.map(cat => (
            <Pressable
              key={cat.value}
              style={[
                styles.categoryPill,
                form.category === cat.value && styles.categoryPillActive
              ]}
              onPress={() => setForm({...form, category: cat.value})}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={form.category === cat.value ? '#fff' : PRIMARY_RED}
              />
              <Text style={[
                styles.categoryPillText,
                form.category === cat.value && styles.categoryPillTextActive
              ]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.lessonsForm.lessonTitle')}</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder={t('admin.lessonsForm.lessonTitlePlaceholder')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.lessonsForm.dateOptional')}</Text>
        <TextInput
          style={styles.input}
          value={form.date}
          onChangeText={text => setForm({...form, date: text})}
          placeholder={t('admin.lessonsForm.datePlaceholder')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.lessonsForm.youtubeLink')}</Text>
        <TextInput
          style={styles.input}
          value={form.url}
          onChangeText={extractVideoId}
          placeholder={t('admin.lessonsForm.youtubeLinkPlaceholder')}
          autoCapitalize="none"
          keyboardType="url"
        />
        {form.videoId && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.successText}>{t('admin.lessonsForm.videoId', { videoId: form.videoId })}</Text>
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.lessonsForm.thumbnailOptional')}</Text>
        {/* Show YouTube thumbnail preview if videoId exists and no custom thumbnail */}
        {form.videoId && !form.thumbnailUrl && !form.thumbnailUri && (
          <View style={styles.imagePreview}>
            <Image 
              source={{ uri: `https://img.youtube.com/vi/${form.videoId}/hqdefault.jpg` }} 
              style={styles.previewImage}
              defaultSource={require('../../assets/icon.png')}
            />
            <View style={styles.youtubeBadge}>
              <Ionicons name="logo-youtube" size={16} color="#FF0000" />
              <Text style={styles.youtubeBadgeText}>תצוגה מקדימה מ-YouTube</Text>
            </View>
          </View>
        )}
        {form.thumbnailUrl && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.thumbnailUrl }} style={styles.previewImage} />
            <View style={styles.uploadedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
            </View>
          </View>
        )}
        {form.thumbnailUri && !form.thumbnailUrl && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.thumbnailUri }} style={styles.previewImage} />
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickThumbnail}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.thumbnailUri ? t('admin.cardsForm.selectAnotherImage') : t('admin.lessonsForm.selectThumbnail')}
            </Text>
          </Pressable>
          {form.thumbnailUri && !form.thumbnailUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadThumbnail}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.cardsForm.uploading') : t('admin.lessonsForm.uploadThumbnail')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={editingLesson ? "checkmark-circle" : "add-circle-outline"} size={22} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>
          {editingLesson ? t('admin.lessonsForm.updateLesson') : t('admin.lessonsForm.addLesson')}
        </Text>
      </Pressable>

      {editingLesson && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>{t('admin.lessonsForm.cancelEdit')}</Text>
        </Pressable>
      )}

      {/* Filter by category */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.lessonsForm.filterByCategory')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          <Pressable
            style={[styles.filterPill, !filterCategory && styles.filterPillActive]}
            onPress={() => setFilterCategory(null)}
          >
            <Text style={[styles.filterPillText, !filterCategory && styles.filterPillTextActive]}>{t('admin.lessonsForm.all')}</Text>
          </Pressable>
          {categories.map(cat => (
            <Pressable
              key={cat.value}
              style={[styles.filterPill, filterCategory === cat.value && styles.filterPillActive]}
              onPress={() => setFilterCategory(cat.value)}
            >
              <Text style={[styles.filterPillText, filterCategory === cat.value && styles.filterPillTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Existing Lessons List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.lessonsForm.existingLessons', { count: lessons.length })}</Text>
        {loading && lessons.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>{t('admin.lessonsForm.loadingLessons')}</Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('admin.lessonsForm.noLessonsInCategory')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {lessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonItem}>
                <View style={styles.lessonItemContent}>
                  <Text style={styles.lessonItemTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonItemCategory}>
                    {categories.find(c => c.value === lesson.category)?.label || lesson.category}
                  </Text>
                  {lesson.date && (
                    <Text style={styles.lessonItemDate}>{lesson.date}</Text>
                  )}
                </View>
                <View style={styles.lessonItemActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEdit(lesson)}
                  >
                    <Ionicons name="create-outline" size={20} color={PRIMARY_RED} />
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(lesson)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Pressable
        style={styles.viewLibraryButton}
        onPress={() => navigation.navigate('LessonsLibrary')}
      >
        <Ionicons name="library-outline" size={20} color={PRIMARY_RED} />
        <Text style={styles.viewLibraryText}>{t('admin.lessonsForm.viewLessonsLibrary')}</Text>
      </Pressable>
    </View>
  )
}

// ========== ALERTS FORM ========== 
function AlertsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    type: 'reminder',
    message: '',
    priority: 'medium',
    sendType: 'immediate', // immediate, scheduled
    scheduledTime: new Date().toISOString().slice(0, 16),
    targetAudience: ['all'],
    audioUri: null,
    audioUrl: null,
    imageUri: null,
    imageUrl: null,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [editingAlert, setEditingAlert] = useState(null)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const allAlerts = await getAlerts(true)
      setAlerts(Array.isArray(allAlerts) ? allAlerts : [])
    } catch (error) {
      console.error('Error loading alerts:', error)
      setAlerts([]) // Ensure alerts is always an array
    }
  }

  const handlePickImage = async () => {
    const image = await pickImage({ aspect: [16, 9] })
    if (image) {
      setForm({ ...form, imageUri: image.uri })
    }
  }

  const handleUploadImage = async () => {
    if (!form.imageUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'))
      return
    }

    setUploadingImage(true)
    try {
      const alertId = 'alert-' + Date.now()
      const path = generateStoragePath(`alerts/${alertId}`, 'image.jpg')
      const url = await uploadImageToStorage(form.imageUri, path, (progress) => {
        console.log(`Image upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'))
    } catch (error) {
      console.error('Error uploading image:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
    } finally {
      setUploadingImage(false)
    }
  }

  const handlePickAudio = async () => {
    const audio = await pickAudio()
    if (audio) {
      setForm({ ...form, audioUri: audio.uri })
    }
  }

  const handleUploadAudio = async () => {
    if (!form.audioUri) {
      Alert.alert(t('admin.lessonsForm.error'), 'בחר קובץ אודיו תחילה')
      return
    }

    setUploading(true)
    try {
      const alertId = 'alert-' + Date.now()
      const path = generateStoragePath(`alerts/${alertId}`, 'audio.mp3')
      const url = await uploadAudioToStorage(form.audioUri, path, (progress) => {
        console.log(`Audio upload progress: ${progress}%`)
      })
      setForm({ ...form, audioUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), 'הקלטה הועלתה בהצלחה')
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), 'שגיאה בהעלאת הקלטה')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    // Validate title
    const titleValidation = validateText(form.title, { minLength: 1, maxLength: 200, required: true })
    if (!titleValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), titleValidation.error)
      return
    }

    // Validate message (optional if audio is provided)
    if (!form.audioUrl && !form.message) {
      Alert.alert(t('admin.lessonsForm.error'), 'יש למלא הודעה או להעלות הקלטה')
      return
    }

    if (form.message) {
      const messageValidation = validateText(form.message, { minLength: 1, maxLength: 1000, required: false })
      if (!messageValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), messageValidation.error)
        return
      }
    }

    // Upload audio if selected but not uploaded yet
    let audioUrl = form.audioUrl
    if (form.audioUri && !form.audioUrl) {
      try {
        setUploading(true)
        const alertId = 'alert-' + Date.now()
        const path = generateStoragePath(`alerts/${alertId}`, 'audio.mp3')
        audioUrl = await uploadAudioToStorage(form.audioUri, path, (progress) => {
          console.log(`Audio upload progress: ${progress}%`)
        })
      } catch (error) {
        console.error('Error uploading audio:', error)
        Alert.alert(t('admin.lessonsForm.error'), 'שגיאה בהעלאת הקלטה')
        return
      } finally {
        setUploading(false)
      }
    }

    // Upload image if selected but not uploaded yet
    let imageUrl = form.imageUrl
    if (form.imageUri && !form.imageUrl) {
      try {
        setUploadingImage(true)
        const alertId = 'alert-' + Date.now()
        const path = generateStoragePath(`alerts/${alertId}`, 'image.jpg')
        imageUrl = await uploadImageToStorage(form.imageUri, path, (progress) => {
          console.log(`Image upload progress: ${progress}%`)
        })
      } catch (error) {
        console.error('Error uploading image:', error)
        Alert.alert(t('admin.lessonsForm.error'), 'שגיאה בהעלאת תמונה')
        return
      } finally {
        setUploadingImage(false)
      }
    }

    try {
      setLoading(true)

      // Calculate expiration time (24 hours from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      // Save to Firestore (sanitize inputs)
      const alertData = {
        title: titleValidation.sanitized,
        type: form.type,
        message: form.message ? validateText(form.message, { maxLength: 1000 }).sanitized : '',
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null,
        priority: form.priority,
        sendType: form.sendType,
        scheduledTime: form.sendType === 'scheduled' ? new Date(form.scheduledTime).toISOString() : null,
        targetAudience: form.targetAudience,
        isActive: true,
        expiresAt: expiresAt.toISOString(),
        sentAt: form.sendType === 'immediate' ? new Date().toISOString() : null
      }

      let alertId
      if (editingAlert) {
        // Update existing alert
        await updateAlert(editingAlert.id, alertData)
        alertId = editingAlert.id
        Alert.alert(
          t('admin.lessonsForm.success'),
          'התראה עודכנה בהצלחה'
        )
        setEditingAlert(null)
      } else {
        // Create new alert
        alertId = await createAlert(alertData)

        // Send push notification only for new alerts
        const notification = {
          title: form.title,
          body: form.message,
          data: {
            type: form.type,
            priority: form.priority,
            alertId: alertId,
            screen: form.type === 'reminder' ? 'DailyInsight' : 'Home'
          }
        }

        if (form.sendType === 'immediate') {
          await sendLocalNotification(notification)
          Alert.alert(
            t('admin.lessonsForm.success'),
            t('admin.alertsForm.alertSent')
          )
        } else {
          const triggerDate = new Date(form.scheduledTime)
          await scheduleNotification({
            ...notification,
            triggerDate
          })
          Alert.alert(
            t('admin.lessonsForm.success'),
            t('admin.alertsForm.alertScheduled', { triggerDate: triggerDate.toLocaleString('he-IL') })
          )
        }
      }

      // Reset form
      setForm({
        title: '',
        type: 'reminder',
        message: '',
        priority: 'medium',
        sendType: 'immediate',
        scheduledTime: new Date().toISOString().slice(0, 16),
        targetAudience: ['all'],
        audioUri: null,
        audioUrl: null,
        imageUri: null,
        imageUrl: null,
      })
      setUploading(false)

      await loadAlerts()
    } catch (error) {
      console.error('Error creating alert:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.alertsForm.errorCreatingAlert'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (alert) => {
    setEditingAlert(alert)
    setForm({
      title: alert.title || '',
      type: alert.type || 'reminder',
      message: alert.message || '',
      priority: alert.priority || 'medium',
      sendType: alert.sendType || 'immediate',
      scheduledTime: alert.scheduledTime ? new Date(alert.scheduledTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      targetAudience: Array.isArray(alert.targetAudience) ? alert.targetAudience : [alert.targetAudience || 'all'],
      audioUri: null,
      audioUrl: alert.audioUrl || null,
      imageUri: null,
      imageUrl: alert.imageUrl || null,
    })
    // Scroll to top of form
    setTimeout(() => {
      // This will be handled by the ScrollView ref if needed
    }, 100)
  }

  const handleCancelEdit = () => {
    setEditingAlert(null)
    setForm({
      title: '',
      type: 'reminder',
      message: '',
      priority: 'medium',
      sendType: 'immediate',
      scheduledTime: new Date().toISOString().slice(0, 16),
      targetAudience: ['all'],
      audioUri: null,
      audioUrl: null,
      imageUri: null,
      imageUrl: null,
    })
  }

  const handleDelete = (alert) => {
    Alert.alert(
      t('admin.alertsForm.deleteAlertTitle'),
      t('admin.alertsForm.deleteAlertMessage', { title: alert.title }),
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.lessonsForm.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteAlert(alert.id)
              Alert.alert(t('admin.lessonsForm.success'), t('admin.alertsForm.alertDeleted'))
              await loadAlerts()
            } catch (error) {
              console.error('Error deleting alert:', error)
              Alert.alert(t('admin.lessonsForm.error'), t('admin.alertsForm.errorDeletingAlert'))
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {editingAlert ? 'עריכת התראה' : t('admin.alertsForm.title')}
        </Text>
        {editingAlert && (
          <Pressable
            style={styles.cancelEditButton}
            onPress={handleCancelEdit}
          >
            <Ionicons name="close-circle-outline" size={20} color={PRIMARY_RED} />
            <Text style={styles.cancelEditText}>ביטול עריכה</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.alertsForm.reminderTitle')}</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder={t('admin.alertsForm.reminderTitlePlaceholder')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.alertsForm.alertType')}</Text>
        <View style={styles.radioGroup}>
          {[ 
            { value: 'reminder', label: t('admin.alertsForm.dailyReminder'), color: PRIMARY_RED },
            { value: 'push', label: t('admin.alertsForm.dailyPush'), color: PRIMARY_GOLD },
            { value: 'announcement', label: t('admin.alertsForm.importantAnnouncement'), color: '#16a34a' }
          ].map(option => (
            <Pressable
              key={option.value}
              style={[ 
                styles.radioButton,
                form.type === option.value && { backgroundColor: `${option.color}15`, borderColor: option.color }
              ]}
              onPress={() => setForm({...form, type: option.value})}
            >
              <Text style={[styles.radioText, form.type === option.value && { color: option.color }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.alertsForm.sendType')}</Text>
        <View style={styles.radioGroup}>
          {[ 
            { value: 'immediate', label: t('admin.alertsForm.sendImmediately'), color: PRIMARY_RED },
            { value: 'scheduled', label: t('admin.alertsForm.schedule'), color: PRIMARY_GOLD }
          ].map(option => (
            <Pressable
              key={option.value}
              style={[ 
                styles.radioButton,
                form.sendType === option.value && { backgroundColor: `${option.color}15`, borderColor: option.color }
              ]}
              onPress={() => setForm({...form, sendType: option.value})}
            >
              <Text style={[styles.radioText, form.sendType === option.value && { color: option.color }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {form.sendType === 'scheduled' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('admin.alertsForm.dateAndTime')}</Text>
          <TextInput
            style={styles.input}
            value={form.scheduledTime}
            onChangeText={text => setForm({...form, scheduledTime: text})}
            placeholder="2024-01-01T08:00"
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.alertsForm.message')} (אופציונלי אם יש הקלטה)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.message}
          onChangeText={text => setForm({...form, message: text})}
          placeholder={t('admin.alertsForm.messagePlaceholder')}
          multiline
          numberOfLines={3}
          maxLength={1000}
        />
        <Text style={styles.charCount}>{form.message.length}/1000</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תמונה (אופציונלי)</Text>
        {form.imageUrl && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />
          </View>
        )}
        {form.imageUri && !form.imageUrl && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
          </View>
        )}
        <Pressable
          style={styles.uploadButton}
          onPress={handlePickImage}
          disabled={uploadingImage}
        >
          <Ionicons name="image-outline" size={20} color={PRIMARY_RED} />
          <Text style={styles.uploadButtonText}>
            {form.imageUri ? 'בחר תמונה אחרת' : 'בחר תמונה'}
          </Text>
        </Pressable>
        {form.imageUri && !form.imageUrl && (
          <Pressable
            style={[styles.uploadButton, styles.uploadButtonActive]}
            onPress={handleUploadImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color={PRIMARY_RED} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={20} color={PRIMARY_RED} />
            )}
            <Text style={styles.uploadButtonText}>
              {uploadingImage ? 'מעלה...' : 'העלה תמונה'}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>הקלטה (אופציונלי)</Text>
        {form.audioUrl && (
          <View style={styles.previewContainer}>
            <Ionicons name="musical-notes" size={24} color={PRIMARY_RED} />
            <Text style={styles.previewText}>הקלטה הועלתה בהצלחה</Text>
          </View>
        )}
        {form.audioUri && !form.audioUrl && (
          <View style={styles.previewContainer}>
            <Ionicons name="musical-notes-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.previewText}>קובץ נבחר, יש להעלות</Text>
          </View>
        )}
        <Pressable
          style={styles.uploadButton}
          onPress={handlePickAudio}
          disabled={uploading}
        >
          <Ionicons name="musical-notes-outline" size={20} color={PRIMARY_RED} />
          <Text style={styles.uploadButtonText}>
            {form.audioUri ? 'בחר הקלטה אחרת' : 'בחר הקלטה'}
          </Text>
        </Pressable>
        {form.audioUri && !form.audioUrl && (
          <Pressable
            style={[styles.uploadButton, styles.uploadButtonActive]}
            onPress={handleUploadAudio}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={PRIMARY_RED} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={20} color={PRIMARY_RED} />
            )}
            <Text style={styles.uploadButtonText}>
              {uploading ? 'מעלה...' : 'העלה הקלטה'}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.alertsForm.priority')}</Text>
        <View style={styles.radioGroup}>
          {[ 
            { value: 'high', label: t('admin.alertsForm.high'), color: '#dc2626' },
            { value: 'medium', label: t('admin.alertsForm.medium'), color: '#f59e0b' },
            { value: 'low', label: t('admin.alertsForm.low'), color: '#6b7280' }
          ].map(option => (
            <Pressable
              key={option.value}
              style={[ 
                styles.radioButton,
                form.priority === option.value && { backgroundColor: `${option.color}15`, borderColor: option.color }
              ]}
              onPress={() => setForm({...form, priority: option.value})}
            >
              <Text style={[styles.radioText, form.priority === option.value && { color: option.color }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.alertsForm.targetAudience')}</Text>
        <View style={styles.radioGroup}>
          {[ 
            { value: 'all', label: t('admin.alertsForm.allUsers'), color: PRIMARY_RED },
            { value: 'registered', label: t('admin.alertsForm.registeredUsersOnly'), color: PRIMARY_GOLD }
          ].map(option => (
            <Pressable
              key={option.value}
              style={[ 
                styles.radioButton,
                form.targetAudience.includes(option.value) && { backgroundColor: `${option.color}15`, borderColor: option.color }
              ]}
              onPress={() => {
                setForm({...form, targetAudience: [option.value]})
              }}
            >
              <Text style={[styles.radioText, form.targetAudience.includes(option.value) && { color: option.color }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
            <Ionicons name="send" size={20} color="#fff" style={{ zIndex: 1 }} />
            <Text style={[styles.submitButtonText, { zIndex: 1 }]}>
              {editingAlert ? 'עדכן התראה' : t('admin.alertsForm.sendAlert')}
            </Text>
          </>
        )}
      </Pressable>

      {/* Existing Alerts List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.alertsForm.activeAlerts', { count: alerts.length })}</Text>
        {loading && alerts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>{t('admin.alertsForm.loadingAlerts')}</Text>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('admin.alertsForm.noActiveAlerts')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.alertsList}>
            {alerts.map((alert) => {
              const expiresAt = alert.expiresAt ? (alert.expiresAt.toDate ? alert.expiresAt.toDate() : new Date(alert.expiresAt)) : null
              const sentAt = alert.sentAt ? (alert.sentAt.toDate ? alert.sentAt.toDate() : new Date(alert.sentAt)) : (alert.createdAt ? (alert.createdAt.toDate ? alert.createdAt.toDate() : new Date(alert.createdAt)) : null)
              const hoursLeft = expiresAt ? Math.round((expiresAt - new Date()) / (1000 * 60 * 60)) : null
              
              return (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertItemContent}>
                    <Text style={styles.alertItemTitle}>{alert.title}</Text>
                    {alert.message && (
                      <Text style={styles.alertItemMessage}>{alert.message}</Text>
                    )}
                    <View style={styles.alertItemMeta}>
                      <Text style={styles.alertItemType}>
                        {alert.type === 'reminder' ? t('admin.alertsForm.reminder') : alert.type === 'push' ? t('admin.alertsForm.push') : t('admin.alertsForm.announcement')}
                      </Text>
                      {hoursLeft !== null && hoursLeft > 0 && (
                        <Text style={styles.alertItemExpiry}>
                          {t('admin.alertsForm.expiresIn', { hoursLeft })}
                        </Text>
                      )}
                    </View>
                    {sentAt && (
                      <Text style={styles.alertItemDate}>
                        נשלח: {sentAt.toLocaleString('he-IL', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    )}
                  </View>
                  <View style={styles.alertItemActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => handleEdit(alert)}
                    >
                      <Ionicons name="create-outline" size={18} color="#fff" />
                      <Text style={styles.editButtonText}>ערוך</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(alert)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                      <Text style={styles.deleteButtonText}>מחק</Text>
                    </Pressable>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>

      <Text style={styles.note}>
        {t('admin.alertsForm.note')}
      </Text>
    </View>
  )
}

// ========== COURSES FORM ========== 
function CoursesForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: 'ניגון ראשון',
    level: 'Beginner',
    duration: '6 פרקים • 3.5 שעות',
    description: 'מבוא למסחר ממושמע — הגדרת מטרות, ניהול סיכונים ובניית שגרה יומית.',
    isPremium: false
  })

  const handleSubmit = () => {
    Alert.alert(
      'קורס יתווסף! 📚',
      `כותרת: ${form.title}\nרמה: ${form.level}\n\nבגרסה הסופית:\n• העלאת וידאו ל-Firebase Storage\n• שמירת metadata ל-Firestore\n• העלאת תמונת cover`
    )
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>📚 הוספת קורס חדש</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כותרת הקורס</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>רמת קושי</Text>
        <View style={styles.radioGroup}>
          {['Beginner', 'Intermediate', 'Advanced', 'Mindset'].map(level => (
            <Pressable
              key={level}
              style={[styles.radioButton, form.level === level && styles.radioButtonActive]}
              onPress={() => setForm({...form, level})}
            >
              <Text style={[styles.radioText, form.level === level && styles.radioTextActive]}>
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>משך הקורס</Text>
        <TextInput
          style={styles.input}
          value={form.duration}
          onChangeText={text => setForm({...form, duration: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תיאור</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={text => setForm({...form, description: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setForm({...form, isPremium: !form.isPremium})}
        >
          <View style={[styles.checkboxBox, form.isPremium && styles.checkboxBoxChecked]}>
            {form.isPremium && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>🔒 קורס פרימיום (נעול למשתמשים רגילים)</Text>
        </Pressable>
      </View>

      <View style={styles.uploadSection}>
        <Pressable style={styles.uploadButton}>
          <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
          <Text style={styles.uploadButtonText}>העלה קובץ וידאו</Text>
        </Pressable>
        <Pressable style={styles.uploadButton}>
          <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
          <Text style={styles.uploadButtonText}>העלה תמונת Cover</Text>
        </Pressable>
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>הוסף קורס</Text>
      </Pressable>
    </View>
  )
}

// ========== CARDS FORM ========== 
function CardsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    key: 'daily-insight',
    title: t('admin.cardsForm.dailyValue'),
    desc: t('admin.cardsForm.descriptionPlaceholder'),
    icon: 'bulb-outline',
    locked: false,
    headerTitle: t('home.rabbiName'),
    headerSubtitle: "הודו לה' כי טוב",
    imageUri: null,
    imageUrl: null,
  })
  const [uploading, setUploading] = useState(false)

  const handlePickImage = async () => {
    const image = await pickImage({ aspect: [16, 9] })
    if (image) {
      setForm({ ...form, imageUri: image.uri })
    }
  }

  const handleUploadImage = async () => {
    if (!form.imageUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'))
      return
    }

    setUploading(true)
    try {
      const path = generateCardImagePath(form.key, 'card-image.jpg')
      const url = await uploadImageToStorage(form.imageUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCardData()
  }, [form.key])

  const loadCardData = async () => {
    try {
      const card = await getCard(form.key)
      if (card) {
        setForm(prev => ({
          ...prev,
          title: card.title ?? prev.title,
          desc: card.desc ?? prev.desc,
          icon: card.icon ?? prev.icon,
          locked: card.locked ?? false,
          imageUrl: card.imageUrl ?? null,
        }))
      }

      // Load header config
      const config = await getAppConfig()
      if (config) {
        setForm(prev => ({
          ...prev,
          headerTitle: config.title ?? prev.headerTitle,
          headerSubtitle: config.subtitle ?? prev.headerSubtitle,
        }))
      }
    } catch (error) {
      console.error('Error loading card data:', error)
    }
  }

  const handleSubmit = async () => {
    if (form.imageUri && !form.imageUrl) {
      Alert.alert(t('admin.cardsForm.notice'), t('admin.cardsForm.errorUploadImage'))
      return
    }

    try {
      setLoading(true)

      // Update card
      const cardData = {
        key: form.key,
        title: form.title,
        desc: form.desc,
        icon: form.icon,
        locked: form.locked,
        imageUrl: form.imageUrl,
        isActive: true,
      }
      await updateCard(form.key, cardData)

      // Update header config
      const configData = {
        title: form.headerTitle,
        subtitle: form.headerSubtitle,
      }
      await updateAppConfig(configData)

      Alert.alert(
        t('admin.lessonsForm.success'),
        t('admin.cardsForm.cardUpdated', { title: form.title })
      )
    } catch (error) {
      console.error('Error updating card:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUpdatingCard'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{t('admin.cardsForm.title')}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.cardsForm.selectCard')}</Text>
        <View style={styles.radioGroup}>
          {[ 
            { value: 'daily-insight', label: t('admin.cardsForm.dailyValue') },
            { value: 'community', label: t('admin.cardsForm.community') },
            { value: 'books', label: t('admin.cardsForm.books') },
            { value: 'institutions', label: t('admin.cardsForm.rabbiInstitutions') },
            { value: 'live-alerts', label: t('admin.cardsForm.hotAlerts') }
          ].map(option => (
            <Pressable
              key={option.value}
              style={[styles.radioButton, form.key === option.value && styles.radioButtonActive]}
              onPress={() => setForm({...form, key: option.value, title: option.label})}
            >
              <Text style={[styles.radioText, form.key === option.value && styles.radioTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.cardsForm.cardTitle')}</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder={t('admin.cardsForm.dailyValue')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.cardsForm.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.desc}
          onChangeText={text => setForm({...form, desc: text})}
          placeholder={t('admin.cardsForm.descriptionPlaceholder')}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.cardsForm.icon')}</Text>
        <TextInput
          style={styles.input}
          value={form.icon}
          onChangeText={text => setForm({...form, icon: text})}
          placeholder="bulb-outline"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setForm({...form, locked: !form.locked})}
        >
          <View style={[styles.checkboxBox, form.locked && styles.checkboxBoxChecked]}>
            {form.locked && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>{t('admin.cardsForm.lockedCard')}</Text>
        </Pressable>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.cardsForm.backgroundImage')}</Text>
        {form.imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
            {form.imageUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.imageUri ? t('admin.cardsForm.selectAnotherImage') : t('admin.cardsForm.selectBackgroundImage')}
            </Text>
          </Pressable>
          {form.imageUri && !form.imageUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.cardsForm.uploading') : t('admin.cardsForm.uploadImage')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.separator} />

      <Text style={styles.sectionSubtitle}>{t('admin.cardsForm.mainHeader')}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.cardsForm.header')}</Text>
        <TextInput
          style={styles.input}
          value={form.headerTitle}
          onChangeText={text => setForm({...form, headerTitle: text})}
          placeholder={t('home.rabbiName')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.cardsForm.subtitle')}</Text>
        <TextInput
          style={styles.input}
          value={form.headerSubtitle}
          onChangeText={text => setForm({...form, headerSubtitle: text})}
          placeholder="הודו לה' כי טוב"
        />
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>{t('admin.cardsForm.saveChanges')}</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.note}>
        {t('admin.cardsForm.note')}
      </Text>
    </View>
  )
}

// ========== RECOMMENDATIONS FORM ========== 
function RecommendationsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: 'למה אני לא משתמש ב-Stop Loss',
    type: 'video',
    description: 'הסבר מפורט על התוכן',
    url: 'https://youtube.com/watch?v=...'
  })

  const handleSubmit = () => {
    Alert.alert(
      'המלצה תתווסף! ⭐',
      `כותרת: ${form.title}\nסוג: ${form.type}\n\nיופיע בבאנר במסך הבית`
    )
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>⭐ המלצה</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>סוג תוכן</Text>
        <View style={styles.radioGroup}>
          {[ 
            { value: 'video', label: '🎥 וידאו' },
            { value: 'article', label: '📰 מאמר' },
            { value: 'podcast', label: '🎙️ פודקאסט' }
          ].map(option => (
            <Pressable
              key={option.value}
              style={[styles.radioButton, form.type === option.value && styles.radioButtonActive]}
              onPress={() => setForm({...form, type: option.value})}
            >
              <Text style={[styles.radioText, form.type === option.value && styles.radioTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כותרת</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תיאור קצר</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={text => setForm({...form, description: text})}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קישור (URL)</Text>
        <TextInput
          style={styles.input}
          value={form.url}
          onChangeText={text => setForm({...form, url: text})}
          placeholder="https://..."
          autoCapitalize="none"
        />
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
        <Ionicons name="star" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>פרסם המלצה</Text>
      </Pressable>
    </View>
  )
}

// ========== NEWS FORM ========== 
function NewsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    category: 'community',
    content: '',
    imageUri: null,
    imageUrl: null,
  })
  const [uploading, setUploading] = useState(false)

  const handlePickImage = async () => {
    // Don't crop images for news - allow full image
    const image = await pickImage({ aspect: null })
    if (image) {
      setForm({ ...form, imageUri: image.uri })
    }
  }

  const handleUploadImage = async () => {
    if (!form.imageUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'))
      return
    }

    setUploading(true)
    try {
      const path = generateNewsImagePath(Date.now().toString(), 'news-image.jpg')
      const url = await uploadImageToStorage(form.imageUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const [loading, setLoading] = useState(false)
  const [news, setNews] = useState([])
  const [editingNews, setEditingNews] = useState(null)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const allNews = await getNews()
      setNews(Array.isArray(allNews) ? allNews : [])
    } catch (error) {
      console.error('Error loading news:', error)
      setNews([]) // Ensure news is always an array
    }
  }

  const handleSubmit = async () => {
    // Validate title
    const titleValidation = validateText(form.title, { minLength: 1, maxLength: 200, required: true })
    if (!titleValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), titleValidation.error)
      return
    }

    // Validate content
    const contentValidation = validateText(form.content, { minLength: 1, maxLength: 10000, required: true })
    if (!contentValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), contentValidation.error)
      return
    }

    // Validate imageUrl if provided
    if (form.imageUrl) {
      const imageUrlValidation = validateURL(form.imageUrl, { required: false })
      if (!imageUrlValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), imageUrlValidation.error)
        return
      }
    }

    // Upload image if selected but not uploaded yet
    let imageUrl = form.imageUrl
    if (form.imageUri && !form.imageUrl) {
      try {
        setUploading(true)
        const path = generateNewsImagePath(Date.now().toString(), 'news-image.jpg')
        imageUrl = await uploadImageToStorage(form.imageUri, path, (progress) => {
          console.log(`Image upload progress: ${progress}%`)
        })
      } catch (error) {
        console.error('Error uploading image:', error)
        Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
        return
      } finally {
        setUploading(false)
      }
    }

    try {
      setLoading(true)

      // Parse custom date if provided
      let publishedAt = null
      if (form.customDate) {
        const dateParts = form.customDate.split('/')
        if (dateParts.length === 3) {
          // Format: DD/MM/YYYY
          const day = parseInt(dateParts[0], 10)
          const month = parseInt(dateParts[1], 10) - 1 // Month is 0-indexed
          const year = parseInt(dateParts[2], 10)
          publishedAt = new Date(year, month, day)
        } else {
          // Try to parse as ISO string
          publishedAt = new Date(form.customDate)
        }
      }

      const newsData = {
        title: titleValidation.sanitized,
        category: form.category,
        content: contentValidation.sanitized,
        imageUrl: imageUrl || null,
        isPublished: true,
        publishedAt: publishedAt || new Date(), // Use custom date or current date
      }

      if (editingNews) {
        await updateNews(editingNews.id, newsData)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.newsForm.newsUpdated'))
      } else {
        await createNews(newsData)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.newsForm.newsPublished'))
      }

      // Reset form
      setForm({
        title: '',
        category: 'community',
        content: '',
        imageUri: null,
        imageUrl: null,
        customDate: null,
      })
      setUploading(false)
      setEditingNews(null)
      await loadNews()
    } catch (error) {
      console.error('Error saving news:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.newsForm.errorPublishingNews'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem)
    // Format date for display
    let dateStr = null
    if (newsItem.publishedAt) {
      const date = newsItem.publishedAt.toDate ? newsItem.publishedAt.toDate() : new Date(newsItem.publishedAt)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      dateStr = `${day}/${month}/${year}`
    }
    setForm({
      title: newsItem.title,
      category: newsItem.category || 'community',
      content: newsItem.content,
      imageUri: null,
      imageUrl: newsItem.imageUrl || null,
      customDate: dateStr,
    })
  }

  const handleDelete = (newsItem) => {
    Alert.alert(
      t('admin.newsForm.deleteNewsTitle'),
      t('admin.newsForm.deleteNewsMessage', { title: newsItem.title }),
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.lessonsForm.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteNews(newsItem.id)
              Alert.alert(t('admin.lessonsForm.success'), t('admin.newsForm.newsDeleted'))
              await loadNews()
            } catch (error) {
              console.error('Error deleting news:', error)
              Alert.alert(t('admin.lessonsForm.error'), t('admin.newsForm.errorDeletingNews'))
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleCancelEdit = () => {
    setEditingNews(null)
    setForm({
      title: '',
      category: 'community',
      content: '',
      imageUri: null,
      imageUrl: null,
      customDate: null,
    })
  }

  const handleSetTodayDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    setForm({ ...form, customDate: `${day}/${month}/${year}` })
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{t('admin.newsForm.title')}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.newsForm.newsTitle')}</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.newsForm.content')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.content}
          onChangeText={text => setForm({...form, content: text})}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.newsForm.publishDate')}</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={form.customDate || ''}
            onChangeText={text => setForm({...form, customDate: text})}
            placeholder={t('admin.newsForm.datePlaceholder')}
            placeholderTextColor="#9ca3af"
          />
          <Pressable
            style={styles.todayButton}
            onPress={handleSetTodayDate}
          >
            <Ionicons name="calendar-outline" size={18} color={PRIMARY_RED} />
            <Text style={styles.todayButtonText}>{t('admin.newsForm.today')}</Text>
          </Pressable>
        </View>
        <Text style={styles.helperText}>{t('admin.newsForm.helperText')}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.newsForm.image')}</Text>
        {form.imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
            {form.imageUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.imageUri ? t('admin.newsForm.selectAnotherImage') : t('admin.newsForm.selectImage')}
            </Text>
          </Pressable>
          {form.imageUri && !form.imageUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.newsForm.uploading') : t('admin.newsForm.uploadImage')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
            <Ionicons name={editingNews ? "checkmark-circle" : "newspaper"} size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {editingNews ? t('admin.newsForm.updateNews') : t('admin.newsForm.publishNews')}
            </Text>
          </>
        )}
      </Pressable>

      {editingNews && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>{t('admin.newsForm.cancelEdit')}</Text>
        </Pressable>
      )}

      {/* Existing News List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.newsForm.existingNews', { count: news.length })}</Text>
        {loading && news.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>{t('admin.newsForm.loadingNews')}</Text>
          </View>
        ) : news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('admin.newsForm.noNews')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {news.map((newsItem) => (
              <View key={newsItem.id} style={styles.lessonItem}>
                <View style={styles.lessonItemContent}>
                  <Text style={styles.lessonItemTitle}>{newsItem.title}</Text>
                  {newsItem.publishedAt && (
                    <Text style={styles.lessonItemDate}>
                      {newsItem.publishedAt.toDate ? 
                        newsItem.publishedAt.toDate().toLocaleDateString('he-IL') : 
                        new Date(newsItem.publishedAt).toLocaleDateString('he-IL')}
                    </Text>
                  )}
                </View>
                <View style={styles.lessonItemActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEdit(newsItem)}
                  >
                    <Ionicons name="create-outline" size={20} color={PRIMARY_RED} />
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(newsItem)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

// ========== BOOKS FORM ========== 
function BooksForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    imageUri: null,
    imageUrl: null,
    purchaseLink: '',
    isActive: true,
  })
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      // Use admin function to get all books including inactive ones
      const firebaseBooks = await getAllBooksForAdmin()
      
      // Combine static and firebase books
      // Firebase books take precedence if they have the same ID
      const allBooks = [...STATIC_BOOKS, ...(firebaseBooks || [])]
      
      // Remove duplicates by ID (firebase books override static ones)
      const uniqueBooks = allBooks.reduce((acc, book) => {
        const existingIndex = acc.findIndex(b => b.id === book.id)
        if (existingIndex === -1) {
          acc.push(book)
        } else {
          // Firebase book overrides static one
          acc[existingIndex] = book
        }
        return acc
      }, [])
      
      setBooks(uniqueBooks)
    } catch (error) {
      console.error('Error loading books:', error)
      // Fallback to static books on error
      setBooks(STATIC_BOOKS || [])
    } finally {
      setLoading(false)
    }
  }

  const handlePickImage = async () => {
    const image = await pickImage({ aspect: [3, 4] })
    if (image) {
      setForm({ ...form, imageUri: image.uri })
    }
  }

  const handleUploadImage = async () => {
    if (!form.imageUri) {
      Alert.alert('שגיאה', 'אנא בחר תמונה')
      return
    }

    setUploading(true)
    try {
      const bookId = editingBook?.id || 'book-' + Date.now()
      const path = generateStoragePath(`books/${bookId}`, 'book-image.jpg')
      const url = await uploadImageToStorage(form.imageUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url })
      Alert.alert('הצלחה', 'התמונה הועלתה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את התמונה')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    // Validate title
    const titleValidation = validateText(form.title, { minLength: 1, maxLength: 200, required: true })
    if (!titleValidation.valid) {
      Alert.alert('שגיאה', titleValidation.error)
      return
    }

    // Validate purchase link if provided
    if (form.purchaseLink) {
      const linkValidation = validateURL(form.purchaseLink, { required: false })
      if (!linkValidation.valid) {
        Alert.alert('שגיאה', linkValidation.error)
        return
      }
    }

    if (form.imageUri && !form.imageUrl) {
      Alert.alert('שים לב', 'אנא העלה את התמונה לפני שמירה')
      return
    }

    try {
      setLoading(true)
      
      if (editingBook) {
        // Check if it's a static book
        if (editingBook.isStatic || STATIC_BOOKS.some(b => b.id === editingBook.id)) {
          Alert.alert('שים לב', 'לא ניתן לערוך ספרים סטטיים. ניתן לערוך רק ספרים מ-Firebase.')
          return
        }
        // Update existing book
        await updateBook(editingBook.id, {
          title: titleValidation.sanitized,
          imageUrl: form.imageUrl,
          purchaseLink: form.purchaseLink ? form.purchaseLink.trim() : '',
          isActive: form.isActive,
        })
        Alert.alert('הצלחה', 'הספר עודכן בהצלחה')
        setEditingBook(null)
      } else {
        // Add new book
        await createBook({
          title: titleValidation.sanitized,
          imageUrl: form.imageUrl,
          purchaseLink: form.purchaseLink ? form.purchaseLink.trim() : '',
          isActive: form.isActive,
        })
        Alert.alert('הצלחה', 'הספר נוסף בהצלחה')
      }
      
      // Reset form
      setForm({
        title: '',
        imageUri: null,
        imageUrl: null,
        purchaseLink: '',
        isActive: true,
      })
      await loadBooks()
    } catch (error) {
      console.error('Error saving book:', error)
      Alert.alert('שגיאה', 'לא ניתן לשמור את הספר')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (book) => {
    setEditingBook(book)
    setForm({
      title: book.title || '',
      imageUrl: book.imageUrl || null,
      imageUri: null,
      purchaseLink: book.purchaseLink || '',
      isActive: book.isActive !== undefined ? book.isActive : true,
    })
  }

  const handleCancelEdit = () => {
    setEditingBook(null)
    setForm({
      title: '',
      imageUri: null,
      imageUrl: null,
      purchaseLink: '',
      isActive: true,
    })
  }

  const handleDelete = (book) => {
    // Check if it's a static book
    if (book.isStatic || STATIC_BOOKS.some(b => b.id === book.id)) {
      Alert.alert('שים לב', 'לא ניתן למחוק ספרים סטטיים. ניתן למחוק רק ספרים מ-Firebase.')
      return
    }
    
    Alert.alert(
      'מחיקת ספר', `האם אתה בטוח שברצונך למחוק את הספר "${book.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteBook(book.id)
              Alert.alert('הצלחה', 'הספר נמחק בהצלחה')
              await loadBooks()
            } catch (error) {
              console.error('Error deleting book:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את הספר')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>ניהול ספרים</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>שם הספר</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="הזן את שם הספר"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קישור לרכישה</Text>
        <TextInput
          style={styles.input}
          value={form.purchaseLink}
          onChangeText={text => setForm({...form, purchaseLink: text})}
          placeholder="הזן קישור לרכישה"
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>

      <View style={styles.formGroup}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setForm({...form, isActive: !form.isActive})}
        >
          <View style={[styles.checkboxBox, form.isActive && styles.checkboxBoxChecked]}>
            {form.isActive && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>הצג באפליקציה (פעיל)</Text>
        </Pressable>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תמונה</Text>
        {form.imageUrl && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />
            <View style={styles.uploadedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
            </View>
          </View>
        )}
        {form.imageUri && !form.imageUrl && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.imageUri ? 'בחר תמונה אחרת' : 'בחר תמונה'}
            </Text>
          </Pressable>
          {form.imageUri && !form.imageUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? 'מעלה...' : 'העלה תמונה'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={editingBook ? "checkmark-circle-outline" : "add-circle-outline"} size={22} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>
          {editingBook ? 'עדכן ספר' : 'הוסף ספר'}
        </Text>
      </Pressable>

      {editingBook && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>ביטול עריכה</Text>
        </Pressable>
      )}

      {/* Existing Books List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>ספרים קיימים ({books.length})</Text>
        {loading && books.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען ספרים...</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין ספרים</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {books.map((book) => (
              <View key={book.id} style={styles.lessonItem}>
                <View style={styles.lessonItemContent}>
                  <Text style={styles.lessonItemTitle}>{book.title}</Text>
                  {book.purchaseLink && (
                    <Text style={styles.lessonItemCategory}>יש קישור לרכישה</Text>
                  )}
                  <Text style={[styles.lessonItemCategory, { color: book.isActive ? '#16a34a' : '#dc2626' }]}>
                    {book.isActive ? 'פעיל' : 'לא פעיל'}
                  </Text>
                </View>
                <View style={styles.lessonItemActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEdit(book)}
                  >
                    <Ionicons name="create-outline" size={20} color={PRIMARY_RED} />
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(book)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

// ========== FLYERS FORM ========== 
function FlyersForm() {
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    pdfUri: null,
    pdfUrl: null,
    imageUri: null,
    imageUrl: null,
    fileType: null, // 'pdf' or 'image'
    isActive: true,
  })
  const [flyers, setFlyers] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingFlyer, setEditingFlyer] = useState(null)

  useEffect(() => {
    loadFlyers()
  }, [])

  const loadFlyers = async () => {
    try {
      setLoading(true)
      // Use admin function to get all flyers including inactive ones
      const allFlyers = await getAllFlyersForAdmin()
      setFlyers(Array.isArray(allFlyers) ? allFlyers : [])
    } catch (error) {
      console.error('Error loading flyers:', error)
      setFlyers([])
      Alert.alert('שגיאה', 'לא ניתן לטעון את העלונים')
    } finally {
      setLoading(false)
    }
  }

  const handlePickAndUploadPDF = async () => {
    const pdf = await pickPDF()
    if (!pdf) return

    setUploading(true)
    try {
      const flyerId = editingFlyer?.id || 'flyer-' + Date.now()
      const path = generateStoragePath(`flyers/${flyerId}`, 'flyer.pdf')
      const url = await uploadPDFToStorage(pdf.uri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, pdfUrl: url, pdfUri: null, imageUri: null, imageUrl: null, fileType: 'pdf' })
      Alert.alert('הצלחה', 'קובץ ה-PDF הועלה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את קובץ ה-PDF')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handlePickAndUploadImage = async () => {
    const image = await pickImage()
    if (!image) return

    setUploading(true)
    try {
      const flyerId = editingFlyer?.id || 'flyer-' + Date.now()
      const path = generateStoragePath(`flyers/${flyerId}`, 'flyer.jpg')
      const url = await uploadImageToStorage(image.uri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url, imageUri: null, pdfUri: null, pdfUrl: null, fileType: 'image' })
      Alert.alert('הצלחה', 'התמונה הועלתה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את התמונה')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert('שגיאה', 'אנא הזן שם עלון')
      return
    }

    if (!form.pdfUrl && !form.imageUrl) {
      Alert.alert('שגיאה', 'אנא העלה קובץ PDF או תמונה')
      return
    }

    try {
      setLoading(true)
      
      const dateObj = new Date(form.date)
      
      if (editingFlyer) {
        await updateFlyer(editingFlyer.id, {
          title: form.title.trim(),
          date: dateObj,
          pdfUrl: form.pdfUrl || null,
          imageUrl: form.imageUrl || null,
          fileType: form.fileType || (form.pdfUrl ? 'pdf' : form.imageUrl ? 'image' : null),
          isActive: form.isActive,
        })
        Alert.alert('הצלחה', 'העלון עודכן בהצלחה')
        setEditingFlyer(null)
      } else {
        await createFlyer({
          title: form.title.trim(),
          date: dateObj,
          pdfUrl: form.pdfUrl || null,
          imageUrl: form.imageUrl || null,
          fileType: form.fileType || (form.pdfUrl ? 'pdf' : form.imageUrl ? 'image' : null),
          isActive: form.isActive,
        })
        Alert.alert('הצלחה', 'העלון נוסף בהצלחה')
      }
      
      // Reset form
      setForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        pdfUri: null,
        pdfUrl: null,
        imageUri: null,
        imageUrl: null,
        fileType: null,
        isActive: true,
      })
      await loadFlyers()
    } catch (error) {
      console.error('Error saving flyer:', error)
      Alert.alert('שגיאה', 'לא ניתן לשמור את העלון')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (flyer) => {
    setEditingFlyer(flyer)
    let dateStr = new Date().toISOString().split('T')[0]
    if (flyer.date) {
      const date = flyer.date.toDate ? flyer.date.toDate() : new Date(flyer.date)
      dateStr = date.toISOString().split('T')[0]
    }
    setForm({
      title: flyer.title || '',
      date: dateStr,
      pdfUrl: flyer.pdfUrl || null,
      pdfUri: null,
      imageUrl: flyer.imageUrl || null,
      imageUri: null,
      fileType: flyer.fileType || (flyer.pdfUrl ? 'pdf' : flyer.imageUrl ? 'image' : null),
      isActive: flyer.isActive !== undefined ? flyer.isActive : true,
    })
  }

  const handleCancelEdit = () => {
    setEditingFlyer(null)
    setForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      pdfUri: null,
      pdfUrl: null,
      imageUri: null,
      imageUrl: null,
      fileType: null,
      isActive: true,
    })
  }

  const handleDelete = (flyer) => {
    Alert.alert(
      'מחיקת עלון',
      `האם אתה בטוח שברצונך למחוק את העלון "${flyer.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteFlyer(flyer.id)
              Alert.alert('הצלחה', 'העלון נמחק בהצלחה')
              await loadFlyers()
            } catch (error) {
              console.error('Error deleting flyer:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את העלון')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>ניהול עלונים</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>שם העלון</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="לדוגמה: עלון שבועי פרשת השבוע"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תאריך</Text>
        <TextInput
          style={styles.input}
          value={form.date}
          onChangeText={text => setForm({...form, date: text})}
          placeholder="YYYY-MM-DD"
        />
        <Pressable
          style={styles.todayButton}
          onPress={() => setForm({...form, date: new Date().toISOString().split('T')[0]})}
        >
          <Text style={styles.todayButtonText}>היום</Text>
        </Pressable>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קובץ עלון</Text>
        {(form.pdfUrl || form.imageUrl) && (
          <View style={styles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.uploadedText}>
              {form.fileType === 'pdf' ? 'קובץ PDF הועלה' : 'תמונה הועלתה'}
            </Text>
          </View>
        )}
        {form.imageUrl && (
          <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handlePickAndUploadPDF}
            disabled={uploading}
          >
            {uploading && form.fileType === 'pdf' ? (
              <ActivityIndicator color={PRIMARY_RED} />
            ) : (
              <Ionicons name="document-text-outline" size={24} color={PRIMARY_RED} />
            )}
            <Text style={styles.uploadButtonText}>
              {uploading && form.fileType === 'pdf' ? 'מעלה PDF...' : 'העלה קובץ PDF'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handlePickAndUploadImage}
            disabled={uploading}
          >
            {uploading && form.fileType === 'image' ? (
              <ActivityIndicator color={PRIMARY_RED} />
            ) : (
              <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            )}
            <Text style={styles.uploadButtonText}>
              {uploading && form.fileType === 'image' ? 'מעלה תמונה...' : 'העלה תמונה'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setForm({...form, isActive: !form.isActive})}
        >
          <View style={[styles.checkboxBox, form.isActive && styles.checkboxBoxChecked]}>
            {form.isActive && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>עלון פעיל</Text>
        </Pressable>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={editingFlyer ? "checkmark-circle-outline" : "add-circle-outline"} size={22} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>
          {editingFlyer ? 'עדכן עלון' : 'הוסף עלון'}
        </Text>
      </Pressable>

      {editingFlyer && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>ביטול עריכה</Text>
        </Pressable>
      )}

      {/* Existing Flyers List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>עלונים קיימים ({flyers.length})</Text>
        {loading && flyers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען עלונים...</Text>
          </View>
        ) : flyers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין עלונים</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {flyers.map((flyer) => {
              const flyerDate = flyer.date ? 
                (flyer.date.toDate ? flyer.date.toDate().toLocaleDateString('he-IL') : new Date(flyer.date).toLocaleDateString('he-IL')) : 
                ''
              return (
                <View key={flyer.id} style={styles.lessonItem}>
                  {flyer.imageUrl && (
                    <Image source={{ uri: flyer.imageUrl }} style={styles.flyerPreviewThumbnail} resizeMode="cover" />
                  )}
                  {flyer.pdfUrl && !flyer.imageUrl && (
                    <View style={styles.flyerPreviewPdf}>
                      <Ionicons name="document-text-outline" size={32} color={PRIMARY_RED} />
                      <Text style={styles.flyerPreviewPdfText}>PDF</Text>
                    </View>
                  )}
                  <View style={styles.lessonItemContent}>
                    <Text style={styles.lessonItemTitle}>{flyer.title}</Text>
                    {flyerDate && (
                      <Text style={styles.lessonItemCategory}>{flyerDate}</Text>
                    )}
                    <Text style={[styles.lessonItemCategory, { color: flyer.isActive ? '#16a34a' : '#dc2626' }]}>
                      {flyer.isActive ? 'פעיל' : 'לא פעיל'}
                    </Text>
                  </View>
                  <View style={styles.lessonItemActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => handleEdit(flyer)}
                    >
                      <Ionicons name="create-outline" size={20} color={PRIMARY_RED} />
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(flyer)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#dc2626" />
                    </Pressable>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

// ========== COMMUNITY POSTS FORM ========== 
function CommunityPostsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    summary: '',
    imageUri: null,
    imageUrl: null,
    isEvent: false,
    date: new Date().toISOString().split('T')[0],
    isActive: true,
  })
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  // Load posts on mount
  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const allPosts = await getCommunityPosts()
      setPosts(Array.isArray(allPosts) ? allPosts : [])
    } catch (error) {
      console.error('Error loading community posts:', error)
      setPosts([]) // Ensure posts is always an array
      Alert.alert(t('admin.lessonsForm.error'), 'שגיאה בטעינת הפוסטים')
    } finally {
      setLoading(false)
    }
  }

  const handlePickImage = async () => {
    // Don't crop images for news - allow full image
    const image = await pickImage({ aspect: null })
    if (image) {
      setForm({ ...form, imageUri: image.uri })
    }
  }

  const handleUploadImage = async () => {
    if (!form.imageUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'))
      return
    }

    setUploading(true)
    try {
      const postId = editingPost?.id || 'community-post-' + Date.now()
      const path = generateStoragePath(`communityPosts/${postId}`, 'image.jpg')
      const url = await uploadImageToStorage(form.imageUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    // Validate title
    const titleValidation = validateText(form.title, { minLength: 1, maxLength: 200, required: true })
    if (!titleValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), titleValidation.error)
      return
    }

    // Validate summary if provided
    let summaryValidation = { valid: true, sanitized: '' }
    if (form.summary) {
      summaryValidation = validateText(form.summary, { maxLength: 2000, required: false })
      if (!summaryValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), summaryValidation.error)
        return
      }
    }

    // Validate imageUrl if provided
    if (form.imageUrl) {
      const imageUrlValidation = validateURL(form.imageUrl, { required: false })
      if (!imageUrlValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), imageUrlValidation.error)
        return
      }
    }

    // Validate date
    if (form.date) {
      const dateValidation = validateText(form.date, { maxLength: 50, required: false })
      if (!dateValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), dateValidation.error)
        return
      }
    }

    if (form.imageUri && !form.imageUrl) {
      Alert.alert(t('admin.cardsForm.notice'), t('admin.cardsForm.errorUploadImage'))
      return
    }

    try {
      setLoading(true)
      
      const dateObj = new Date(form.date)
      
      if (editingPost) {
        // Update existing post
        await updateCommunityPost(editingPost.id, {
          title: titleValidation.sanitized,
          summary: summaryValidation.sanitized,
          imageUrl: form.imageUrl,
          isEvent: form.isEvent,
          date: dateObj,
          isActive: form.isActive,
        })
        Alert.alert(t('admin.lessonsForm.success'), 'הפוסט עודכן בהצלחה')
        setEditingPost(null)
      } else {
        // Add new post
        await createCommunityPost({
          title: titleValidation.sanitized,
          summary: summaryValidation.sanitized,
          imageUrl: form.imageUrl,
          isEvent: form.isEvent,
          date: dateObj,
          isActive: form.isActive,
        })
        Alert.alert(t('admin.lessonsForm.success'), 'הפוסט נוסף בהצלחה')
      }
      
      // Reset form
      setForm({
        title: '',
        summary: '',
        imageUri: null,
        imageUrl: null,
        isEvent: false,
        date: new Date().toISOString().split('T')[0],
        isActive: true,
      })
      await loadPosts()
    } catch (error) {
      console.error('Error saving post:', error)
      Alert.alert(t('admin.lessonsForm.error'), 'שגיאה בשמירת הפוסט')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    let dateStr = new Date().toISOString().split('T')[0]
    if (post.date) {
      const date = post.date.toDate ? post.date.toDate() : new Date(post.date)
      dateStr = date.toISOString().split('T')[0]
    }
    setForm({
      title: post.title || '',
      summary: post.summary || '',
      imageUrl: post.imageUrl || null,
      imageUri: null,
      isEvent: post.isEvent || false,
      date: dateStr,
      isActive: post.isActive !== undefined ? post.isActive : true,
    })
  }

  const handleCancelEdit = () => {
    setEditingPost(null)
    setForm({
      title: '',
      summary: '',
      imageUri: null,
      imageUrl: null,
      isEvent: false,
      date: new Date().toISOString().split('T')[0],
      isActive: true,
    })
  }

  const handleDelete = (post) => {
    Alert.alert(
      'מחיקת פוסט',
      `האם אתה בטוח שברצונך למחוק את הפוסט "${post.title}"?`,
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.lessonsForm.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteCommunityPost(post.id)
              Alert.alert(t('admin.lessonsForm.success'), 'הפוסט נמחק בהצלחה')
              await loadPosts()
            } catch (error) {
              console.error('Error deleting post:', error)
              Alert.alert(t('admin.lessonsForm.error'), 'שגיאה במחיקת הפוסט')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>ניהול חדשות הקהילה</Text>
      <Text style={styles.formDesc}>
        הוסף וערוך פוסטים קהילתיים עם תמונות
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כותרת הפוסט</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="כותרת הפוסט"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תוכן (אופציונלי)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.summary}
          onChangeText={text => setForm({...form, summary: text})}
          placeholder="תוכן הפוסט"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תמונה (אופציונלי)</Text>
        {form.imageUrl && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUrl }} style={styles.previewImage} />
            <View style={styles.uploadedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
            </View>
          </View>
        )}
        {form.imageUri && !form.imageUrl && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.imageUri ? t('admin.cardsForm.selectAnotherImage') : 'בחר תמונה'}
            </Text>
          </Pressable>
          {form.imageUri && !form.imageUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.cardsForm.uploading') : 'העלה תמונה'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תאריך</Text>
        <TextInput
          style={styles.input}
          value={form.date}
          onChangeText={text => setForm({...form, date: text})}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.checkboxGroup}>
          <Pressable
            style={styles.checkbox}
            onPress={() => setForm({...form, isEvent: !form.isEvent})}
          >
            <View style={[styles.checkboxBox, form.isEvent && styles.checkboxBoxChecked]}>
              {form.isEvent && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>זהו אירוע</Text>
          </Pressable>
          <Pressable
            style={styles.checkbox}
            onPress={() => setForm({...form, isActive: !form.isActive})}
          >
            <View style={[styles.checkboxBox, form.isActive && styles.checkboxBoxChecked]}>
              {form.isActive && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>פעיל</Text>
          </Pressable>
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={editingPost ? "checkmark-circle" : "add-circle-outline"} size={22} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>
          {editingPost ? 'עדכן פוסט' : 'הוסף פוסט'}
        </Text>
      </Pressable>

      {editingPost && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>בטל עריכה</Text>
        </Pressable>
      )}

      {/* Existing Posts List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>פוסטים קיימים ({posts.length})</Text>
        {loading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען פוסטים...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין פוסטים עדיין</Text>
          </View>
        ) : (
          <ScrollView style={styles.postsList}>
            {posts.map((post) => (
              <View key={post.id} style={styles.postItem}>
                <View style={styles.postItemContent}>
                  {post.imageUrl && (
                    <Image source={{ uri: post.imageUrl }} style={styles.postItemImage} />
                  )}
                  <View style={styles.postItemText}>
                    <Text style={styles.postItemTitle}>{post.title}</Text>
                    {post.summary && (
                      <Text style={styles.postItemSummary} numberOfLines={2}>{post.summary}</Text>
                    )}
                    <View style={styles.postItemMeta}>
                      {post.isEvent && (
                        <View style={styles.eventBadge}>
                          <Ionicons name="calendar-outline" size={12} color={PRIMARY_RED} />
                          <Text style={styles.eventBadgeText}>אירוע</Text>
                        </View>
                      )}
                      {!post.isActive && (
                        <Text style={styles.inactiveBadge}>לא פעיל</Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.postItemActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleEdit(post)}
                  >
                    <Ionicons name="create-outline" size={20} color={PRIMARY_RED} />
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleDelete(post)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

// ========== PODCASTS FORM ========== 
function PodcastsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    audioUri: null,
    audioUrl: null,
    youtubeUrl: '',
    youtubeVideoId: '',
    thumbnailUri: null,
    thumbnailUrl: null,
    duration: 0,
    isActive: true,
  })
  const [podcasts, setPodcasts] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingPodcast, setEditingPodcast] = useState(null)

  useEffect(() => {
    loadPodcasts()
  }, [])

  const loadPodcasts = async () => {
    try {
      setLoading(true)
      const allPodcasts = await getAllPodcasts()
      setPodcasts(Array.isArray(allPodcasts) ? allPodcasts : [])
    } catch (error) {
      console.error('Error loading podcasts:', error)
      setPodcasts([]) // Ensure podcasts is always an array
      Alert.alert(t('admin.lessonsForm.error'), t('admin.podcastsForm.loadingPodcasts'))
    } finally {
      setLoading(false)
    }
  }

  const handlePickAudio = async () => {
    try {
      const DocumentPicker = await import('expo-document-picker')

      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      })

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const audio = result.assets[0]
        setForm({ ...form, audioUri: audio.uri, audioUrl: null })
        console.log('Selected audio file:', audio.uri)
      }
    } catch (error) {
      console.error('Error picking audio:', error)
      Alert.alert(t('admin.lessonsForm.error'), 'שגיאה בבחירת קובץ אודיו')
    }
  }

  const handlePickThumbnail = async () => {
    const { pickImage } = await import('../utils/storage')
    const image = await pickImage({ aspect: [1, 1] })
    if (image) {
      setForm({ ...form, thumbnailUri: image.uri })
    }
  }

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url || !url.trim()) {
      setForm({...form, youtubeUrl: url || '', youtubeVideoId: ''})
      return
    }
    
    const cleanUrl = url.trim()
    
    const patterns = [
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|&|$)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ]
    
    let videoId = null
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern)
      if (match && match[1]) {
        videoId = match[1]
        break
      }
    }
    
    if (!videoId) {
      const fallbackPattern = /(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      const fallbackMatch = cleanUrl.match(fallbackPattern)
      if (fallbackMatch && fallbackMatch[1]) {
        videoId = fallbackMatch[1]
      }
    }
    
    if (videoId) {
      setForm({...form, youtubeVideoId: videoId, youtubeUrl: cleanUrl})
    } else {
      setForm({...form, youtubeUrl: cleanUrl, youtubeVideoId: ''})
    }
  }

  const handleUploadAudio = async () => {
    if (!form.audioUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.podcastsForm.selectAudioFile'))
      return
    }

    setUploading(true)
    try {
      const podcastId = editingPodcast?.id || 'temp-' + Date.now()
      const url = await uploadPodcastAudio(form.audioUri, podcastId, (progress) => {
        console.log(`Audio upload progress: ${progress}%`)
      })
      setForm({ ...form, audioUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.podcastsForm.audioUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.podcastsForm.errorUploadingAudio'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadThumbnail = async () => {
    if (!form.thumbnailUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'))
      return
    }

    setUploading(true)
    try {
      const podcastId = editingPodcast?.id || 'temp-' + Date.now()
      const url = await uploadPodcastThumbnail(form.thumbnailUri, podcastId, (progress) => {
        console.log(`Thumbnail upload progress: ${progress}%`)
      })
      setForm({ ...form, thumbnailUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    // Validate title
    const titleValidation = validateText(form.title, { minLength: 1, maxLength: 200, required: true })
    if (!titleValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), titleValidation.error)
      return
    }

    // Validate description if provided
    let descriptionValidation = { valid: true, sanitized: '' }
    if (form.description) {
      descriptionValidation = validateText(form.description, { maxLength: 2000, required: false })
      if (!descriptionValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), descriptionValidation.error)
        return
      }
    }

    // Validate thumbnailUrl if provided
    if (form.thumbnailUrl) {
      const thumbnailUrlValidation = validateURL(form.thumbnailUrl, { required: false })
      if (!thumbnailUrlValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), thumbnailUrlValidation.error)
        return
      }
    }

    // Validate audioUrl if provided
    if (form.audioUrl) {
      const audioUrlValidation = validateURL(form.audioUrl, { required: false })
      if (!audioUrlValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), audioUrlValidation.error)
        return
      }
    }

    // Validate YouTube URL if provided
    if (form.youtubeUrl) {
      const youtubeUrlValidation = validateURL(form.youtubeUrl, { required: false })
      if (!youtubeUrlValidation.valid) {
        Alert.alert(t('admin.lessonsForm.error'), youtubeUrlValidation.error)
        return
      }
    }

    // Require either audioUrl or youtubeUrl
    if (!form.audioUrl && !form.youtubeUrl) {
      Alert.alert(t('admin.lessonsForm.error'), 'יש להעלות קובץ אודיו או להוסיף קישור YouTube')
      return
    }

    try {
      setLoading(true)
      
      // Sanitize form data
      const sanitizedForm = {
        ...form,
        title: titleValidation.sanitized,
        description: descriptionValidation.sanitized,
        category: form.category ? sanitizeText(form.category) : '',
        youtubeUrl: form.youtubeUrl ? sanitizeText(form.youtubeUrl) : '',
        youtubeVideoId: form.youtubeVideoId || '',
      }
      
      if (editingPodcast) {
        await updatePodcast(editingPodcast.id, sanitizedForm)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.podcastsForm.podcastUpdated'))
        setEditingPodcast(null)
      } else {
        await createPodcast(sanitizedForm)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.podcastsForm.podcastAdded'))
      }
      
      setForm({
        title: '',
        description: '',
        category: '',
        audioUri: null,
        audioUrl: null,
        youtubeUrl: '',
        youtubeVideoId: '',
        thumbnailUri: null,
        thumbnailUrl: null,
        duration: 0,
        isActive: true,
      })
      await loadPodcasts()
    } catch (error) {
      console.error('Error saving podcast:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.podcastsForm.errorSavingPodcast'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (podcast) => {
    setEditingPodcast(podcast)
    setForm({
      title: podcast.title,
      description: podcast.description || '',
      category: podcast.category || '',
      audioUri: null,
      audioUrl: podcast.audioUrl || null,
      youtubeUrl: podcast.youtubeUrl || '',
      youtubeVideoId: podcast.youtubeVideoId || '',
      thumbnailUri: null,
      thumbnailUrl: podcast.thumbnailUrl || null,
      duration: podcast.duration || 0,
      isActive: podcast.isActive !== undefined ? podcast.isActive : true,
    })
  }

  const handleDelete = (podcast) => {
    Alert.alert(
      t('admin.podcastsForm.deletePodcastTitle'),
      t('admin.podcastsForm.deletePodcastMessage', { title: podcast.title }),
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.lessonsForm.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deletePodcast(podcast.id)
              Alert.alert(t('admin.lessonsForm.success'), t('admin.podcastsForm.podcastDeleted'))
              await loadPodcasts()
            } catch (error) {
              console.error('Error deleting podcast:', error)
              Alert.alert(t('admin.lessonsForm.error'), t('admin.podcastsForm.errorDeletingPodcast'))
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleCancelEdit = () => {
    setEditingPodcast(null)
    setForm({
      title: '',
      description: '',
      category: '',
      audioUri: null,
      audioUrl: null,
      youtubeUrl: '',
      youtubeVideoId: '',
      thumbnailUri: null,
      thumbnailUrl: null,
      duration: 0,
      isActive: true,
    })
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{t('admin.podcastsForm.title')}</Text>
      <Text style={styles.formDesc}>
        {t('admin.podcastsForm.description')}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.podcastsForm.podcastTitle')}</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder={t('admin.podcastsForm.podcastTitlePlaceholder')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.podcastsForm.descriptionOptional')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={text => setForm({...form, description: text})}
          placeholder={t('admin.podcastsForm.descriptionPlaceholder')}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.podcastsForm.categoryOptional')}</Text>
        <TextInput
          style={styles.input}
          value={form.category}
          onChangeText={text => setForm({...form, category: text})}
          placeholder={t('admin.podcastsForm.categoryPlaceholder')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קישור YouTube (אופציונלי - במקום קובץ אודיו)</Text>
        <TextInput
          style={styles.input}
          value={form.youtubeUrl}
          onChangeText={extractYouTubeId}
          placeholder="https://www.youtube.com/watch?v=..."
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="url"
        />
        {form.youtubeVideoId && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.successText}>תצוגה מקדימה: {form.youtubeVideoId}</Text>
          </View>
        )}
        {form.youtubeVideoId && (
          <View style={styles.imagePreview}>
            <Image 
              source={{ uri: `https://img.youtube.com/vi/${form.youtubeVideoId}/hqdefault.jpg` }} 
              style={styles.previewImage}
              defaultSource={require('../../assets/icon.png')}
            />
            <View style={styles.youtubeBadge}>
              <Ionicons name="logo-youtube" size={16} color="#FF0000" />
              <Text style={styles.youtubeBadgeText}>תצוגה מקדימה מ-YouTube</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.podcastsForm.audioFile')} (אופציונלי - אם יש קישור YouTube)</Text>
        {form.audioUrl && (
          <View style={styles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.uploadedText}>{t('admin.podcastsForm.audioFileUploaded')}</Text>
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickAudio}
            disabled={uploading}
          >
            <Ionicons name="musical-notes-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.audioUri ? t('admin.podcastsForm.selectAnotherFile') : t('admin.podcastsForm.selectAudioFile')}
            </Text>
          </Pressable>
          {form.audioUri && !form.audioUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadAudio}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.cardsForm.uploading') : t('admin.podcastsForm.uploadAudio')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.podcastsForm.coverImageOptional')}</Text>
        {form.thumbnailUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.thumbnailUri }} style={styles.previewImage} />
            {form.thumbnailUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickThumbnail}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.thumbnailUri ? t('admin.cardsForm.selectAnotherImage') : t('admin.podcastsForm.selectCoverImage')}
            </Text>
          </Pressable>
          {form.thumbnailUri && !form.thumbnailUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadThumbnail}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.cardsForm.uploading') : t('admin.cardsForm.uploadImage')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setForm({...form, isActive: !form.isActive})}
        >
          <View style={[styles.checkboxBox, form.isActive && styles.checkboxBoxChecked]}>
            {form.isActive && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>{t('admin.podcastsForm.activePodcast')}</Text>
        </Pressable>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={editingPodcast ? "checkmark-circle" : "add-circle-outline"} size={22} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>
          {editingPodcast ? t('admin.podcastsForm.updatePodcast') : t('admin.podcastsForm.addPodcast')}
        </Text>
      </Pressable>

      {editingPodcast && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>{t('admin.lessonsForm.cancelEdit')}</Text>
        </Pressable>
      )}

      {/* Existing Podcasts List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.podcastsForm.existingPodcasts', { count: podcasts.length })}</Text>
        {loading && podcasts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>{t('admin.podcastsForm.loadingPodcasts')}</Text>
          </View>
        ) : podcasts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="headset-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('admin.podcastsForm.noPodcasts')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {podcasts.map((podcast) => (
              <View key={podcast.id} style={styles.lessonItem}>
                <View style={styles.lessonItemContent}>
                  <Text style={styles.lessonItemTitle}>{podcast.title}</Text>
                  {podcast.description && (
                    <Text style={styles.lessonItemCategory} numberOfLines={2}>
                      {podcast.description}
                    </Text>
                  )}
                  <View style={styles.lessonItemDate}>
                    <Ionicons name={podcast.isActive ? "checkmark-circle" : "close-circle"} size={14} color={podcast.isActive ? "#16a34a" : "#dc2626"} />
                    <Text style={[styles.lessonItemDate, { marginLeft: 4 }]}>
                      {podcast.isActive ? t('admin.podcastsForm.active') : t('admin.podcastsForm.inactive')}
                    </Text>
                  </View>
                </View>
                <View style={styles.lessonItemActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEdit(podcast)}
                  >
                    <Ionicons name="create-outline" size={20} color={PRIMARY_RED} />
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(podcast)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

// ========== WHATSAPP GROUPS FORM ==========
function WhatsAppGroupsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    url: '',
    order: 0,
    isActive: true,
  })
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const allGroups = await getAllWhatsAppGroups()
      setGroups(Array.isArray(allGroups) ? allGroups : [])
    } catch (error) {
      console.error('Error loading WhatsApp groups:', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const nameValidation = validateText(form.name, { minLength: 1, maxLength: 200, required: true })
    if (!nameValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), nameValidation.error)
      return
    }

    const urlValidation = validateURL(form.url, { required: true })
    if (!urlValidation.valid) {
      Alert.alert(t('admin.lessonsForm.error'), urlValidation.error)
      return
    }

    try {
      setLoading(true)
      
      const sanitizedForm = {
        name: nameValidation.sanitized,
        url: sanitizeText(form.url),
        order: form.order || 0,
        isActive: form.isActive !== undefined ? form.isActive : true,
      }
      
      if (editingGroup) {
        await updateWhatsAppGroup(editingGroup.id, sanitizedForm)
        Alert.alert(t('admin.lessonsForm.success'), 'קבוצת וואטסאפ עודכנה בהצלחה')
        setEditingGroup(null)
      } else {
        await createWhatsAppGroup(sanitizedForm)
        Alert.alert(t('admin.lessonsForm.success'), 'קבוצת וואטסאפ נוספה בהצלחה')
      }
      
      setForm({
        name: '',
        url: '',
        order: 0,
        isActive: true,
      })
      await loadGroups()
    } catch (error) {
      console.error('Error saving WhatsApp group:', error)
      Alert.alert(t('admin.lessonsForm.error'), 'שגיאה בשמירת קבוצת וואטסאפ')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (group) => {
    setEditingGroup(group)
    setForm({
      name: group.name || '',
      url: group.url || '',
      order: group.order || 0,
      isActive: group.isActive !== undefined ? group.isActive : true,
    })
  }

  const handleDelete = (group) => {
    Alert.alert(
      'מחיקת קבוצת וואטסאפ',
      `האם אתה בטוח שברצונך למחוק את "${group.name}"?`,
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.lessonsForm.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteWhatsAppGroup(group.id)
              Alert.alert(t('admin.lessonsForm.success'), 'קבוצת וואטסאפ נמחקה בהצלחה')
              await loadGroups()
            } catch (error) {
              console.error('Error deleting WhatsApp group:', error)
              Alert.alert(t('admin.lessonsForm.error'), 'שגיאה במחיקת קבוצת וואטסאפ')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleCancelEdit = () => {
    setEditingGroup(null)
    setForm({
      name: '',
      url: '',
      order: 0,
      isActive: true,
    })
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>ניהול קבוצות וואטסאפ</Text>
      <Text style={styles.formDesc}>
        הוסף וניהול קישורים לקבוצות וואטסאפ שיוצגו למשתמשים
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>שם הקבוצה</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={text => setForm({...form, name: text})}
          placeholder="לדוגמה: קבוצת קהילה ראשית"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קישור קבוצת וואטסאפ</Text>
        <TextInput
          style={styles.input}
          value={form.url}
          onChangeText={text => setForm({...form, url: text})}
          placeholder="https://chat.whatsapp.com/..."
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>סדר הצגה</Text>
        <TextInput
          style={styles.input}
          value={form.order.toString()}
          onChangeText={text => setForm({...form, order: parseInt(text) || 0})}
          placeholder="0"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setForm({...form, isActive: !form.isActive})}
        >
          <View style={[styles.checkboxBox, form.isActive && styles.checkboxBoxChecked]}>
            {form.isActive && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>פעיל</Text>
        </Pressable>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={editingGroup ? "checkmark-circle" : "add-circle-outline"} size={22} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>
          {editingGroup ? 'עדכן קבוצה' : 'הוסף קבוצה'}
        </Text>
      </Pressable>

      {editingGroup && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>{t('admin.lessonsForm.cancelEdit')}</Text>
        </Pressable>
      )}

      {/* Existing Groups List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>קבוצות קיימות ({groups.length})</Text>
        {loading && groups.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען קבוצות...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="logo-whatsapp" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין קבוצות וואטסאפ</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {groups.map((group) => (
              <View key={group.id} style={styles.lessonItem}>
                <View style={styles.lessonItemContent}>
                  <Text style={styles.lessonItemTitle}>{group.name}</Text>
                  <Text style={styles.lessonItemCategory} numberOfLines={1}>
                    {group.url}
                  </Text>
                  <Text style={styles.lessonItemDate}>
                    {group.isActive ? 'פעיל' : 'לא פעיל'} • סדר: {group.order || 0}
                  </Text>
                </View>
                <View style={styles.lessonItemActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEdit(group)}
                  >
                    <Ionicons name="create-outline" size={20} color={PRIMARY_RED} />
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(group)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

// ========== DAILY VIDEOS FORM ========== 
function DailyVideosForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: t('admin.dailyVideosForm.videoTitlePlaceholder'),
    description: '',
    videoUri: null,
    videoUrl: null,
    thumbnailUri: null,
    thumbnailUrl: null,
  })
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    loadVideos()
    cleanupExpiredVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const allVideos = await getDailyVideos()
      setVideos(Array.isArray(allVideos) ? allVideos : [])
    } catch (error) {
      console.error('Error loading videos:', error)
      setVideos([]) // Ensure videos is always an array
    } finally {
      setLoading(false)
    }
  }

  const handlePickVideo = async () => {
    const video = await pickVideo()
    if (video) {
      setForm({ ...form, videoUri: video.uri })
    }
  }

  const handlePickThumbnail = async () => {
    const image = await pickImage({ aspect: [9, 16] })
    if (image) {
      setForm({ ...form, thumbnailUri: image.uri })
    }
  }

  const handleUploadVideo = async () => {
    if (!form.videoUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.dailyVideosForm.errorFillTitleAndVideo'))
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      const videoId = 'daily-video-' + Date.now()
      const url = await uploadVideoToStorage(form.videoUri, generateDailyVideoPath(videoId), (progress) => {
        setUploadProgress(progress)
      })
      setForm({ ...form, videoUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.dailyVideosForm.videoUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.dailyVideosForm.errorUploadingVideo'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadThumbnail = async () => {
    if (!form.thumbnailUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'))
      return
    }

    setUploading(true)
    try {
      const videoId = 'daily-video-' + Date.now()
      const url = await uploadImageToStorage(form.thumbnailUri, generateDailyVideoThumbnailPath(videoId), (progress) => {
        console.log(`Thumbnail upload progress: ${progress}%`)
      })
      setForm({ ...form, thumbnailUrl: url })
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'))
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'))
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.videoUrl) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.dailyVideosForm.errorFillTitleAndVideo'))
      return
    }

    try {
      setLoading(true)
      
      await createDailyVideo({
        ...form,
        createdAt: new Date(),
      })
      
      // Update daily insight last updated timestamp
      const { updateDailyInsightLastUpdated } = await import('../services/cardsService')
      await updateDailyInsightLastUpdated()
      
      Alert.alert(t('admin.lessonsForm.success'), t('admin.dailyVideosForm.videoAdded'))
      
      setForm({
        title: t('admin.dailyVideosForm.videoTitlePlaceholder'),
        description: '',
        videoUri: null,
        videoUrl: null,
        thumbnailUri: null,
        thumbnailUrl: null,
      })
      await loadVideos()
    } catch (error) {
      console.error('Error saving video:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.dailyVideosForm.errorSavingVideo'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (video) => {
    Alert.alert(
      t('admin.dailyVideosForm.deleteVideoTitle'),
      t('admin.dailyVideosForm.deleteVideoMessage', { title: video.title }),
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.lessonsForm.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteDailyVideo(video.id)
              
              // Update daily insight last updated timestamp
              const { updateDailyInsightLastUpdated } = await import('../services/cardsService')
              await updateDailyInsightLastUpdated()
              
              Alert.alert(t('admin.lessonsForm.success'), t('admin.dailyVideosForm.videoDeleted'))
              await loadVideos()
            } catch (error) {
              console.error('Error deleting video:', error)
              Alert.alert(t('admin.lessonsForm.error'), t('admin.dailyVideosForm.errorDeletingVideo'))
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{t('admin.dailyVideosForm.title')}</Text>
      <Text style={styles.formDesc}>
        {t('admin.dailyVideosForm.description')}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.dailyVideosForm.videoTitle')}</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder={t('admin.dailyVideosForm.videoTitlePlaceholder')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.dailyVideosForm.descriptionOptional')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={text => setForm({...form, description: text})}
          placeholder={t('admin.dailyVideosForm.descriptionPlaceholder')}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.dailyVideosForm.videoFile')}</Text>
        {form.videoUrl && (
          <View style={styles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.uploadedText}>{t('admin.dailyVideosForm.videoFileUploaded')}</Text>
          </View>
        )}
        {/* Video Preview */}
        {(form.videoUri || form.videoUrl) && (
          <View style={styles.videoPreview}>
            <Video
              source={{ uri: form.videoUrl || form.videoUri }}
              style={styles.previewVideo}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
            />
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickVideo}
            disabled={uploading}
          >
            <Ionicons name="videocam-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.videoUri ? t('admin.podcastsForm.selectAnotherFile') : t('admin.dailyVideosForm.selectVideoFile')}
            </Text>
          </Pressable>
          {form.videoUri && !form.videoUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadVideo}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? `${t('admin.cardsForm.uploading')} ${uploadProgress.toFixed(0)}%` : t('admin.dailyVideosForm.uploadVideo')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.dailyVideosForm.thumbnailOptional')}</Text>
        {form.thumbnailUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.thumbnailUri }} style={styles.previewImage} />
            {form.thumbnailUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickThumbnail}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {form.thumbnailUri ? t('admin.cardsForm.selectAnotherImage') : t('admin.dailyVideosForm.selectThumbnail')}
            </Text>
          </Pressable>
          {form.thumbnailUri && !form.thumbnailUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadThumbnail}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.cardsForm.uploading') : t('admin.dailyVideosForm.uploadImage')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
        )}
        <Text style={styles.submitButtonText}>
          {t('admin.dailyVideosForm.addVideo')}
        </Text>
      </Pressable>

      {/* Existing Videos List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.dailyVideosForm.existingVideos', { count: videos.length })}</Text>
        {loading && videos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>{t('admin.dailyVideosForm.loadingVideos')}</Text>
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>{t('admin.dailyVideosForm.noVideos')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {videos.map((video) => {
              const createdAt = video.createdAt ? video.createdAt.toDate() : new Date()
              const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
              const hoursLeft = Math.round((expiresAt - new Date()) / (1000 * 60 * 60))
              
              return (
                <View key={video.id} style={styles.lessonItem}>
                  <View style={styles.lessonItemContent}>
                    <Text style={styles.lessonItemTitle}>{video.title}</Text>
                    {hoursLeft > 0 && (
                      <Text style={styles.alertItemExpiry}>
                        {t('admin.dailyVideosForm.expiresIn', { hoursLeft })}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(video)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

// ========== INSTITUTIONS FORM ========== 
function InstitutionsForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    kindergarten: {
      title: t('admin.institutionsForm.kindergartenTitle'),
      description: t('admin.institutionsForm.kindergartenDescription'),
      imageUrl: null,
      imageUri: null,
    },
    talmudTorah: {
      title: t('admin.institutionsForm.talmudTorahTitle'),
      description: t('admin.institutionsForm.talmudTorahDescription'),
      imageUrl: null,
      imageUri: null,
    },
    girlsSchool: {
      title: t('admin.institutionsForm.girlsSchoolTitle'),
      description: t('admin.institutionsForm.girlsSchoolDescription'),
      imageUrl: null,
      imageUri: null,
    },
    smallYeshiva: {
      title: t('admin.institutionsForm.smallYeshivaTitle'),
      description: t('admin.institutionsForm.smallYeshivaDescription'),
      imageUrl: null,
      imageUri: null,
    },
    largeYeshiva: {
      title: t('admin.institutionsForm.largeYeshivaTitle'),
      description: t('admin.institutionsForm.largeYeshivaDescription'),
      imageUrl: null,
      imageUri: null,
    },
    kollel: {
      title: t('admin.institutionsForm.kollelTitle'),
      description: t('admin.institutionsForm.kollelDescription'),
      imageUrl: null,
      imageUri: null,
    },
    womenLessons: {
      title: t('admin.institutionsForm.womenLessonsTitle'),
      description: t('admin.institutionsForm.womenLessonsDescription'),
      imageUrl: null,
      imageUri: null,
    },
    communityActivities: {
      title: t('admin.institutionsForm.communityActivitiesTitle'),
      description: t('admin.institutionsForm.communityActivitiesDescription'),
      imageUrl: null,
      imageUri: null,
    },
    youthClub: {
      title: t('admin.institutionsForm.youthClubTitle'),
      description: t('admin.institutionsForm.youthClubDescription'),
      imageUrl: null,
      imageUri: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeInstitution, setActiveInstitution] = useState('kindergarten');

  useEffect(() => {
    loadInstitutionContent();
  }, [activeInstitution]);

  const loadInstitutionContent = async () => {
    try {
      setLoading(true);
      const content = await getInstitutionContent(activeInstitution);
      if (content) {
        setForm(prev => ({
          ...prev,
          [activeInstitution]: {
            ...prev[activeInstitution],
            title: content.title || prev[activeInstitution].title,
            description: content.description || prev[activeInstitution].description,
            imageUrl: content.imageUrl || null,
          }
        }));
      }
    } catch (error) {
      console.error('Error loading institution content:', error);
      Alert.alert(t('admin.lessonsForm.error'), t('admin.institutionsForm.errorLoadingContent'));
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const image = await pickImage({ aspect: [16, 9] });
    if (image) {
      setForm(prev => ({
        ...prev,
        [activeInstitution]: {
          ...prev[activeInstitution],
          imageUri: image.uri,
        }
      }));
    }
  };

  const handleUploadImage = async () => {
    const currentInstitution = form[activeInstitution];
    if (!currentInstitution.imageUri) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorSelectImage'));
      return;
    }

    setUploading(true);
    try {
      const path = generateStoragePath(`institutions/${activeInstitution}/image.jpg`);
      const url = await uploadImageToStorage(currentInstitution.imageUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      setForm(prev => ({
        ...prev,
        [activeInstitution]: {
          ...prev[activeInstitution],
          imageUrl: url,
        }
      }));
      Alert.alert(t('admin.lessonsForm.success'), t('admin.cardsForm.imageUploaded'));
    } catch (error) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.cardsForm.errorUploadingImage'));
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const currentInstitution = form[activeInstitution];
    if (!currentInstitution.title || !currentInstitution.description) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.alertsForm.errorFillAllFields'));
      return;
    }
    if (currentInstitution.imageUri && !currentInstitution.imageUrl) {
      Alert.alert(t('admin.cardsForm.notice'), t('admin.cardsForm.errorUploadImage'));
      return;
    }

    try {
      setLoading(true);
      await saveInstitutionContent(activeInstitution, {
        title: currentInstitution.title,
        description: currentInstitution.description,
        imageUrl: currentInstitution.imageUrl,
      });
      
      // Reload the content to ensure we have the latest data
      await loadInstitutionContent();
      
      Alert.alert(t('admin.lessonsForm.success'), t('admin.institutionsForm.contentUpdated'));
    } catch (error) {
      console.error('Error saving institution content:', error);
      Alert.alert(t('admin.lessonsForm.error'), t('admin.institutionsForm.errorSavingContent'));
    } finally {
      setLoading(false);
    }
  };

  const institutionOptions = [
    { id: 'kindergarten', label: t('admin.institutionsForm.kindergarten') },
    { id: 'talmudTorah', label: t('admin.institutionsForm.talmudTorah') },
    { id: 'girlsSchool', label: t('admin.institutionsForm.girlsSchool') },
    { id: 'smallYeshiva', label: t('admin.institutionsForm.smallYeshiva') },
    { id: 'largeYeshiva', label: t('admin.institutionsForm.largeYeshiva') },
    { id: 'kollel', label: t('admin.institutionsForm.kollel') },
    { id: 'womenLessons', label: t('admin.institutionsForm.womenLessons') },
    { id: 'communityActivities', label: t('admin.institutionsForm.communityActivities') },
    { id: 'youthClub', label: t('admin.institutionsForm.youthClub') },
  ];

  const currentInstitution = form[activeInstitution];

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{t('admin.institutionsForm.title')}</Text>
      <Text style={styles.formDesc}>{t('admin.institutionsForm.description')}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.institutionsForm.selectInstitution')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {institutionOptions.map(option => (
            <Pressable
              key={option.id}
              style={[styles.categoryPill, activeInstitution === option.id && styles.categoryPillActive]}
              onPress={() => setActiveInstitution(option.id)}
            >
              <Text style={[styles.categoryPillText, activeInstitution === option.id && styles.categoryPillTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.institutionsForm.institutionTitle')}</Text>
        <TextInput
          style={styles.input}
          value={currentInstitution.title}
          onChangeText={text => setForm(prev => ({
            ...prev,
            [activeInstitution]: { ...prev[activeInstitution], title: text }
          }))}
          placeholder={t('admin.institutionsForm.institutionTitlePlaceholder')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.institutionsForm.institutionDescription')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={currentInstitution.description}
          onChangeText={text => setForm(prev => ({
            ...prev,
            [activeInstitution]: { ...prev[activeInstitution], description: text }
          }))}
          placeholder={t('admin.institutionsForm.institutionDescriptionPlaceholder')}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('admin.institutionsForm.institutionImage')}</Text>
        {currentInstitution.imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: currentInstitution.imageUri }} style={styles.previewImage} />
            {currentInstitution.imageUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>{t('admin.cardsForm.uploaded')}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.uploadSection}>
          <Pressable
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={uploading}
          >
            <Ionicons name="image-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.uploadButtonText}>
              {currentInstitution.imageUri ? t('admin.cardsForm.selectAnotherImage') : t('admin.institutionsForm.selectImage')}
            </Text>
          </Pressable>
          {currentInstitution.imageUri && !currentInstitution.imageUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PRIMARY_RED} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? t('admin.cardsForm.uploading') : t('admin.cardsForm.uploadImage')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>{t('admin.cardsForm.saveChanges')}</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.note}>
        {t('admin.institutionsForm.note')}
      </Text>
    </View>
  );
}

// ========== DEBUG FORM ========== 
function DebugForm({ navigation }) {
  const { t } = useTranslation();
  const [showClearDataOptions, setShowClearDataOptions] = useState(false);

  const handleClearConsent = async () => {
    Alert.alert(
      t('admin.debugForm.clearConsentTitle'),
      t('admin.debugForm.clearConsentMessage'),
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.debugForm.clear'),
          style: 'destructive',
          onPress: async () => {
            await clearConsent();
            Alert.alert(t('admin.lessonsForm.success'), t('admin.debugForm.consentCleared'));
            navigation.navigate('TermsAndConsent');
          }
        }
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      t('admin.debugForm.clearAllDataTitle'),
      t('admin.debugForm.clearAllDataMessage'),
      [
        { text: t('admin.lessonsForm.cancel'), style: 'cancel' },
        {
          text: t('admin.debugForm.clear'),
          style: 'destructive',
          onPress: async () => {
            await clearAllAppData();
            Alert.alert(t('admin.lessonsForm.success'), t('admin.debugForm.allDataCleared'));
            navigation.navigate('TermsAndConsent');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{t('admin.debugForm.title')}</Text>
      <Text style={styles.formDesc}>{t('admin.debugForm.description')}</Text>

      <Pressable style={styles.debugButton} onPress={() => setShowClearDataOptions(prev => !prev)}>
        <Ionicons name="trash-outline" size={20} color={PRIMARY_RED} />
        <Text style={styles.debugButtonText}>{t('admin.debugForm.clearAppData')}</Text>
      </Pressable>

      {showClearDataOptions && (
        <View style={styles.clearDataOptions}>
          <Pressable style={styles.clearDataButton} onPress={handleClearConsent}>
            <Text style={styles.clearDataButtonText}>{t('admin.debugForm.clearConsent')}</Text>
          </Pressable>
          <Pressable style={styles.clearDataButton} onPress={handleClearAllData}>
            <Text style={styles.clearDataButtonText}>{t('admin.debugForm.clearAll')}</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.note}>{t('admin.debugForm.note')}</Text>
    </View>
  );
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
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 10,
  },
  tabs: {
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f3f4f6',
  },
  tabActive: {
    backgroundColor: PRIMARY_RED,
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formContainer: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    marginBottom: 10,
    textAlign: 'right',
  },
  formDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginBottom: 15,
    textAlign: 'right',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: PRIMARY_RED,
  },
  categoryPillText: {
    marginLeft: 5,
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  categoryPillTextActive: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_RED,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 10,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: PRIMARY_RED,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
  },
  lessonsList: {
    maxHeight: 300,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  flyerPreviewThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  flyerPreviewPdf: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  flyerPreviewPdfText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  lessonItemContent: {
    flex: 1,
  },
  lessonItemTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  lessonItemCategory: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
  },
  lessonItemDate: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#9ca3af',
    textAlign: 'right',
  },
  lessonItemActions: {
    flexDirection: 'row',
    gap: 5,
  },
  postsList: {
    maxHeight: 400,
  },
  postItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  postItemContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  postItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  postItemText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  postItemTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 4,
  },
  postItemSummary: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    marginBottom: 6,
  },
  postItemMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inactiveBadge: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#dc2626',
    backgroundColor: 'rgba(220,38,38,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  postItemActions: {
    flexDirection: 'row',
    gap: 5,
    marginLeft: 8,
  },
  actionButton: {
    padding: 5,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cancelEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cancelEditText: {
    color: PRIMARY_RED,
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    minWidth: 70,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    minWidth: 70,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  alertItemActions: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  viewLibraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: 10,
  },
  viewLibraryText: {
    color: PRIMARY_RED,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
    justifyContent: 'flex-end',
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  radioButtonActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  radioText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  radioTextActive: {
    color: '#fff',
  },
  checkboxGroup: {
    marginTop: 5,
    alignItems: 'flex-end',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'left',
    marginTop: 5,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  alertItemContent: {
    flex: 1,
  },
  alertItemTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  alertItemMessage: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
  },
  alertItemMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  alertItemType: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: PRIMARY_RED,
  },
  alertItemExpiry: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#9ca3af',
  },
  alertItemDate: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  note: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'right',
    lineHeight: 18,
  },
  uploadSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  uploadButtonActive: {
    backgroundColor: PRIMARY_RED + '15',
    borderColor: PRIMARY_RED,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: DEEP_BLUE,
  },
  imagePreview: {
    marginTop: 10,
    alignItems: 'flex-end',
    position: 'relative',
  },
  videoPreview: {
    marginTop: 10,
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#f3f4f6',
  },
  youtubeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  youtubeBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#1f2937',
  },
  uploadedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22,163,74,0.9)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  uploadedText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 5,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(22,163,74,0.1)',
    borderRadius: 8,
  },
  successText: {
    color: '#16a34a',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 10,
    textAlign: 'right',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  dateInput: {
    flex: 1,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  todayButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: PRIMARY_RED,
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 5,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  debugButtonText: {
    color: PRIMARY_RED,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 10,
  },
  clearDataOptions: {
    marginTop: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  clearDataButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  clearDataButtonText: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
});