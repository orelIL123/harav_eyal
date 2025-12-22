import React, { useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'
const PRIMARY_GOLD = '#FFD700'
const WHATSAPP_PHONE = '972523677605'

export default function ContactRabbiScreen({ navigation }) {
  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_PHONE}`
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open WhatsApp:', err)
      Alert.alert('שגיאה', 'לא ניתן לפתוח את וואטסאפ. אנא ודא שהאפליקציה מותקנת במכשיר.')
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-forward" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>כתוב לרב</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="logo-whatsapp" size={80} color="#25D366" />
          </View>
        </View>

        <Text style={styles.title}>צור קשר עם הרב</Text>
        <Text style={styles.description}>
          שלח הודעה ישירה לרב אייל עמרמי דרך וואטסאפ
        </Text>

        <View style={styles.phoneContainer}>
          <Text style={styles.phoneLabel}>מספר וואטסאפ:</Text>
          <Text style={styles.phoneNumber}>052-367-7605</Text>
        </View>

        <Pressable
          style={styles.whatsappButton}
          onPress={openWhatsApp}
          accessibilityRole="button"
          accessibilityLabel="פתח וואטסאפ"
        >
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="logo-whatsapp" size={28} color="#ffffff" />
            <Text style={styles.buttonText}>פתח וואטסאפ</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={PRIMARY_RED} />
          <Text style={styles.infoText}>
            הרב עונה לשאלות ופניות בשעות הפנאי. אנא התאזר בסבלנות.
          </Text>
        </View>
      </View>
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
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#25D366',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  phoneContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  phoneLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    letterSpacing: 1,
  },
  whatsappButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#25D366',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 24,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#ffffff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 14,
    padding: 16,
    maxWidth: 350,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
})

