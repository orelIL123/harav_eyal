import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function AboutScreen({ navigation }) {
  const { t } = useTranslation();

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
        <Text style={styles.headerTitle}>{t('about.about')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={64} color={PRIMARY_RED} />
        </View>

        <Text style={styles.title}>{t('about.institutionsName')}</Text>
        <Text style={styles.subtitle}>{t('about.rabbiName')}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('about.aboutRabbi')}</Text>
          <Text style={styles.sectionText}>
            {t('about.rabbiTitle')}
          </Text>
          <Text style={styles.sectionText}>
            {t('about.rabbiBio1')}
          </Text>
          <Text style={styles.sectionText}>
            {t('about.rabbiBio2')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('about.spreadingFaith')}</Text>
          <Text style={styles.sectionText}>
            {t('about.spreadingFaithDesc')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('about.institutionsTitle')}</Text>
          <Text style={styles.sectionSubtitle}>{t('about.institutionsSubtitle')}</Text>
          <Text style={styles.sectionText}>
            {t('about.institutionsDesc')}
          </Text>
          <Text style={styles.bulletText}>{t('about.kindergartens')}</Text>
          <Text style={styles.bulletText}>{t('about.talmudTorah')}</Text>
          <Text style={styles.bulletText}>{t('about.girlsSchool')}</Text>
          <Text style={styles.bulletText}>{t('about.yeshiva')}</Text>
          <Text style={styles.bulletText}>{t('about.kollel')}</Text>
          <Text style={styles.bulletText}>{t('about.more')}</Text>
          <Text style={styles.sectionText}>
            {t('about.institutionsVision')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('about.contact')}</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>{t('about.office')}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="print-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>{t('about.fax')}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>{t('about.email')}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.contactText}>{t('about.address')}</Text>
            </View>
            <Text style={styles.addressText}>{t('about.addressDetails')}</Text>
          </View>
          <Pressable
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactRabbi')}
          >
            <Ionicons name="mail-outline" size={20} color={PRIMARY_RED} />
            <Text style={styles.contactButtonText}>{t('about.contact')}</Text>
          </Pressable>
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
    padding: 24,
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: PRIMARY_GOLD,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textAlign: 'center',
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'right',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 4,
    paddingRight: 8,
  },
  contactInfo: {
    gap: 12,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
  },
  addressText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'right',
    paddingRight: 28,
    marginTop: -8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
    marginTop: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
  },
})

