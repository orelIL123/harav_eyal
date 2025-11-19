import React from 'react'
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const DEEP_BLUE = '#0b1b3a'

/**
 * Story Card Component - Used to generate Instagram Story image
 * Dimensions: 1080x1920 (9:16 aspect ratio)
 */
export default function StoryCard({ article, event }) {
  const content = article || event
  const isEvent = !!event
  
  // Format date if it's a string
  const formattedDate = content.date 
    ? (typeof content.date === 'string' 
        ? content.date 
        : content.date.toLocaleDateString?.('he-IL', { year: 'numeric', month: 'long', day: 'numeric' }) || content.date)
    : null

  return (
    <View style={styles.container}>
      {content.imageUrl ? (
        <ImageBackground
          source={{ uri: content.imageUrl }}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="home" size={32} color={PRIMARY_RED} />
                </View>
                <Text style={styles.logoText}>כאייל תערוג</Text>
              </View>
            </View>
            
            <View style={styles.mainContent}>
              <View style={styles.iconBadge}>
                <Ionicons 
                  name={isEvent ? "calendar" : "newspaper"} 
                  size={40} 
                  color={PRIMARY_GOLD} 
                />
              </View>
              <Text style={styles.title}>{content.title}</Text>
              {formattedDate && (
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={18} color={PRIMARY_GOLD} />
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
              )}
              {content.summary && (
                <Text style={styles.summary} numberOfLines={3}>
                  {content.summary}
                </Text>
              )}
              {content.content && content.content.length < 200 && (
                <Text style={styles.contentText} numberOfLines={4}>
                  {content.content}
                </Text>
              )}
            </View>

            <View style={styles.footer}>
              <View style={styles.footerBadge}>
                <Ionicons name="logo-instagram" size={20} color="#fff" />
                <Text style={styles.footerText}>@harav_eyal_amrami</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[PRIMARY_RED, '#b91c1c', DEEP_BLUE]}
          style={styles.container}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="home" size={32} color="#fff" />
                </View>
                <Text style={[styles.logoText, { color: '#fff' }]}>כאייל תערוג</Text>
              </View>
            </View>
            
            <View style={styles.mainContent}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons 
                  name={isEvent ? "calendar" : "newspaper"} 
                  size={40} 
                  color={PRIMARY_GOLD} 
                />
              </View>
              <Text style={[styles.title, { color: '#fff' }]}>{content.title}</Text>
              {formattedDate && (
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={18} color={PRIMARY_GOLD} />
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
              )}
              {content.summary && (
                <Text style={[styles.summary, { color: 'rgba(255,255,255,0.9)' }]} numberOfLines={3}>
                  {content.summary}
                </Text>
              )}
              {content.content && content.content.length < 200 && (
                <Text style={[styles.contentText, { color: 'rgba(255,255,255,0.85)' }]} numberOfLines={4}>
                  {content.content}
                </Text>
              )}
            </View>

            <View style={styles.footer}>
              <View style={styles.footerBadge}>
                <Ionicons name="logo-instagram" size={20} color="#fff" />
                <Text style={styles.footerText}>@harav_eyal_amrami</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 1080,
    height: 1920,
    backgroundColor: PRIMARY_RED,
  },
  background: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 60,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  iconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 56,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 70,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  dateText: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_GOLD,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  summary: {
    fontSize: 32,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 44,
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: 900,
  },
  contentText: {
    fontSize: 28,
    fontFamily: 'Poppins_400Regular',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: 900,
  },
  footer: {
    alignItems: 'center',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 999,
  },
  footerText: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
})

