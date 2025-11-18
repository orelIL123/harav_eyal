import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const ACTIVITIES = [
  { key: 'kindergarten', title: 'גני ילדים', icon: 'flower-outline', screen: 'Kindergarten' },
  { key: 'talmud-torah', title: 'תלמוד תורה', icon: 'book-outline', screen: 'TalmudTorah' },
  { key: 'girls-school', title: 'בית ספר לבנות', icon: 'school-outline', screen: 'GirlsSchool' },
  { key: 'small-yeshiva', title: 'ישיבה קטנה \'אמרי שפר\'', icon: 'library-outline', screen: 'SmallYeshiva' },
  { key: 'large-yeshiva', title: 'ישיבה גדולה', icon: 'library', screen: 'LargeYeshiva' },
  { key: 'kollel', title: 'כולל אברכים', icon: 'people-outline', screen: 'Kollel' },
  { key: 'women-lessons', title: 'שיעורים לנשים', icon: 'person-outline', screen: 'WomenLessons' },
  { key: 'community', title: 'פעילות קהילתית', icon: 'home-outline', screen: 'CommunityActivities' },
  { key: 'youth-club', title: 'מועדונית לנוער', icon: 'happy-outline', screen: 'YouthClub' },
]

function useFadeIn(delay = 0) {
  const anim = React.useRef(new Animated.Value(0)).current
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start()
  }, [anim, delay])
  return anim
}

function ActivityCard({ item, index, onPress }) {
  const fade = useFadeIn(index * 80)

  return (
    <Animated.View style={{ opacity: fade }}>
      <Pressable
        style={styles.activityCard}
        onPress={() => onPress(item)}
        accessibilityRole="button"
      >
        <View style={styles.activityIconContainer}>
          <Ionicons name={item.icon} size={32} color={PRIMARY_RED} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
      </Pressable>
    </Animated.View>
  )
}

export default function OurActivitiesScreen({ navigation }) {
  const handleActivityPress = (activity) => {
    if (activity.screen) {
      navigation.navigate(activity.screen)
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
        <Text style={styles.headerTitle}>הפעילות שלנו</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Ionicons name="school" size={48} color={PRIMARY_RED} />
          <Text style={styles.introTitle}>הפעילות שלנו</Text>
          <Text style={styles.introText}>
            מוסדות כאייל תערוג מציעים מגוון רחב של פעילויות חינוכיות ורוחניות
          </Text>
        </View>

        <View style={styles.activitiesList}>
          {ACTIVITIES.map((activity, index) => (
            <ActivityCard
              key={activity.key}
              item={activity}
              index={index}
              onPress={handleActivityPress}
            />
          ))}
        </View>
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
    backgroundColor: 'rgba(220,38,38,0.12)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  content: {
    padding: 20,
  },
  introSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 16,
  },
  activityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
})

