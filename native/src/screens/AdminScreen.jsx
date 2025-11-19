import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, Image, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { sendLocalNotification, scheduleNotification } from '../utils/notifications'
import { pickImage, pickVideo, uploadImageToStorage, uploadVideoToStorage, generateStoragePath, generateCardImagePath, generateNewsImagePath, generateDailyVideoPath, generateDailyVideoThumbnailPath } from '../utils/storage'
import { addLesson, getLessons, updateLesson, deleteLesson } from '../services/lessonsService'
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../services/alertsService'
import { getCard, updateCard, getAppConfig, updateAppConfig } from '../services/cardsService'
import { createNews, getNews, updateNews, deleteNews } from '../services/newsService'
import { getInstitutionContent, saveInstitutionContent } from '../services/institutionsService'
import { createPodcast, getAllPodcasts, updatePodcast, deletePodcast, uploadPodcastAudio, uploadPodcastThumbnail } from '../services/podcastsService'
import { createDailyVideo, getDailyVideos, deleteDailyVideo, cleanupExpiredVideos } from '../services/dailyVideosService'
import { clearConsent, clearAllAppData } from '../utils/storage'

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
    { id: 'cards', label: t('admin.cards'), icon: 'albums-outline' },
    { id: 'news', label: t('admin.news'), icon: 'newspaper-outline' },
    { id: 'podcasts', label: t('admin.podcasts'), icon: 'headset-outline' },
    { id: 'daily-videos', label: t('admin.dailyVideos'), icon: 'videocam-outline' },
    { id: 'institutions', label: t('admin.institutions'), icon: 'business-outline' },
    { id: 'debug', label: 'Debug', icon: 'bug-outline' },
  ]

  // Update tab if route params change
  React.useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab)
    }
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'lessons' && <LessonsForm navigation={navigation} />}
        {activeTab === 'alerts' && <AlertsForm />}
        {activeTab === 'cards' && <CardsForm />}
        {activeTab === 'news' && <NewsForm />}
        {activeTab === 'podcasts' && <PodcastsForm />}
        {activeTab === 'daily-videos' && <DailyVideosForm />}
        {activeTab === 'institutions' && <InstitutionsForm />}
        {activeTab === 'debug' && <DebugForm navigation={navigation} />}
      </ScrollView>
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
  })
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
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
      const allLessons = await getLessons(filterCategory)
      setLessons(allLessons)
    } catch (error) {
      console.error('Error loading lessons:', error)
      Alert.alert(t('admin.lessonsForm.error'), t('admin.lessonsForm.errorLoadingLessons'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.url) {
      Alert.alert(t('admin.lessonsForm.error'), t('admin.lessonsForm.errorFillFields'))
      return
    }

    try {
      setLoading(true)
      
      if (editingLesson) {
        // Update existing lesson
        await updateLesson(editingLesson.id, form)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.lessonsForm.lessonUpdated'))
        setEditingLesson(null)
      } else {
        // Add new lesson
        await addLesson(form)
        Alert.alert(t('admin.lessonsForm.success'), t('admin.lessonsForm.lessonAdded'))
      }
      
      // Reset form and reload
      setForm({
        category: 'emuna',
        title: '',
        date: '',
        videoId: '',
        url: '',
      })
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
    })
  }

  const handleDelete = (lesson) => {
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
    })
  }

  const extractVideoId = (url) => {
    // Extract YouTube video ID from URL
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (match && match[1]) {
      setForm({...form, videoId: match[1], url})
    } else {
      setForm({...form, url})
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
  const [form, setForm] = useState({
    title: 'תזכורת יומית',
    type: 'reminder',
    message: 'זריקת אמונה יומית - כאייל תערוג',
    priority: 'medium',
    sendType: 'immediate', // immediate, scheduled
    scheduledTime: new Date().toISOString().slice(0, 16),
    targetAudience: ['all']
  })
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const allAlerts = await getAlerts(true)
      setAlerts(allAlerts)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.message) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים')
      return
    }

    try {
      setLoading(true)

      // Calculate expiration time (24 hours from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      // Save to Firestore
      const alertData = {
        title: form.title,
        type: form.type,
        message: form.message,
        priority: form.priority,
        sendType: form.sendType,
        scheduledTime: form.sendType === 'scheduled' ? new Date(form.scheduledTime).toISOString() : null,
        targetAudience: form.targetAudience,
        isActive: true,
        expiresAt: expiresAt.toISOString(),
        sentAt: form.sendType === 'immediate' ? new Date().toISOString() : null
      }

      const alertId = await createAlert(alertData)

      // Send push notification
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
          'הצלחה! 🎉',
          `התראה נשלחה ונשמרה ב-Firestore!\nהתראה תימחק אוטומטית אחרי 24 שעות.`
        )
      } else {
        const triggerDate = new Date(form.scheduledTime)
        await scheduleNotification({
          ...notification,
          triggerDate
        })
        Alert.alert(
          'הצלחה! ⏰',
          `התראה מתוזמנת נשמרה ב-Firestore!\nתישלח ב-${triggerDate.toLocaleString('he-IL')}`
        )
      }

      // Reset form
      setForm({
        title: 'תזכורת יומית',
        type: 'reminder',
        message: 'זריקת אמונה יומית - כאייל תערוג',
        priority: 'medium',
        sendType: 'immediate',
        scheduledTime: new Date().toISOString().slice(0, 16),
        targetAudience: ['all']
      })

      await loadAlerts()
    } catch (error) {
      console.error('Error creating alert:', error)
      Alert.alert('שגיאה', 'לא ניתן ליצור את ההתראה')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (alert) => {
    Alert.alert(
      'מחיקת התראה',
      `האם אתה בטוח שברצונך למחוק את ההתראה "${alert.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteAlert(alert.id)
              Alert.alert('הצלחה!', 'ההתראה נמחקה')
              await loadAlerts()
            } catch (error) {
              console.error('Error deleting alert:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את ההתראה')
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
      <Text style={styles.formTitle}>📱 יצירת תזכורת/פוש יומי</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כותרת התזכורת</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="תזכורת יומית"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>סוג התראה</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'reminder', label: '⏰ תזכורת יומית', color: PRIMARY_RED },
            { value: 'push', label: '🔔 פוש יומי', color: PRIMARY_GOLD },
            { value: 'announcement', label: '📢 הודעה חשובה', color: '#16a34a' }
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
        <Text style={styles.label}>סוג שליחה</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'immediate', label: '⚡ שליחה מיידית', color: PRIMARY_RED },
            { value: 'scheduled', label: '⏰ תזמון למועד', color: PRIMARY_GOLD }
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
          <Text style={styles.label}>תאריך ושעה</Text>
          <TextInput
            style={styles.input}
            value={form.scheduledTime}
            onChangeText={text => setForm({...form, scheduledTime: text})}
            placeholder="2024-01-01T08:00"
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>הודעה (80-120 תווים)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.message}
          onChangeText={text => setForm({...form, message: text})}
          placeholder="הודעה קצרה על ההתראה..."
          multiline
          numberOfLines={3}
          maxLength={120}
        />
        <Text style={styles.charCount}>{form.message.length}/120</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>עדיפות</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'high', label: '🔥 דחוף', color: '#dc2626' },
            { value: 'medium', label: '⚡ בינוני', color: '#f59e0b' },
            { value: 'low', label: '💡 נמוך', color: '#6b7280' }
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
        <Text style={styles.label}>קהל יעד</Text>
        <View style={styles.checkboxGroup}>
          {[
            { value: 'all', label: 'כל המשתמשים' },
            { value: 'registered', label: 'משתמשים רשומים בלבד' }
          ].map(option => (
            <Pressable
              key={option.value}
              style={styles.checkbox}
              onPress={() => {
                if (form.targetAudience.includes(option.value)) {
                  setForm({...form, targetAudience: form.targetAudience.filter(a => a !== option.value)})
                } else {
                  setForm({...form, targetAudience: [...form.targetAudience, option.value]})
                }
              }}
            >
              <View style={[styles.checkboxBox, form.targetAudience.includes(option.value) && styles.checkboxBoxChecked]}>
                {form.targetAudience.includes(option.value) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{option.label}</Text>
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
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>שלח התראה + Push</Text>
          </>
        )}
      </Pressable>

      {/* Existing Alerts List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>התראות פעילות ({alerts.length})</Text>
        {loading && alerts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען התראות...</Text>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין התראות פעילות</Text>
          </View>
        ) : (
          <ScrollView style={styles.alertsList}>
            {alerts.map((alert) => {
              const expiresAt = alert.expiresAt ? new Date(alert.expiresAt) : null
              const hoursLeft = expiresAt ? Math.round((expiresAt - new Date()) / (1000 * 60 * 60)) : null
              
              return (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertItemContent}>
                    <Text style={styles.alertItemTitle}>{alert.title}</Text>
                    <Text style={styles.alertItemMessage}>{alert.message}</Text>
                    <View style={styles.alertItemMeta}>
                      <Text style={styles.alertItemType}>
                        {alert.type === 'reminder' ? '⏰ תזכורת' : alert.type === 'push' ? '🔔 פוש' : '📢 הודעה'}
                      </Text>
                      {hoursLeft !== null && hoursLeft > 0 && (
                        <Text style={styles.alertItemExpiry}>
                          יימחק בעוד {hoursLeft} שעות
                        </Text>
                      )}
                    </View>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(alert)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>

      <Text style={styles.note}>
        💡 התראות נשמרות ב-Firestore, נשלחות כ-Push, ומופיעות במסך הבית. התראות נמחקות אוטומטית אחרי 24 שעות.
      </Text>
    </View>
  )
}

// ========== COURSES FORM ==========
function CoursesForm() {
  const [form, setForm] = useState({
    title: 'ניגון ראשון',
    level: 'Beginner',
    duration: '6 פרקים • 3.5 שעות',
    description: 'מבוא למס��ר ממושמע — הגדרת מטרות, ניהול סיכונים ובניית שגרה יומית.',
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
  const [form, setForm] = useState({
    key: 'daily-insight',
    title: 'ערך יומי',
    desc: 'תובנה מעוררת השראה ליום שלך',
    icon: 'bulb-outline',
    locked: false,
    headerTitle: 'הרב אייל עמרמי',
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
      Alert.alert('שגיאה', 'אנא בחר תמונה תחילה')
      return
    }

    setUploading(true)
    try {
      const path = generateCardImagePath(form.key, 'card-image.jpg')
      const url = await uploadImageToStorage(form.imageUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url })
      Alert.alert('הצלחה!', 'התמונה הועלתה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את התמונה')
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
          title: card.title || prev.title,
          desc: card.desc || prev.desc,
          icon: card.icon || prev.icon,
          locked: card.locked || false,
          imageUrl: card.imageUrl || null,
        }))
      }
      
      // Load header config
      const config = await getAppConfig()
      if (config) {
        setForm(prev => ({
          ...prev,
          headerTitle: config.title || prev.headerTitle,
          headerSubtitle: config.subtitle || prev.headerSubtitle,
        }))
      }
    } catch (error) {
      console.error('Error loading card data:', error)
    }
  }

  const handleSubmit = async () => {
    if (form.imageUri && !form.imageUrl) {
      Alert.alert('שים לב', 'אנא העלה את התמונה לפני השמירה')
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
        'הצלחה! 🎴',
        `כרטיס "${form.title}" עודכן בהצלחה!\nכותרת ראשית עודכנה גם כן.`
      )
    } catch (error) {
      console.error('Error updating card:', error)
      Alert.alert('שגיאה', 'לא ניתן לעדכן את הכרטיס')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>🎴 עריכת כרטיסיות ראשיות</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>בחר כרטיס</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'daily-insight', label: 'ערך יומי' },
            { value: 'community', label: 'קהילה' },
            { value: 'books', label: 'ספרים' },
            { value: 'institutions', label: 'מוסדות הרב' },
            { value: 'live-alerts', label: 'התראות חמות' }
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
        <Text style={styles.label}>כותרת הכרטיס</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="ערך יומי"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תיאור</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.desc}
          onChangeText={text => setForm({...form, desc: text})}
          placeholder="תובנה מעוררת השראה ליום שלך"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>אייקון (Ionicons name)</Text>
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
          <Text style={styles.checkboxLabel}>🔒 כרטיס נעול (רק למשתמשים רשומים)</Text>
        </Pressable>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תמונת רקע</Text>
        {form.imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
            {form.imageUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>הועלה</Text>
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
              {form.imageUri ? 'בחר תמונה אחרת' : 'בחר תמונת רקע'}
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

      <View style={styles.separator} />

      <Text style={styles.sectionSubtitle}>כותרת ראשית מעל הכרטיסיות</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כותרת ראשית (Header)</Text>
        <TextInput
          style={styles.input}
          value={form.headerTitle}
          onChangeText={text => setForm({...form, headerTitle: text})}
          placeholder="הרב אייל עמרמי"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כתובית משנה (Subtitle)</Text>
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
            <Text style={styles.submitButtonText}>שמור שינויים</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.note}>
        💡 שינויים נשמרים ב-Firestore ומופיעים מיידית. התמונות נשמרות ב-Firebase Storage.
      </Text>
    </View>
  )
}

// ========== RECOMMENDATIONS FORM ==========
function RecommendationsForm() {
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
  const [form, setForm] = useState({
    title: 'השוק בתנודתיות גבוהה',
    category: 'chidushim',
    content: 'המדדים הראשיים נסחרים בתנודתיות גבוהה...',
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
      Alert.alert('שגיאה', 'אנא בחר תמונה תחילה')
      return
    }

    setUploading(true)
    try {
      const path = generateNewsImagePath(Date.now().toString(), 'news-image.jpg')
      const url = await uploadImageToStorage(form.imageUri, path, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })
      setForm({ ...form, imageUrl: url })
      Alert.alert('הצלחה!', 'התמונה הועלתה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את התמונה')
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
      setNews(allNews)
    } catch (error) {
      console.error('Error loading news:', error)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים')
      return
    }

    if (form.imageUri && !form.imageUrl) {
      Alert.alert('שים לב', 'אנא העלה את התמונה לפני הפרסום')
      return
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
        title: form.title,
        category: form.category,
        content: form.content,
        imageUrl: form.imageUrl || null,
        isPublished: true,
        publishedAt: publishedAt || new Date(), // Use custom date or current date
      }

      if (editingNews) {
        await updateNews(editingNews.id, newsData)
        Alert.alert('הצלחה! 📰', 'חדשה עודכנה בהצלחה!')
      } else {
        await createNews(newsData)
        Alert.alert('הצלחה! 📰', 'חדשה פורסמה בהצלחה!')
      }

      // Reset form
      setForm({
        title: '',
        category: 'chidushim',
        content: '',
        imageUri: null,
        imageUrl: null,
        customDate: null,
      })
      setEditingNews(null)
      await loadNews()
    } catch (error) {
      console.error('Error saving news:', error)
      Alert.alert('שגיאה', 'לא ניתן לפרסם את החדשה')
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
      category: newsItem.category || 'chidushim',
      content: newsItem.content,
      imageUri: null,
      imageUrl: newsItem.imageUrl || null,
      customDate: dateStr,
    })
  }

  const handleDelete = (newsItem) => {
    Alert.alert(
      'מחיקת חדשה',
      `האם אתה בטוח שברצונך למחוק את החדשה "${newsItem.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteNews(newsItem.id)
              Alert.alert('הצלחה!', 'החדשה נמחקה')
              await loadNews()
            } catch (error) {
              console.error('Error deleting news:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את החדשה')
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
      category: 'chidushim',
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
      <Text style={styles.formTitle}>📰 פרסום חדשה</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קטגוריה</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'chidushim', label: '💡 חידושים' },
            { value: 'crypto', label: '₿ קריפטו' },
            { value: 'education', label: '📚 לימוד' }
          ].map(option => (
            <Pressable
              key={option.value}
              style={[styles.radioButton, form.category === option.value && styles.radioButtonActive]}
              onPress={() => setForm({...form, category: option.value})}
            >
              <Text style={[styles.radioText, form.category === option.value && styles.radioTextActive]}>
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
        <Text style={styles.label}>תוכן</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.content}
          onChangeText={text => setForm({...form, content: text})}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תאריך פרסום (אופציונלי)</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={form.customDate || ''}
            onChangeText={text => setForm({...form, customDate: text})}
            placeholder="DD/MM/YYYY (למשל: 25/12/2024)"
            placeholderTextColor="#9ca3af"
          />
          <Pressable
            style={styles.todayButton}
            onPress={handleSetTodayDate}
          >
            <Ionicons name="calendar-outline" size={18} color={PRIMARY_RED} />
            <Text style={styles.todayButtonText}>היום</Text>
          </Pressable>
        </View>
        <Text style={styles.helperText}>השאר ריק לשימוש בתאריך הנוכחי</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תמונה</Text>
        {form.imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.imageUri }} style={styles.previewImage} />
            {form.imageUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>הועלה</Text>
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
          <>
            <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
            <Ionicons name={editingNews ? "checkmark-circle" : "newspaper"} size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {editingNews ? 'עדכן חדשה' : 'פרסם חדשה'}
            </Text>
          </>
        )}
      </Pressable>

      {editingNews && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>ביטול עריכה</Text>
        </Pressable>
      )}

      {/* Existing News List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>חדשות קיימות ({news.length})</Text>
        {loading && news.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען חדשות...</Text>
          </View>
        ) : news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין חדשות</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {news.map((newsItem) => (
              <View key={newsItem.id} style={styles.lessonItem}>
                <View style={styles.lessonItemContent}>
                  <Text style={styles.lessonItemTitle}>{newsItem.title}</Text>
                  <Text style={styles.lessonItemCategory}>
                    {newsItem.category === 'chidushim' ? '💡 חידושים' : 
                     newsItem.category === 'crypto' ? '₿ קריפטו' : '📚 לימוד'}
                  </Text>
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

// ========== PODCASTS FORM ==========
function PodcastsForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    audioUri: null,
    audioUrl: null,
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
      setPodcasts(allPodcasts)
    } catch (error) {
      console.error('Error loading podcasts:', error)
      Alert.alert('שגיאה', 'לא ניתן לטעון את הפודקאסטים')
    } finally {
      setLoading(false)
    }
  }

  const handlePickAudio = async () => {
    const { pickImage } = await import('../utils/storage')
    // Note: For audio, you might want to use a different picker
    // For now, using image picker as placeholder
    Alert.alert('בקרוב', 'בחירת קובץ אודיו תתווסף בקרוב')
  }

  const handlePickThumbnail = async () => {
    const { pickImage } = await import('../utils/storage')
    const image = await pickImage({ aspect: [1, 1] })
    if (image) {
      setForm({ ...form, thumbnailUri: image.uri })
    }
  }

  const handleUploadAudio = async () => {
    if (!form.audioUri) {
      Alert.alert('שגיאה', 'אנא בחר קובץ אודיו תחילה')
      return
    }

    setUploading(true)
    try {
      const podcastId = editingPodcast?.id || 'temp-' + Date.now()
      const url = await uploadPodcastAudio(form.audioUri, podcastId, (progress) => {
        console.log(`Audio upload progress: ${progress}%`)
      })
      setForm({ ...form, audioUrl: url })
      Alert.alert('הצלחה!', 'קובץ האודיו הועלה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את קובץ האודיו')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadThumbnail = async () => {
    if (!form.thumbnailUri) {
      Alert.alert('שגיאה', 'אנא בחר תמונה תחילה')
      return
    }

    setUploading(true)
    try {
      const podcastId = editingPodcast?.id || 'temp-' + Date.now()
      const url = await uploadPodcastThumbnail(form.thumbnailUri, podcastId, (progress) => {
        console.log(`Thumbnail upload progress: ${progress}%`)
      })
      setForm({ ...form, thumbnailUrl: url })
      Alert.alert('הצלחה!', 'התמונה הועלתה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את התמונה')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.audioUrl) {
      Alert.alert('שגיאה', 'יש למלא כותרת ולהעלות קובץ אודיו')
      return
    }

    try {
      setLoading(true)
      
      if (editingPodcast) {
        await updatePodcast(editingPodcast.id, form)
        Alert.alert('הצלחה!', 'הפודקאסט עודכן בהצלחה')
        setEditingPodcast(null)
      } else {
        await createPodcast(form)
        Alert.alert('הצלחה!', 'הפודקאסט נוסף בהצלחה')
      }
      
      setForm({
        title: '',
        description: '',
        category: '',
        audioUri: null,
        audioUrl: null,
        thumbnailUri: null,
        thumbnailUrl: null,
        duration: 0,
        isActive: true,
      })
      await loadPodcasts()
    } catch (error) {
      console.error('Error saving podcast:', error)
      Alert.alert('שגיאה', 'לא ניתן לשמור את הפודקאסט')
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
      thumbnailUri: null,
      thumbnailUrl: podcast.thumbnailUrl || null,
      duration: podcast.duration || 0,
      isActive: podcast.isActive !== undefined ? podcast.isActive : true,
    })
  }

  const handleDelete = (podcast) => {
    Alert.alert(
      'מחיקת פודקאסט',
      `האם אתה בטוח שברצונך למחוק את הפודקאסט "${podcast.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deletePodcast(podcast.id)
              Alert.alert('הצלחה!', 'הפודקאסט נמחק בהצלחה')
              await loadPodcasts()
            } catch (error) {
              console.error('Error deleting podcast:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את הפודקאסט')
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
      thumbnailUri: null,
      thumbnailUrl: null,
      duration: 0,
      isActive: true,
    })
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>🎙️ ניהול פודקאסטים</Text>
      <Text style={styles.formDesc}>
        העלה קבצי אודיו (MP3, M4A) שיופיעו במסך הפודקאסטים. הקבצים יועלו ל-Firebase Storage.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כותרת הפודקאסט</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="פודקאסט 1"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תיאור (אופציונלי)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={text => setForm({...form, description: text})}
          placeholder="תיאור קצר של הפודקאסט..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קטגוריה (אופציונלי)</Text>
        <TextInput
          style={styles.input}
          value={form.category}
          onChangeText={text => setForm({...form, category: text})}
          placeholder="כללי"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קובץ אודיו</Text>
        {form.audioUrl && (
          <View style={styles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.uploadedText}>קובץ אודיו הועלה</Text>
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
              {form.audioUri ? 'בחר קובץ אחר' : 'בחר קובץ אודיו'}
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
                {uploading ? 'מעלה...' : 'העלה אודיו'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תמונת כריכה (אופציונלי)</Text>
        {form.thumbnailUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.thumbnailUri }} style={styles.previewImage} />
            {form.thumbnailUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>הועלה</Text>
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
              {form.thumbnailUri ? 'בחר תמונה אחרת' : 'בחר תמונת כריכה'}
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
                {uploading ? 'מעלה...' : 'העלה תמונה'}
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
          <Text style={styles.checkboxLabel}>✅ פודקאסט פעיל (יופיע למשתמשים)</Text>
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
          {editingPodcast ? 'עדכן פודקאסט' : 'הוסף פודקאסט'}
        </Text>
      </Pressable>

      {editingPodcast && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>ביטול עריכה</Text>
        </Pressable>
      )}

      {/* Existing Podcasts List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>פודקאסטים קיימים ({podcasts.length})</Text>
        {loading && podcasts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען פודקאסטים...</Text>
          </View>
        ) : podcasts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="headset-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין פודקאסטים</Text>
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
                      {podcast.isActive ? 'פעיל' : 'לא פעיל'}
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

// ========== DAILY VIDEOS FORM ==========
function DailyVideosForm() {
  const [form, setForm] = useState({
    title: 'זריקת אמונה יומית',
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
    // Clean up expired videos on mount
    cleanupExpiredVideos().catch(console.error)
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const allVideos = await getDailyVideos()
      setVideos(allVideos)
    } catch (error) {
      console.error('Error loading videos:', error)
      Alert.alert('שגיאה', 'לא ניתן לטעון את הסרטונים')
    } finally {
      setLoading(false)
    }
  }

  const handlePickVideo = async () => {
    const video = await pickVideo({ videoMaxDuration: 60 })
    if (video) {
      setForm({ ...form, videoUri: video.uri })
    }
  }

  const handlePickThumbnail = async () => {
    const image = await pickImage({ aspect: [16, 9] })
    if (image) {
      setForm({ ...form, thumbnailUri: image.uri })
    }
  }

  const handleUploadVideo = async () => {
    if (!form.videoUri) {
      Alert.alert('שגיאה', 'אנא בחר סרטון תחילה')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      const date = new Date()
      const path = generateDailyVideoPath(date, `video_${Date.now()}.mp4`)
      const url = await uploadVideoToStorage(form.videoUri, path, (progress) => {
        setUploadProgress(progress)
      })
      setForm({ ...form, videoUrl: url })
      Alert.alert('הצלחה!', 'הסרטון הועלה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את הסרטון')
      console.error(error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleUploadThumbnail = async () => {
    if (!form.thumbnailUri) {
      Alert.alert('שגיאה', 'אנא בחר תמונה תחילה')
      return
    }

    setUploading(true)
    try {
      const date = new Date()
      const path = generateDailyVideoThumbnailPath(date, `thumb_${Date.now()}.jpg`)
      const url = await uploadImageToStorage(form.thumbnailUri, path, (progress) => {
        console.log(`Thumbnail upload progress: ${progress}%`)
      })
      setForm({ ...form, thumbnailUrl: url })
      Alert.alert('הצלחה!', 'התמונה הועלתה בהצלחה')
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעלות את התמונה')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.videoUrl) {
      Alert.alert('שגיאה', 'אנא העלה סרטון לפני השמירה')
      return
    }

    try {
      setLoading(true)
      await createDailyVideo({
        title: form.title,
        description: form.description,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl,
      })
      
      Alert.alert('הצלחה! 🎬', 'סרטון יומי נוסף בהצלחה! הסרטון יופיע במסך זריקת אמונה וימחק אוטומטית אחרי 24 שעות.')
      
      // Reset form
      setForm({
        title: 'זריקת אמונה יומית',
        description: '',
        videoUri: null,
        videoUrl: null,
        thumbnailUri: null,
        thumbnailUrl: null,
      })
      
      await loadVideos()
    } catch (error) {
      console.error('Error creating video:', error)
      Alert.alert('שגיאה', 'לא ניתן לשמור את הסרטון')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (video) => {
    Alert.alert(
      'מחיקת סרטון',
      `האם אתה בטוח שברצונך למחוק את הסרטון "${video.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteDailyVideo(video.id)
              Alert.alert('הצלחה!', 'הסרטון נמחק')
              await loadVideos()
            } catch (error) {
              console.error('Error deleting video:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את הסרטון')
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
      <Text style={styles.formTitle}>🎬 ניהול סרטונים יומיים</Text>
      <Text style={styles.formDesc}>
        העלה סרטונים קצרים (עד 60 שניות) שיופיעו במסך זריקת אמונה. הסרטונים נמחקים אוטומטית אחרי 24 שעות.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>כותרת הסרטון</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="זריקת אמונה יומית"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תיאור (אופציונלי)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={text => setForm({...form, description: text})}
          placeholder="תיאור קצר של הסרטון..."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>סרטון (עד 60 שניות)</Text>
        {form.videoUri && (
          <View style={styles.videoPreview}>
            <Ionicons name="videocam" size={32} color={PRIMARY_RED} />
            <Text style={styles.previewText}>סרטון נבחר</Text>
            {form.videoUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>הועלה</Text>
              </View>
            )}
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
              {form.videoUri ? 'בחר סרטון אחר' : 'בחר סרטון'}
            </Text>
          </Pressable>
          {form.videoUri && !form.videoUrl && (
            <Pressable
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUploadVideo}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <ActivityIndicator color={PRIMARY_RED} />
                  <Text style={styles.uploadButtonText}>
                    מעלה... {Math.round(uploadProgress)}%
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={24} color={PRIMARY_RED} />
                  <Text style={styles.uploadButtonText}>העלה סרטון</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תמונת תצוגה מקדימה (אופציונלי)</Text>
        {form.thumbnailUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: form.thumbnailUri }} style={styles.previewImage} />
            {form.thumbnailUrl && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text style={styles.uploadedText}>הועלה</Text>
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
              {form.thumbnailUri ? 'בחר תמונה אחרת' : 'בחר תמונת תצוגה'}
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
                {uploading ? 'מעלה...' : 'העלה תמונה'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable 
        style={[styles.submitButton, (loading || !form.videoUrl) && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading || !form.videoUrl}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={styles.submitButtonText}>הוסף סרטון יומי</Text>
          </>
        )}
      </Pressable>

      {/* Existing Videos List */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>סרטונים פעילים ({videos.length})</Text>
        {loading && videos.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען סרטונים...</Text>
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין סרטונים פעילים</Text>
          </View>
        ) : (
          <ScrollView style={styles.lessonsList}>
            {videos.map((video) => {
              const createdAt = video.createdAt?.toDate ? video.createdAt.toDate() : new Date(video.createdAt)
              const hoursLeft = Math.round((24 * 60 * 60 * 1000 - (Date.now() - createdAt.getTime())) / (1000 * 60 * 60))
              
              return (
                <View key={video.id} style={styles.lessonItem}>
                  <View style={styles.lessonItemContent}>
                    <Text style={styles.lessonItemTitle}>{video.title}</Text>
                    {video.description && (
                      <Text style={styles.lessonItemCategory} numberOfLines={2}>
                        {video.description}
                      </Text>
                    )}
                    <Text style={styles.lessonItemDate}>
                      {hoursLeft > 0 ? `יימחק בעוד ${hoursLeft} שעות` : 'פג תוקף'}
                    </Text>
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

      <Text style={styles.note}>
        💡 סרטונים נשמרים ב-Firestore, מועלים ל-Firebase Storage, ומופיעים במסך זריקת אמונה. סרטונים נמחקים אוטומטית אחרי 24 שעות.
      </Text>
    </View>
  )
}

// ========== INSTITUTIONS FORM ==========
function InstitutionsForm() {
  const [selectedActivity, setSelectedActivity] = useState('kindergarten')
  const [form, setForm] = useState({
    title: '',
    content: '',
  })
  const [loading, setLoading] = useState(false)

  const ACTIVITIES = [
    { value: 'kindergarten', label: 'גני ילדים' },
    { value: 'talmud-torah', label: 'תלמוד תורה' },
    { value: 'girls-school', label: 'בית ספר לבנות' },
    { value: 'small-yeshiva', label: "ישיבה קטנה 'אמרי שפר'" },
    { value: 'large-yeshiva', label: 'ישיבה גדולה' },
    { value: 'kollel', label: 'כולל אברכים' },
    { value: 'women-lessons', label: 'שיעורים לנשים' },
    { value: 'community', label: 'פעילות קהילתית' },
    { value: 'youth-club', label: 'מועדונית לנוער' },
  ]

  useEffect(() => {
    loadContent()
  }, [selectedActivity])

  const loadContent = async () => {
    try {
      setLoading(true)
      const content = await getInstitutionContent(selectedActivity)
      if (content) {
        setForm({
          title: content.title || '',
          content: content.content || '',
        })
      } else {
        setForm({
          title: '',
          content: '',
        })
      }
    } catch (error) {
      console.error('Error loading content:', error)
      setForm({
        title: '',
        content: '',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים')
      return
    }

    try {
      setLoading(true)
      await saveInstitutionContent(selectedActivity, {
        title: form.title,
        content: form.content,
      })
      Alert.alert(
        'הצלחה! 🏛️',
        `תוכן "${ACTIVITIES.find(a => a.value === selectedActivity)?.label}" נשמר בהצלחה ב-Firestore!`
      )
    } catch (error) {
      console.error('Error saving content:', error)
      Alert.alert('שגיאה', 'לא ניתן לשמור את התוכן')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>🏛️ עריכת תוכן המוסדות</Text>
      <Text style={styles.note}>
        💡 כאן תוכל לערוך את התוכן של כל מסכי הפעילויות. התוכן יישמר ב-Firestore ויוצג במסכים.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>בחר פעילות לעריכה</Text>
        <View style={styles.radioGroup}>
          {ACTIVITIES.map(activity => (
            <Pressable
              key={activity.value}
              style={[styles.radioButton, selectedActivity === activity.value && styles.radioButtonActive]}
              onPress={() => setSelectedActivity(activity.value)}
            >
              <Text style={[styles.radioText, selectedActivity === activity.value && styles.radioTextActive]}>
                {activity.label}
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
          placeholder="כותרת המסך"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תוכן (HTML או טקסט רגיל)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.content}
          onChangeText={text => setForm({...form, content: text})}
          placeholder="הכנס את התוכן כאן..."
          multiline
          numberOfLines={12}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={PRIMARY_RED} size="large" />
          <Text style={styles.loadingText}>טוען תוכן...</Text>
        </View>
      )}

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
            <Text style={styles.submitButtonText}>שמור תוכן</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.note}>
        💡 התוכן נשמר ב-Firestore תחת collection: institutionsContent/{selectedActivity} ומופיע במסכים מיידית.
      </Text>
    </View>
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
    paddingTop: Platform.select({ ios: 12, android: 12, default: 12 }),
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.08)',
  },
  tabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(11,27,58,0.04)',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  tabTextActive: {
    color: PRIMARY_RED,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    gap: 20,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 8,
  },
  formGroup: {
    gap: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    textAlign: 'right',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#9ca3af',
    textAlign: 'left',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(11,27,58,0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: PRIMARY_RED,
  },
  radioText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  radioTextActive: {
    color: PRIMARY_RED,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
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
  uploadSection: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PRIMARY_RED,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  uploadButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: PRIMARY_RED,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  note: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 18,
    backgroundColor: 'rgba(212,175,55,0.08)',
    padding: 12,
    borderRadius: 10,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(11,27,58,0.12)',
    marginVertical: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 4,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.2)',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  uploadedText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16a34a',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  // Lessons Form Styles
  formDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 20,
    marginTop: -10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  categoryPillTextActive: {
    color: '#fff',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(22,163,74,0.1)',
    borderRadius: 8,
  },
  successText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#16a34a',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 19,
  },
  infoBold: {
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  viewLibraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  viewLibraryText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  // New styles for lessons list
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(11,27,58,0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  filterPillText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#6b7280',
  },
  filterPillTextActive: {
    color: '#fff',
  },
  lessonsList: {
    maxHeight: 400,
    marginTop: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
  },
  lessonItemContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  lessonItemTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 4,
  },
  lessonItemCategory: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: PRIMARY_RED,
    marginBottom: 2,
  },
  lessonItemDate: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
  },
  lessonItemActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(220,38,38,0.1)',
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
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(11,27,58,0.08)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  // Podcasts form styles
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  todayButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  uploadSection: {
    gap: 12,
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(22,163,74,0.1)',
    borderRadius: 8,
  },
  uploadedText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#16a34a',
  },
  imagePreview: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: PRIMARY_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: PRIMARY_RED,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: DEEP_BLUE,
  },
  // Alerts Form Styles
  alertsList: {
    maxHeight: 400,
    marginTop: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
  },
  alertItemContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  alertItemTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 4,
  },
  alertItemMessage: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginBottom: 6,
    textAlign: 'right',
  },
  alertItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  // Daily Videos Form Styles
  videoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(220,38,38,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: PRIMARY_RED,
    marginTop: 8,
  },
})
