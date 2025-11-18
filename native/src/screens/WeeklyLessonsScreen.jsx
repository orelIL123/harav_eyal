import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, Image, Dimensions, Modal } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const WEEKLY_LESSONS = [
  {
    id: 'lesson-1',
    city: 'ירושלים',
    location: 'בית המדרש המרכזי',
    day: 'ראשון',
    time: '20:00',
    address: 'רחוב הרב קוק 15, ירושלים',
  },
  {
    id: 'lesson-2',
    city: 'תל אביב',
    location: 'בית הכנסת הגדול',
    day: 'שני',
    time: '19:30',
    address: 'רחוב דיזנגוף 100, תל אביב',
  },
  {
    id: 'lesson-3',
    city: 'באר שבע',
    location: 'מרכז הקהילה',
    day: 'שלישי',
    time: '20:30',
    address: 'רחוב הרצל 25, באר שבע',
  },
  {
    id: 'lesson-4',
    city: 'חיפה',
    location: 'בית המדרש',
    day: 'רביעי',
    time: '19:00',
    address: 'רחוב הרצל 10, חיפה',
  },
]

export default function WeeklyLessonsScreen({ navigation }) {
  const scrollViewRef = React.useRef(null)
  const [showSmallImage, setShowSmallImage] = React.useState(false)
  const [showFullImage, setShowFullImage] = React.useState(false)

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height
    const contentHeight = event.nativeEvent.contentSize.height
    
    // בדיקה אם הגענו לסוף הגלילה (עם טולרנס של 50px)
    const isAtEnd = scrollY + scrollViewHeight >= contentHeight - 50
    setShowSmallImage(isAtEnd)
  }

  const handleLessonPress = (lesson) => {
    Alert.alert(
      lesson.city,
      `${lesson.location}\n${lesson.day} בשעה ${lesson.time}\n${lesson.address}`,
      [
        { text: 'סגור', style: 'cancel' },
        { text: 'פתח במפות', onPress: () => Alert.alert('בקרוב', 'פתיחת מפות תתווסף בקרוב') },
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>רשימת השיעורים השבועיים של הרב</Text>

        {WEEKLY_LESSONS.map((lesson, idx) => (
          <Pressable
            key={lesson.id}
            style={[styles.lessonCard, idx === 0 && styles.lessonCardFirst]}
            onPress={() => handleLessonPress(lesson)}
            accessibilityRole="button"
            accessibilityLabel={`שיעור ב${lesson.city}`}
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
              <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
            </View>
          </Pressable>
        ))}

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
})

