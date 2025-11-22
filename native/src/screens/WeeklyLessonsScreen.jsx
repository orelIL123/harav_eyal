import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, Image, Dimensions, Modal, TextInput, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../utils/AuthContext'
import { getWeeklyLessons, createWeeklyLesson, updateWeeklyLesson, deleteWeeklyLesson } from '../services/weeklyLessonsService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export default function WeeklyLessonsScreen({ navigation }) {
  const { isAdmin } = useAuth()
  const scrollViewRef = React.useRef(null)
  const [showSmallImage, setShowSmallImage] = React.useState(false)
  const [showFullImage, setShowFullImage] = React.useState(false)
  const [lessons, setLessons] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isAdminMode, setIsAdminMode] = React.useState(false)
  const [editingLesson, setEditingLesson] = React.useState(null)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [formData, setFormData] = React.useState({
    city: '',
    location: '',
    day: 'ראשון',
    time: '',
    address: '',
  })

  React.useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const data = await getWeeklyLessons()
      setLessons(data || [])
    } catch (error) {
      console.error('Error loading weekly lessons:', error)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height
    const contentHeight = event.nativeEvent.contentSize.height
    
    // בדיקה אם הגענו לסוף הגלילה (עם טולרנס של 50px)
    const isAtEnd = scrollY + scrollViewHeight >= contentHeight - 50
    setShowSmallImage(isAtEnd)
  }

  const handleLessonPress = (lesson) => {
    if (isAdminMode) {
      // במצב עריכה - פתח modal עריכה
      setEditingLesson(lesson)
      setFormData({
        city: lesson.city || '',
        location: lesson.location || '',
        day: lesson.day || 'ראשון',
        time: lesson.time || '',
        address: lesson.address || '',
      })
      setShowEditModal(true)
    } else {
      // במצב רגיל - הצג פרטים
    Alert.alert(
      lesson.city,
      `${lesson.location}\n${lesson.day} בשעה ${lesson.time}\n${lesson.address}`,
      [
        { text: 'סגור', style: 'cancel' },
        { text: 'פתח במפות', onPress: () => Alert.alert('בקרוב', 'פתיחת מפות תתווסף בקרוב') },
        ]
      )
    }
  }

  const handleAddLesson = () => {
    setEditingLesson(null)
    setFormData({
      city: '',
      location: '',
      day: 'ראשון',
      time: '',
      address: '',
    })
    setShowEditModal(true)
  }

  const handleSaveLesson = async () => {
    if (!formData.city || !formData.location || !formData.time || !formData.address) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות')
      return
    }

    try {
      if (editingLesson) {
        // עדכון שיעור קיים
        await updateWeeklyLesson(editingLesson.id, {
          ...formData,
          order: editingLesson.order || lessons.length,
        })
        Alert.alert('הצלחה', 'השיעור עודכן בהצלחה')
      } else {
        // הוספת שיעור חדש
        await createWeeklyLesson({
          ...formData,
          order: lessons.length,
        })
        Alert.alert('הצלחה', 'השיעור נוסף בהצלחה')
      }
      setShowEditModal(false)
      await loadLessons()
    } catch (error) {
      console.error('Error saving lesson:', error)
      Alert.alert('שגיאה', 'לא ניתן לשמור את השיעור')
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    Alert.alert(
      'מחיקת שיעור',
      'האם אתה בטוח שברצונך למחוק את השיעור הזה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWeeklyLesson(lessonId)
              Alert.alert('הצלחה', 'השיעור נמחק בהצלחה')
              await loadLessons()
            } catch (error) {
              console.error('Error deleting lesson:', error)
              Alert.alert('שגיאה', 'לא ניתן למחוק את השיעור')
            }
          },
        },
      ]
    )
  }

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
        <Text style={styles.headerTitle}>שיעורים שבועיים</Text>
        {isAdmin ? (
          <Pressable
            style={[styles.editBtn, isAdminMode && styles.editBtnActive]}
            onPress={() => setIsAdminMode(!isAdminMode)}
            accessibilityRole="button"
            accessibilityLabel="עריכה"
          >
            <Ionicons name={isAdminMode ? 'create' : 'create-outline'} size={20} color={isAdminMode ? '#fff' : PRIMARY_RED} />
          </Pressable>
        ) : (
        <View style={{ width: 24 }} />
        )}
      </View>

      {isAdminMode && (
        <View style={styles.adminBanner}>
          <View style={styles.adminBannerContent}>
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.adminBannerText}>מצב עריכה פעיל</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={handleAddLesson}>
            <Ionicons name="add" size={20} color={PRIMARY_RED} />
            <Text style={styles.addBtnText}>הוסף שיעור</Text>
          </Pressable>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>רשימת השיעורים השבועיים של הרב</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_RED} />
            <Text style={styles.loadingText}>טוען שיעורים...</Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isAdminMode ? 'אין שיעורים. לחץ על "הוסף שיעור" כדי להתחיל' : 'אין שיעורים כרגע'}
            </Text>
          </View>
        ) : (
          lessons.map((lesson, idx) => (
            <View key={lesson.id} style={[styles.lessonCard, idx === 0 && styles.lessonCardFirst]}>
          <Pressable
            onPress={() => handleLessonPress(lesson)}
            accessibilityRole="button"
            accessibilityLabel={`שיעור ב${lesson.city}`}
                style={styles.lessonPressable}
          >
            <View style={styles.lessonContent}>
              <View style={styles.cityIcon}>
                <Ionicons name="location" size={32} color={PRIMARY_RED} />
              </View>
              <View style={styles.lessonTextBlock}>
                <Text style={styles.cityName}>{lesson.city}</Text>
                <Text style={styles.locationName}>{lesson.location}</Text>
                <View style={styles.timeRow}>
                  <Ionicons name="calendar-outline" size={14} color={PRIMARY_RED} />
                  <Text style={styles.timeText}>{lesson.day} בשעה {lesson.time}</Text>
                </View>
                <Text style={styles.addressText}>{lesson.address}</Text>
              </View>
                  {isAdminMode ? (
                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteLesson(lesson.id)}
                      accessibilityRole="button"
                      accessibilityLabel="מחק שיעור"
                    >
                      <Ionicons name="trash-outline" size={20} color={PRIMARY_RED} />
                    </Pressable>
                  ) : (
              <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
                  )}
                </View>
              </Pressable>
            </View>
          ))
        )}

        <View style={styles.footerCard}>
          <Ionicons name="information-circle-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>עדכונים</Text>
            <Text style={styles.footerDesc}>
              השיעורים מתעדכנים מדי שבוע. בדקו כאן לעדכונים שוטפים.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {showSmallImage && (
        <Pressable
          style={styles.smallImageContainer}
          onPress={() => setShowFullImage(true)}
          accessibilityRole="button"
          accessibilityLabel="הצג תמונה בגודל מלא"
        >
          <Image
            source={require('../../assets/photos/שיעורי_הרב.jpg')}
            style={styles.smallImage}
            resizeMode="cover"
          />
          <View style={styles.smallImageOverlay}>
            <Ionicons name="expand-outline" size={24} color="#fff" />
          </View>
        </Pressable>
      )}

      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setShowFullImage(false)}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={32} color="#fff" />
          </Pressable>
          <Image
            source={require('../../assets/photos/שיעורי_הרב.jpg')}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Edit/Add Lesson Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLesson ? 'ערוך שיעור' : 'הוסף שיעור חדש'}
              </Text>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Ionicons name="close" size={24} color={DEEP_BLUE} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>עיר *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="לדוגמה: ירושלים"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>מיקום *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="לדוגמה: בית המדרש המרכזי"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>יום בשבוע *</Text>
                <View style={styles.daysRow}>
                  {DAYS.map((day) => (
                    <Pressable
                      key={day}
                      style={[
                        styles.dayBtn,
                        formData.day === day && styles.dayBtnActive,
                      ]}
                      onPress={() => setFormData({ ...formData, day })}
                    >
                      <Text
                        style={[
                          styles.dayBtnText,
                          formData.day === day && styles.dayBtnTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>שעה *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                  placeholder="לדוגמה: 20:00"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>כתובת *</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="לדוגמה: רחוב הרב קוק 15, ירושלים"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelBtnText}>ביטול</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSaveLesson}>
                <LinearGradient
                  colors={[PRIMARY_RED, '#ef4444']}
                  style={styles.saveBtnGradient}
                >
                  <Text style={styles.saveBtnText}>שמור</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
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
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 18,
  },
  subtitle: {
    alignSelf: 'flex-end',
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  lessonCardFirst: {
    marginTop: 6,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cityIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  cityName: {
    color: DEEP_BLUE,
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  locationName: {
    color: PRIMARY_RED,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  timeText: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'right',
  },
  addressText: {
    color: '#6b7280',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    marginTop: 2,
  },
  footerCard: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  footerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  footerTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  footerDesc: {
    color: '#4b5563',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
  smallImageContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  smallImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  // Admin mode styles
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  editBtnActive: {
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: PRIMARY_RED,
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  lessonPressable: {
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,27,58,0.1)',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 8,
    textAlign: 'right',
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Heebo_500Medium',
    color: DEEP_BLUE,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: 'rgba(220,38,38,0.3)',
  },
  dayBtnActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  dayBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  dayBtnTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,27,58,0.1)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  saveBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
})

