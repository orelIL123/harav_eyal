import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

const PRAYERS = [
  {
    id: 'prayer-1',
    title: 'תפילה לזיווג',
    description: 'תפילה מיוחדת לזיווג הגון',
    pdf: null, // PDF יועלה בהמשך
  },
  {
    id: 'prayer-2',
    title: 'תפילה לרפואה',
    description: 'תפילה לרפואה שלמה',
    pdf: null, // PDF יועלה בהמשך
  },
]

export default function PrayersScreen({ navigation }) {
  const handlePrayerPress = (prayer) => {
    if (prayer.pdf) {
      navigation.navigate('PdfViewer', { pdf: prayer.pdf, title: prayer.title })
    } else {
      Alert.alert('בקרוב', `תפילת ${prayer.title} תופיע כאן בקרוב`)
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
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>תפילות</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>תפילות מיוחדות וסגולות</Text>

        {PRAYERS.map((prayer, idx) => (
          <Pressable
            key={prayer.id}
            style={[styles.prayerCard, idx === 0 && styles.prayerCardFirst]}
            onPress={() => handlePrayerPress(prayer)}
            accessibilityRole="button"
            accessibilityLabel={`תפילה ${prayer.title}`}
          >
            <View style={styles.prayerContent}>
              <View style={styles.prayerIcon}>
                <Ionicons name="document-text-outline" size={32} color={PRIMARY_RED} />
              </View>
              <View style={styles.prayerTextBlock}>
                <Text style={styles.prayerTitle}>{prayer.title}</Text>
                <Text style={styles.prayerDesc}>{prayer.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={PRIMARY_RED} />
            </View>
          </Pressable>
        ))}

        <View style={styles.footerCard}>
          <Ionicons name="heart-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>תפילות נוספות</Text>
            <Text style={styles.footerDesc}>
              תפילות נוספות יופיעו כאן בקרוב.
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
    backgroundColor: 'rgba(30,58,138,0.12)',
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
  prayerCard: {
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
  prayerCardFirst: {
    marginTop: 6,
  },
  prayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  prayerIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(30,58,138,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  prayerTitle: {
    color: DEEP_BLUE,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  prayerDesc: {
    color: '#6b7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
  },
  footerCard: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(30,58,138,0.1)',
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

