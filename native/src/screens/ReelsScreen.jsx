import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

// דוגמאות - בהמשך יגיעו מה-API
const REELS = [
  {
    id: 'reel-1',
    title: 'רילס קצר - זריקת אמונה',
    youtubeId: 'dQw4w9WgXcQ', // דוגמה - יוחלף
    thumbnail: require('../../assets/icon.png'),
  },
  {
    id: 'reel-2',
    title: 'רילס קצר - תובנה יומית',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: require('../../assets/icon.png'),
  },
  {
    id: 'reel-3',
    title: 'רילס קצר - חיזוק אמונה',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: require('../../assets/icon.png'),
  },
]

export default function ReelsScreen({ navigation }) {
  const [selectedReel, setSelectedReel] = useState(null)

  const handleReelPress = (reel) => {
    // פתיחת יוטיוב
    const youtubeUrl = `https://www.youtube.com/watch?v=${reel.youtubeId}`
    Linking.openURL(youtubeUrl).catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
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
        <Text style={styles.headerTitle}>רילסים</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>סרטונים קצרים - רילסים</Text>

        {REELS.map((reel, idx) => (
          <Pressable
            key={reel.id}
            style={[styles.reelCard, idx === 0 && styles.reelCardFirst]}
            onPress={() => handleReelPress(reel)}
            accessibilityRole="button"
          >
            <View style={styles.reelThumbnail}>
              <Ionicons name="play-circle" size={64} color={PRIMARY_RED} style={styles.playIcon} />
            </View>
            <View style={styles.reelInfo}>
              <Text style={styles.reelTitle}>{reel.title}</Text>
              <View style={styles.reelActions}>
                <Ionicons name="logo-youtube" size={20} color={PRIMARY_RED} />
                <Text style={styles.reelActionText}>צפה ביוטיוב</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <View style={styles.footerCard}>
          <Ionicons name="videocam-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>רילסים נוספים</Text>
            <Text style={styles.footerDesc}>
              רילסים נוספים יופיעו כאן. האדמין יעדכן את הקישורים מהיוטיוב.
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
  reelCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  reelCardFirst: {
    marginTop: 6,
  },
  reelThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playIcon: {
    opacity: 0.9,
  },
  reelInfo: {
    padding: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  reelTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  reelActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reelActionText: {
    color: PRIMARY_RED,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
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

