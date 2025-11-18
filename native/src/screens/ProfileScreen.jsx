import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'
const BLACK = '#000000'

export default function ProfileScreen({ navigation }) {
  // TODO: Check if user is admin from Firestore
  const isAdmin = true // Mock - replace with actual admin check
  const [isLoggedIn, setIsLoggedIn] = useState(false) // TODO: Replace with actual auth state

  const handleLogin = () => {
    // TODO: Implement login with phone and password
    Alert.alert('התחברות', 'מערכת ההתחברות עם טלפון וסיסמה תתווסף בקרוב')
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          style={styles.backButton}
          hitSlop={12}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-forward" size={28} color={BLACK} />
        </Pressable>
        <Text style={styles.headerTitle}>פרופיל</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Login Section - Show when not logged in */}
        {!isLoggedIn && (
          <View style={styles.section}>
            <View style={styles.loginCard}>
              <View style={styles.loginIconContainer}>
                <Ionicons name="person-circle-outline" size={64} color={PRIMARY_RED} />
              </View>
              <Text style={styles.loginTitle}>התחבר לחשבון שלך</Text>
              <Text style={styles.loginDesc}>
                התחבר עם מספר טלפון וסיסמה כדי לגשת לתוכן המלא
              </Text>
              <Pressable 
                style={styles.loginButton} 
                onPress={handleLogin}
                accessibilityRole="button"
              >
                <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                <Text style={styles.loginButtonText}>התחבר / הרשם</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Profile Avatar - Show when logged in */}
        {isLoggedIn && (
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={60} color={PRIMARY_RED} />
            </View>
            <Text style={styles.userName}>משתמש אורח</Text>
            <Text style={styles.userEmail}>guest@naorbaruch.com</Text>
          </View>
        )}

        {/* Profile Options - Show when logged in */}
        {isLoggedIn && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>הגדרות חשבון</Text>
            </View>

            <Pressable 
              style={styles.optionCard} 
              accessibilityRole="button"
              onPress={() => Alert.alert('בקרוב', 'עריכת פרטים אישיים תתווסף בקרוב')}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionRight}>
                  <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>פרטים אישיים</Text>
                    <Text style={styles.optionDesc}>שם, אימייל ופרטי התקשרות</Text>
                  </View>
                </View>
                <View style={styles.optionIcon}>
                  <Ionicons name="person-outline" size={22} color={PRIMARY_RED} />
                </View>
              </View>
            </Pressable>

            <Pressable 
              style={styles.optionCard} 
              accessibilityRole="button"
              onPress={() => Alert.alert('בקרוב', 'שינוי סיסמה תתווסף בקרוב')}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionRight}>
                  <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>אבטחה וסיסמה</Text>
                    <Text style={styles.optionDesc}>שינוי סיסמה והגדרות אבטחה</Text>
                  </View>
                </View>
                <View style={styles.optionIcon}>
                  <Ionicons name="lock-closed-outline" size={22} color={PRIMARY_RED} />
                </View>
              </View>
            </Pressable>

            <Pressable 
              style={styles.optionCard} 
              accessibilityRole="button"
              onPress={() => Alert.alert('בקרוב', 'הגדרות התראות תתווספנה בקרוב')}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionRight}>
                  <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>התראות</Text>
                    <Text style={styles.optionDesc}>העדפות התראות ופוש</Text>
                  </View>
                </View>
                <View style={styles.optionIcon}>
                  <Ionicons name="notifications-outline" size={22} color={PRIMARY_RED} />
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Subscription Section - Show when logged in */}
        {isLoggedIn && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>מנוי</Text>
            </View>

            <View style={styles.subscriptionCard}>
              <LinearGradient
                colors={[DEEP_BLUE, '#162a56']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.subscriptionContent}>
                <Ionicons name="star" size={32} color={PRIMARY_GOLD} />
                <Text style={styles.subscriptionTitle}>חבר פרימיום</Text>
                <Text style={styles.subscriptionDesc}>
                  גישה מלאה לכל התכנים, התראות והקהילה
                </Text>
                <Pressable 
                  style={styles.upgradeButton} 
                  accessibilityRole="button"
                  onPress={() => Alert.alert('בקרוב', 'שדרוג מנוי יופיע בקרוב')}
                >
                  <Text style={styles.upgradeButtonText}>שדרג מנוי</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Admin Section - Only visible to admins */}
        {isAdmin && isLoggedIn && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔐 ניהול</Text>
            </View>

            <Pressable 
              style={styles.optionCard} 
              accessibilityRole="button"
              onPress={() => navigation?.navigate('Admin')}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionRight}>
                  <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>עריכת כרטיסיות</Text>
                    <Text style={styles.optionDesc}>ערוך כרטיסיות ראשיות, חדשות, קורסים והתראות</Text>
                  </View>
                </View>
                <View style={[styles.optionIcon, { backgroundColor: 'rgba(220,38,38,0.15)' }]}>
                  <Ionicons name="albums-outline" size={22} color={PRIMARY_RED} />
                </View>
              </View>
            </Pressable>

            <Pressable 
              style={styles.optionCard} 
              accessibilityRole="button"
              onPress={() => navigation?.navigate('Admin')}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionRight}>
                  <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>פאנל אדמין</Text>
                    <Text style={styles.optionDesc}>ניהול מלא של התוכן וההגדרות</Text>
                  </View>
                </View>
                <View style={[styles.optionIcon, { backgroundColor: 'rgba(220,38,38,0.15)' }]}>
                  <Ionicons name="construct-outline" size={22} color={PRIMARY_RED} />
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Additional Options */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>נוספים</Text>
          </View>

          <Pressable 
            style={styles.optionCard} 
            accessibilityRole="button"
            onPress={() => navigation?.navigate('ContactRabbi')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionRight}>
                <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>עזרה ותמיכה</Text>
                  <Text style={styles.optionDesc}>שאלות נפוצות וצור קשר</Text>
                </View>
              </View>
              <View style={styles.optionIcon}>
                <Ionicons name="help-circle-outline" size={22} color={PRIMARY_RED} />
              </View>
            </View>
          </Pressable>

          <Pressable 
            style={styles.optionCard} 
            accessibilityRole="button"
            onPress={() => navigation?.navigate('About')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionRight}>
                <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>אודות</Text>
                  <Text style={styles.optionDesc}>גרסה ותנאי שימוש</Text>
                </View>
              </View>
              <View style={styles.optionIcon}>
                <Ionicons name="information-circle-outline" size={22} color={PRIMARY_RED} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Logout Button - Show when logged in */}
        {isLoggedIn && (
          <View style={styles.section}>
            <Pressable 
              style={styles.logoutButton} 
              accessibilityRole="button"
              onPress={() => {
                Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
                  { text: 'ביטול', style: 'cancel' },
                  { 
                    text: 'התנתק', 
                    style: 'destructive',
                    onPress: () => setIsLoggedIn(false)
                  }
                ])
              }}
            >
              <Ionicons name="log-out-outline" size={22} color={PRIMARY_RED} />
              <Text style={styles.logoutText}>התנתק</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingTop: Platform.select({ ios: 48, android: 34, default: 42 }),
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: BLACK,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    letterSpacing: 0.3,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  loginIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: PRIMARY_RED,
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionText: {
    alignItems: 'flex-end',
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 180,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  subscriptionContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: PRIMARY_GOLD,
    marginTop: 12,
    marginBottom: 8,
  },
  subscriptionDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: PRIMARY_GOLD,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: PRIMARY_GOLD,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(220,38,38,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
})
