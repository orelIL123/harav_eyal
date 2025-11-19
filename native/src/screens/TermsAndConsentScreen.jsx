import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { saveConsentAccepted, saveTermsAccepted } from '../utils/storage'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function TermsAndConsentScreen({ navigation }) {
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleContinue = async () => {
    if (!consentAccepted || !termsAccepted) {
      Alert.alert('נדרש אישור', 'אנא אשר את כל התנאים כדי להמשיך')
      return
    }

    // Save acceptances
    await saveConsentAccepted()
    await saveTermsAccepted()

    // Navigate to home
    navigation.replace('Home')
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f7f7f7']} style={StyleSheet.absoluteFill} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={64} color={PRIMARY_RED} />
          </View>
          <Text style={styles.title}>ברוך הבא!</Text>
          <Text style={styles.subtitle}>אנא קרא ואשר את התנאים הבאים</Text>
        </View>

        {/* Consent Section */}
        <View style={styles.section}>
          <View style={styles.checkboxContainer}>
            <Pressable
              style={[styles.checkbox, consentAccepted && styles.checkboxChecked]}
              onPress={() => setConsentAccepted(!consentAccepted)}
            >
              {consentAccepted && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </Pressable>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxText}>
                אני מאשר/ת כי אני מסכים/ה לקבל הודעות, התראות ומסרים מהאפליקציה, כולל התראות פוש, הודעות טקסט ואימיילים, בהתאם למדיניות הפרטיות.
              </Text>
            </View>
          </View>
        </View>

        {/* Terms Section */}
        <View style={styles.section}>
          <View style={styles.checkboxContainer}>
            <Pressable
              style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              {termsAccepted && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </Pressable>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxText}>
                אני קראתי והבנתי את{' '}
                <Text 
                  style={styles.linkText}
                  onPress={() => navigation.navigate('TermsOfService')}
                >
                  תנאי השימוש
                </Text>
                {' '}ואני מסכים/ה להם. אני מבין/ה כי האפליקציה אינה כוללת רכישות או תשלומים.
              </Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={PRIMARY_RED} />
          <Text style={styles.infoText}>
            האפליקציה הינה חינמית לחלוטין ואינה כוללת רכישות או תשלומים כלשהם.
          </Text>
        </View>

        {/* Continue Button */}
        <Pressable
          style={[
            styles.continueButton,
            (!consentAccepted || !termsAccepted) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!consentAccepted || !termsAccepted}
        >
          <Text style={styles.continueButtonText}>המשך</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    lineHeight: 22,
    textAlign: 'right',
  },
  linkText: {
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textDecorationLine: 'underline',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    lineHeight: 20,
    textAlign: 'right',
  },
  continueButton: {
    backgroundColor: PRIMARY_RED,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
})

