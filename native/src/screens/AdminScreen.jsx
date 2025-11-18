import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, Image, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { sendLocalNotification, scheduleNotification } from '../utils/notifications'
import { pickImage, uploadImageToStorage, generateStoragePath, generateCardImagePath, generateNewsImagePath } from '../utils/storage'
import { addLesson, getLessons, updateLesson, deleteLesson } from '../services/lessonsService'
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../services/alertsService'
import { updateCard, getAppConfig, updateAppConfig } from '../services/cardsService'
import { createNews, getNews, updateNews, deleteNews } from '../services/newsService'
import { getInstitutionContent, saveInstitutionContent } from '../services/institutionsService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const TABS = [
  { id: 'lessons', label: 'שיעורים', icon: 'library-outline' },
  { id: 'alerts', label: 'התראות', icon: 'notifications-outline' },
  { id: 'cards', label: 'כרטיסיות', icon: 'albums-outline' },
  { id: 'news', label: 'חדשות', icon: 'newspaper-outline' },
  { id: 'institutions', label: 'מוסדות', icon: 'business-outline' },
]

export default function AdminScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('lessons')

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
        <Text style={styles.headerTitle}>🔐 פאנל אדמין</Text>
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
        {activeTab === 'institutions' && <InstitutionsForm />}
      </ScrollView>
    </SafeAreaView>
  )
}

// ========== LESSONS FORM ==========
function LessonsForm({ navigation }) {
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
    { value: 'emuna', label: 'אמונה וביטחון', icon: 'shield-checkmark-outline' },
    { value: 'likutei', label: 'ליקוטי מוהר"ן', icon: 'book-outline' },
    { value: 'einYaakov', label: 'עין יעקב', icon: 'library-outline' },
    { value: 'motseiShabbat', label: 'מוצ"ש אמונה', icon: 'moon-outline' },
    { value: 'halachotShabbat', label: 'הלכות שבת', icon: 'flame-outline' },
    { value: 'shortLessons', label: 'שיעורים קצרים', icon: 'timer-outline' },
    { value: 'holidays', label: 'מועדי ישראל', icon: 'calendar-outline' },
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
      Alert.alert('שגיאה', 'לא ניתן לטעון את השיעורים')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.url) {
      Alert.alert('שגיאה', 'יש למלא לפחות כותרת וקישור YouTube')
      return
    }

    try {
      setLoading(true)
      
      if (editingLesson) {
        // Update existing lesson
        await updateLesson(editingLesson.id, form)
        Alert.alert('הצלחה!', 'השיעור עודכן בהצלחה')
        setEditingLesson(null)
      } else {
        // Add new lesson
        await addLesson(form)
        Alert.alert('הצלחה!', 'השיעור נוסף בהצלחה')
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
      Alert.alert('שגיאה', 'לא ניתן לשמור את השיעור')
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
      'מחיקת שיעור',
      `האם אתה בטוח שברצונך למחוק את השיעור "${lesson.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              await deleteLesson(lesson.id)
              Alert.alert('הצלחה!', 'השיעור נמחק בהצלחה')
              await loadLessons()
            } catch (error) {
              console.error('Error deleting lesson:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את השיעור')
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
      <Text style={styles.formTitle}>📚 ניהול שיעורים</Text>
      <Text style={styles.formDesc}>
        הוסף, ערוך ומחק שיעורים מכל הקטגוריות. השיעורים יופיעו בספריית השיעורים עם קישורים ישירים ליוטיוב.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קטגוריה</Text>
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
        <Text style={styles.label}>כותרת השיעור</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={text => setForm({...form, title: text})}
          placeholder="להיות שמח במה שיש !!!"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>תאריך (אופציונלי)</Text>
        <TextInput
          style={styles.input}
          value={form.date}
          onChangeText={text => setForm({...form, date: text})}
          placeholder={'כא\' חשון תשפ"ו [12.11.25]'}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>קישור YouTube</Text>
        <TextInput
          style={styles.input}
          value={form.url}
          onChangeText={extractVideoId}
          placeholder="https://www.youtube.com/watch?v=..."
          autoCapitalize="none"
          keyboardType="url"
        />
        {form.videoId && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.successText}>Video ID: {form.videoId}</Text>
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
          {editingLesson ? 'עדכן שיעור' : 'הוסף שיעור'}
        </Text>
      </Pressable>

      {editingLesson && (
        <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
          <Text style={styles.cancelButtonText}>ביטול עריכה</Text>
        </Pressable>
      )}

      {/* Filter by category */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>סינון לפי קטגוריה</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          <Pressable
            style={[styles.filterPill, !filterCategory && styles.filterPillActive]}
            onPress={() => setFilterCategory(null)}
          >
            <Text style={[styles.filterPillText, !filterCategory && styles.filterPillTextActive]}>הכל</Text>
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
        <Text style={styles.label}>שיעורים קיימים ({lessons.length})</Text>
        {loading && lessons.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען שיעורים...</Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>אין שיעורים בקטגוריה זו</Text>
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
        <Text style={styles.viewLibraryText}>צפייה בספריית השיעורים</Text>
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

  const handleSubmit = async () => {
    const notification = {
      title: form.title,
      body: form.message,
      data: {
        type: form.type,
        priority: form.priority,
        screen: form.type === 'reminder' ? 'DailyInsight' : 'Home'
      }
    }

    if (form.sendType === 'immediate') {
      await sendLocalNotification(notification)
      Alert.alert(
        'תזכורת נשלחה! 🎉',
        `כותרת: ${form.title}\nהודעה: ${form.message}\n\nבגרסה הסופית, זה יישמר ב-Firestore וישלח Push לכל המשתמשים.`
      )
    } else {
      // Scheduled notification
      const triggerDate = new Date(form.scheduledTime)
      await scheduleNotification({
        ...notification,
        triggerDate
      })
      Alert.alert(
        'תזכורת מתוזמנת! ⏰',
        `כותרת: ${form.title}\nתזמון: ${triggerDate.toLocaleString('he-IL')}\n\nהתראה תישלח בזמן המתוזמן.`
      )
    }
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

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
        <Ionicons name="send" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>שלח התראה + Push</Text>
      </Pressable>

      <Text style={styles.note}>
        💡 כרגע זה שולח התראה מקומית לבדיקה. בגרסה הסופית, זה יישמר ב-Firestore וישלח Push לכל המשתמשים הרשומים.
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

  const handleSubmit = () => {
    if (form.imageUri && !form.imageUrl) {
      Alert.alert('שים לב', 'אנא העלה את התמונה לפני השמירה')
      return
    }

    Alert.alert(
      'כרטיס יתעדכן! 🎴',
      `מזהה: ${form.key}\nכותרת: ${form.title}\nתיאור: ${form.desc}\n${form.imageUrl ? 'עם תמונה חדשה' : 'ללא תמונה'}\n\nבגרסה הסופית:\n• העלאת תמונה חדשה ל-Firebase Storage\n• עדכון ב-Firestore\n• עדכון כותרת ראשית`
    )
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

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
        <Ionicons name="save" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>שמור שינויים</Text>
      </Pressable>

      <Text style={styles.note}>
        💡 שינויים יופיעו מיידית לאחר שמירה ב-Firestore. התמונות יועלו ל-Firebase Storage.
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

  const handleSubmit = async () => {
    if (form.imageUri && !form.imageUrl) {
      Alert.alert('שים לב', 'אנא העלה את התמונה לפני הפרסום')
      return
    }

    Alert.alert(
      'חדשה תתפרסם! 📰',
      `כותרת: ${form.title}\nקטגוריה: ${form.category}\n${form.imageUrl ? 'עם תמונה' : 'ללא תמונה'}`
    )
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

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
        <Ionicons name="newspaper" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>פרסם חדשה</Text>
      </Pressable>
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

  const handleLoadContent = () => {
    // כאן יטען התוכן מ-Firestore
    Alert.alert('טוען תוכן', `טוען תוכן עבור: ${ACTIVITIES.find(a => a.value === selectedActivity)?.label}`)
  }

  const handleSubmit = () => {
    Alert.alert(
      'תוכן נשמר! 🏛️',
      `פעילות: ${ACTIVITIES.find(a => a.value === selectedActivity)?.label}\nכותרת: ${form.title}\n\nבגרסה הסופית:\n• התוכן יישמר ב-Firestore\n• המסכים יקראו את התוכן מ-Firestore\n• ניתן לערוך את התוכן בכל עת`
    )
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

      <View style={styles.uploadSection}>
        <Pressable style={styles.uploadButton} onPress={handleLoadContent}>
          <Ionicons name="download-outline" size={24} color={PRIMARY_RED} />
          <Text style={styles.uploadButtonText}>טען תוכן קיים</Text>
        </Pressable>
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <LinearGradient colors={[PRIMARY_RED, PRIMARY_GOLD]} style={StyleSheet.absoluteFill} />
        <Ionicons name="save" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>שמור תוכן</Text>
      </Pressable>

      <Text style={styles.note}>
        💡 התוכן יישמר ב-Firestore תחת collection: institutionsContent/{activityId}
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
})
