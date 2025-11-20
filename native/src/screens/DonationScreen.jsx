import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Analytics } from '../services/analyticsService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function DonationScreen({ navigation }) {
  const handleDonatePress = () => {
    // Track donation button press
    Analytics.donate(0) // Amount unknown at this point
    
    const donationUrl = 'https://www.jgive.com/new/he/ils/donation-targets/142539?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPMTI0MDI0NTc0Mjg3NDE0AAGneTs411D0SUzm0ox_gnuWPlxtVYAo5WTjwYpjMtO5LF7NsfEFaSluhrNTOGE_aem_C7zwEIXjMrBF46Exo9F4Jg'
    Linking.openURL(donationUrl).catch(() => {
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
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>תרומה לחיזוק מוסדות הרב</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart" size={64} color={PRIMARY_RED} />
        </View>

        <Text style={styles.title}>חיזוק מוסדות הרב</Text>
        <Text style={styles.description}>
          תרומתכם מסייעת להמשך פעילות המוסדות ולחיזוק הקהילה.
        </Text>

        <Pressable style={styles.donateButton} onPress={handleDonatePress}>
          <LinearGradient
            colors={[PRIMARY_RED, PRIMARY_GOLD]}
            style={styles.donateGradient}
          >
            <Ionicons name="heart" size={24} color="#fff" />
            <Text style={styles.donateButtonText}>לתרומה</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={32} color={PRIMARY_RED} />
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoTitle}>פרטי תרומה</Text>
            <Text style={styles.infoDesc}>
              לפרטים נוספים על דרכי התרומה, אנא צרו קשר דרך עמוד "צרו קשר".
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
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  donateButton: {
    width: '100%',
    marginTop: 8,
  },
  donateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(220,38,38,0.1)',
    width: '100%',
  },
  infoTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  infoTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  infoDesc: {
    color: '#4b5563',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
})

