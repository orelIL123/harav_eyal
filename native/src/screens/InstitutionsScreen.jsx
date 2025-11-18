import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const TABS = [
  { key: 'activities', title: 'הפעילות שלנו', icon: 'school-outline', screen: 'OurActivities' },
  { key: 'about', title: 'אודות', icon: 'information-circle-outline', screen: 'About' },
  { key: 'foundation', title: 'על העמותה', icon: 'people-outline', screen: 'News' },
  { key: 'contact', title: 'צור קשר', icon: 'mail-outline', screen: 'ContactRabbi' },
]

export default function InstitutionsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('activities')
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleTabPress = (tab) => {
    setActiveTab(tab.key)
    if (tab.screen) {
      navigation.navigate(tab.screen)
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
        <Text style={styles.headerTitle}>מוסדות הרב</Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
              onPress={() => handleTabPress(tab)}
              accessibilityRole="button"
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={activeTab === tab.key ? PRIMARY_RED : '#6b7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.welcomeCard}>
          <Ionicons name="school" size={48} color={PRIMARY_RED} />
          <Text style={styles.welcomeTitle}>ברוכים הבאים למוסדות כאייל תערוג</Text>
          <Text style={styles.welcomeText}>
            בחרו באחת מהקטגוריות למעלה כדי לגשת למידע המבוקש
          </Text>
        </View>

        <View style={styles.quickLinks}>
          <Text style={styles.quickLinksTitle}>קישורים מהירים</Text>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={styles.quickLinkCard}
              onPress={() => handleTabPress(tab)}
              accessibilityRole="button"
            >
              <View style={styles.quickLinkIcon}>
                <Ionicons name={tab.icon} size={24} color={PRIMARY_RED} />
              </View>
              <Text style={styles.quickLinkText}>{tab.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={PRIMARY_RED} />
            </Pressable>
          ))}
        </View>
      </Animated.View>
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
    flex: 1,
    padding: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
  },
  tabTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  quickLinks: {
    gap: 12,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 8,
  },
  quickLinkCard: {
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
    gap: 12,
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
})

