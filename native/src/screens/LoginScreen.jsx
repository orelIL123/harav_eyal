import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../utils/AuthContext'
import { getCredentials, saveCredentials } from '../utils/storage'
import { validateEmail, validatePassword } from '../utils/validation'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loadingCredentials, setLoadingCredentials] = useState(true)

  // Load saved email on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const credentials = await getCredentials()
        if (credentials?.email) {
          setEmail(credentials.email)
        }
      } catch (error) {
        console.error('Error loading credentials:', error)
      } finally {
        setLoadingCredentials(false)
      }
    }
    loadCredentials()
  }, [])

  const handleLogin = async () => {
    // Validate email or phone
    const isEmailInput = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (isEmailInput) {
      const emailValidation = validateEmail(email)
      if (!emailValidation.valid) {
        Alert.alert('שגיאה', emailValidation.error)
        return
      }
    } else {
      const { validatePhone } = await import('../utils/validation')
      const phoneValidation = validatePhone(email)
      if (!phoneValidation.valid) {
        Alert.alert('שגיאה', phoneValidation.error)
        return
      }
    }

    // Validate password
    const passwordValidation = validatePassword(password, { minLength: 6 })
    if (!passwordValidation.valid) {
      Alert.alert('שגיאה', passwordValidation.error)
      return
    }

    setLoading(true)
    try {
      const { user, error } = await login(email.trim(), password)
      if (error) {
        Alert.alert('שגיאה', error)
      } else {
        // Save email/phone for next time (password is never stored)
        await saveCredentials(email.trim())
        // Navigation will be handled by AuthContext
        navigation.goBack()
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בעת ההתחברות')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f7f7f7']} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
            </Pressable>
            <Text style={styles.headerTitle}>התחברות</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="log-in-outline" size={64} color={PRIMARY_RED} />
            </View>

            <Text style={styles.title}>ברוך הבא!</Text>
            <Text style={styles.subtitle}>התחבר לחשבון שלך</Text>

            {loadingCredentials ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={PRIMARY_RED} />
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="כתובת אימייל או מספר טלפון"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="default"
                    textContentType="username"
                    autoComplete="username"
                    maxLength={254}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="סיסמה"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    autoComplete="password"
                    maxLength={128}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.forgotButton}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgotText}>שכחת סיסמה?</Text>
                </Pressable>

                <Pressable
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                      <Text style={styles.loginButtonText}>התחבר</Text>
                    </>
                  )}
                </Pressable>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>או</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable
                  style={styles.registerButton}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.registerText}>
                    אין לך חשבון? <Text style={styles.registerLink}>הירשם עכשיו</Text>
                  </Text>
                </Pressable>
              </View>
            )}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
    paddingHorizontal: 16,
    height: 56,
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
  eyeButton: {
    padding: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: PRIMARY_RED,
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(11,27,58,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#9ca3af',
  },
  registerButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
  },
  registerLink: {
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})


