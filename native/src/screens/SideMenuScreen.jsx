import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next';
import { FAITH_TOPICS } from '../data/faithTopics'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const MENU_ITEMS = [
  {
    id: 'lessons-library',
    title: 'sideMenu.lessonsLibrary',
    icon: 'library',
    color: PRIMARY_GOLD,
    screen: 'LessonsLibrary',
  },
  {
    id: 'donation',
    title: 'sideMenu.donation',
    icon: 'heart',
    color: PRIMARY_RED,
    screen: 'Donation',
  },
  {
    id: 'whatsapp',
    title: 'sideMenu.whatsapp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    url: 'https://chat.whatsapp.com/H4t7m6NfuBD9GgEuw80EeP',
  },
  {
    id: 'flyers',
    title: 'sideMenu.flyers',
    icon: 'document-text',
    color: PRIMARY_RED,
    screen: 'Flyers',
  },
  {
    id: 'contact',
    title: 'sideMenu.contact',
    icon: 'mail',
    color: PRIMARY_RED,
    screen: 'ContactRabbi',
  },
  {
    id: 'institutions',
    title: 'sideMenu.institutions',
    icon: 'school',
    color: PRIMARY_RED,
    screen: 'Institutions',
  },
  {
    id: 'about',
    title: 'sideMenu.about',
    icon: 'information-circle',
    color: PRIMARY_RED,
    screen: 'About',
  },
  {
    id: 'language',
    title: 'sideMenu.language',
    icon: 'language',
    color: PRIMARY_RED,
    screen: 'Language',
  },
  {
    id: 'community-news',
    title: 'sideMenu.communityNews',
    icon: 'newspaper',
    color: PRIMARY_RED,
    screen: 'CommunityNews',
  },
]

export default function SideMenuScreen({ navigation }) {
  const { t } = useTranslation();

  const handleMenuItemPress = (item) => {
    if (item.url) {
      Linking.openURL(item.url).catch(() => {
        Alert.alert(t('error'), t('linkError'))
      })
    } else if (item.screen) {
      navigation.navigate(item.screen)
    } else {
      Alert.alert(t('comingSoon'), t('comingSoonMessage', { title: t(item.title) }))
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
          accessibilityLabel={t('back')}
        >
          <Ionicons name="close" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('sideMenu.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.faithSectionTitle}>{t('sideMenu.faithLearningTitle')}</Text>
          <Text style={styles.faithSectionSubtitle}>{t('sideMenu.faithLearningSubtitle')}</Text>
        </View>
        <View style={styles.faithTopicsGrid}>
          {FAITH_TOPICS.map(topic => (
            <Pressable
              key={topic.key}
              style={styles.faithTopicCard}
              onPress={() => navigation.navigate('FaithLearning', { category: topic.key })}
              accessibilityRole="button"
            >
              <View style={styles.faithTopicIcon}>
                <Ionicons name="sparkles-outline" size={20} color={topic.color} />
              </View>
              <Text style={styles.faithTopicTitle}>{t(topic.title)}</Text>
              <Text style={styles.faithTopicHint}>{t('sideMenu.focusedLearning')}</Text>
            </Pressable>
          ))}
        </View>
        {MENU_ITEMS.map((item, idx) => (
          <Pressable
            key={item.id}
            style={[styles.menuItem, idx === 0 && styles.menuItemFirst]}
            onPress={() => handleMenuItemPress(item)}
            accessibilityRole="button"
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.menuTextBlock}>
              <Text style={styles.menuTitle}>{t(item.title)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
          </Pressable>
        ))}
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
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  sectionHeaderRow: {
    alignItems: 'flex-end',
    gap: 4,
  },
  faithSectionTitle: {
    color: PRIMARY_RED,
    fontSize: 19,
    fontFamily: 'Poppins_700Bold',
  },
  faithSectionSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  faithTopicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  faithTopicCard: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'flex-end',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  faithTopicIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.08)',
  },
  faithTopicTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  faithTopicHint: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
    gap: 16,
  },
  menuItemFirst: {
    marginTop: 6,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  menuTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
})

