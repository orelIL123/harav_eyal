import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { createLead } from '../services/leadsService'
import { validateName, validatePhone, validateMessage } from '../utils/validation'

const PRIMARY_RED = '#DC2626'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function ContactRabbiScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const contacts = [
    { label: 'מוקד מזכירות המוסד', value: '1599-50-20-51', icon: 'call-outline' },
    { label: 'פקס', value: '02-5023504', icon: 'print-outline' },
    { label: 'דוא״ל', value: 'orhaemuna1@gmail.com', icon: 'mail-outline' },
    { label: 'כתובת בית הכנסת "חסדי שמואל"', value: 'ירושלים, הר חומה, רחוב הרב מן ההר 4', icon: 'location-outline' },
  ]

  const handleSubmit = async () => {
    // Validate name
    const nameValidation = validateName(form.name, { minLength: 2, maxLength: 100, required: true })
    if (!nameValidation.valid) {
      Alert.alert('שגיאה', nameValidation.error)
      return
    }

    // Validate phone
    const phoneValidation = validatePhone(form.phone)
    if (!phoneValidation.valid) {
      Alert.alert('שגיאה', phoneValidation.error)
      return
    }

    // Validate message (optional)
    const messageValidation = validateMessage(form.message, { maxLength: 2000, required: false })
    if (!messageValidation.valid) {
      Alert.alert('שגיאה', messageValidation.error)
      return
    }

    setLoading(true)
    try {
      const { error } = await createLead({
        name: nameValidation.sanitized,
        phone: form.phone.trim(),
        message: messageValidation.sanitized,
        source: 'app',
      })

      if (error) {
        Alert.alert('שגיאה', error)
      } else {
        Alert.alert('הצלחה!', 'פנייתך נשלחה בהצלחה. נחזור אליך בהקדם.', [
          { text: 'אישור', onPress: () => {
            setForm({ name: '', phone: '', message: '' })
          }}
        ])
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בשליחת הפנייה. נסה שוב מאוחר יותר.')
    } finally {
      setLoading(false)
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
        <Text style={styles.headerTitle}>צור קשר</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Contact Form */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons name="send-outline" size={28} color={PRIMARY_RED} />
              <Text style={styles.formTitle}>שלח פנייה</Text>
            </View>
            <Text style={styles.formDesc}>
              מלא את הפרטים ונחזור אליך בהקדם
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>שם מלא *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="הזן שם מלא"
                  placeholderTextColor="#9ca3af"
                  value={form.name}
                  onChangeText={(text) => setForm({...form, name: text})}
                  textContentType="name"
                  maxLength={100}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>מספר טלפון *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="הזן מספר טלפון"
                  placeholderTextColor="#9ca3af"
                  value={form.phone}
                  onChangeText={(text) => setForm({...form, phone: text})}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  maxLength={20}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>הודעה (אופציונלי)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="כתוב את הודעתך כאן..."
                  placeholderTextColor="#9ca3af"
                  value={form.message}
                  onChangeText={(text) => setForm({...form, message: text})}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={2000}
                />
              </View>
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#ffffff" />
                  <Text style={styles.submitButtonText}>שלח פנייה</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Contact Info */}
          <View style={styles.introCard}>
            <Ionicons name="information-circle-outline" size={32} color={PRIMARY_RED} />
            <Text style={styles.introTitle}>לשאלות, צילום, ותיאומים</Text>
            <Text style={styles.introText}>
              נשמח לסייע בכל פנייה — הטלפון זמין למזכירות, והצוות יענה בהקדם.
            </Text>
          </View>

          {contacts.map((item) => (
            <View key={item.label} style={styles.contactRow}>
              <Ionicons name={item.icon} size={24} color={PRIMARY_RED} />
              <View style={styles.contactTextBlock}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
            </View>
          ))}

          <View style={styles.noteCard}>
            <Ionicons name="chatbubbles-outline" size={24} color={PRIMARY_RED} />
            <Text style={styles.noteText}>
              ניתן גם לנצל את הטפסים באתר או לשלוח הודעה דרך האדמין למידע נוסף על שיעורים ופעילויות.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
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
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  introTitle: {
    marginTop: 12,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  introText: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    gap: 12,
  },
  contactTextBlock: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  contactValue: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
    textAlign: 'right',
  },
  noteCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 14,
    padding: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  formDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'right',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: DEEP_BLUE,
    textAlign: 'right',
  },
  textAreaContainer: {
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY_RED,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
})

