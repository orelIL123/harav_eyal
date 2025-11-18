import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

// דוגמאות - בהמשך יגיעו מה-API/אדמין
const COMMUNITY_NEWS = [
  {
    id: 'news-1',
    title: 'חדשות הקהילה',
    date: new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: 'עדכונים וחדשות מהקהילה',
    image: require('../../assets/icon.png'),
  },
  {
    id: 'news-2',
    title: 'אירוע קהילתי',
    date: new Date(Date.now() - 86400000).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }),
    summary: 'אירועים ופעילויות קהילתיות',
    image: require('../../assets/icon.png'),
  },
]

export default function CommunityNewsScreen({ navigation }) {
  const handleShare = (article) => {
    Share.share({
      message: `${article.title}\n${article.summary}`
    }).catch(() => {})
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f4f6f9']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>חדשות הקהילה</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>עדכונים וחדשות מהקהילה</Text>

        {COMMUNITY_NEWS.map((article, idx) => (
          <Pressable
            key={article.id}
            style={[styles.articleCard, idx === 0 && styles.articleCardFirst]}
            accessibilityRole="button"
          >
            <View style={styles.articleContent}>
              <View style={styles.articleTextBlock}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleDate}>{article.date}</Text>
                <Text style={styles.articleSummary}>{article.summary}</Text>
              </View>
              <Pressable
                style={styles.shareButton}
                onPress={() => handleShare(article)}
              >
                <Ionicons name="share-social-outline" size={20} color={PRIMARY_RED} />
              </Pressable>
            </View>
          </Pressable>
        ))}

        <View style={styles.footerCard}>
          <Ionicons name="newspaper-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>חדשות נוספות</Text>
            <Text style={styles.footerDesc}>
              חדשות נוספות יופיעו כאן. האדמין יעדכן את החדשות דרך פאנל הניהול.
            </Text>
          </View>
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
  articleCard: {
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
  articleCardFirst: {
    marginTop: 6,
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  articleTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  articleTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  articleDate: {
    color: PRIMARY_RED,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'right',
  },
  articleSummary: {
    color: '#6b7280',
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 22,
    marginTop: 4,
  },
  shareButton: {
    padding: 8,
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
})

