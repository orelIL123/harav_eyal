import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Pressable, Animated, Platform, Dimensions, Image, ImageBackground, ScrollView, Share, Alert, Linking, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
// Conditional import for native-only module (not available on web)
let Grayscale = null
if (Platform.OS !== 'web') {
  try {
    Grayscale = require('react-native-color-matrix-image-filters').Grayscale
  } catch (e) {
    // Fallback if module not available
    Grayscale = ({ children }) => children
  }
} else {
  // Web fallback - just return children
  Grayscale = ({ children }) => children
}
import { useTranslation } from 'react-i18next'
import i18n from './config/i18n'
import { getAlerts, updateAlert, deleteAlert, getUnreadAlertsCount, markAlertAsViewed } from './services/alertsService'
import { getPodcasts } from './services/podcastsService'
import { getDailyInsightLastUpdated } from './services/cardsService'
import { getDailyInsightLastViewed, saveDailyInsightLastViewed } from './utils/storage'
import { getPrimaryWhatsAppGroup } from './services/whatsappGroupsService'
import { FAITH_TOPICS } from './data/faithTopics'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'
const BLACK = '#000000'

const CARDS = [
  { key: 'faith-daily', title: 'home.faithBoost', desc: 'home.faithBoostDesc', icon: 'sparkles-outline', image: require('../assets/photos/זריקת אמונה.png') },
  { key: 'lessons', title: 'home.lessonsLibrary', desc: 'home.lessonsLibraryDesc', icon: 'library-outline', image: require('../assets/photos/שיעורי_הרב.jpg') },
  { key: 'institutions', title: 'home.rabbiInstitutions', desc: 'home.rabbiInstitutionsDesc', icon: 'school-outline', image: require('../assets/icon.png') },
  { key: 'lessons-library', title: 'סרטוני אמונה', desc: 'סרטוני אמונה של הרב', icon: 'library-outline', image: require('../assets/photos/שיעורי_הרב.jpg') },
  { key: 'flyers', title: 'עלונים', desc: 'עלונים שבועיים ופרסומים', icon: 'document-text-outline', image: require('../assets/alonim.png') },
  { key: 'books', title: 'home.books', desc: 'home.booksDesc', icon: 'book-outline', image: require('../assets/photos/ספרים/hbooks183_06072020180826.jpg') },
  { key: 'contact', title: 'home.contactTab', desc: 'home.contactTabDesc', icon: 'mail-outline', image: require('../assets/icon.png') },
]

// Carousel image order
const IMAGES = [
  require('../assets/photos/ספרים/hbooks183_06072020180826.jpg'),
  require('../assets/photos/זריקת אמונה.png'),
  require('../assets/photos/שיעורי_הרב.jpg'),
  require('../assets/icon.png'),
]

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Helper function to extract YouTube ID from URL
function extractYouTubeId(url) {
  if (!url) return null
  
  const cleanUrl = url.trim()
  
  const patterns = [
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|&|$)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  const fallbackPattern = /(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const fallbackMatch = cleanUrl.match(fallbackPattern)
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1]
  }
  
  return null
}

// Bottom Nav Constants
const TAB_HEIGHT = 80
const FAB_RADIUS = SCREEN_WIDTH < 380 ? 39 : 43
const FAB_MARGIN = 8
const CENTER_WIDTH = (FAB_RADIUS + FAB_MARGIN) * 2.2

function useFadeIn(delay = 0) {
  const anim = useMemo(() => new Animated.Value(0), [])
  React.useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start()
  }, [anim, delay])
  return anim
}

// ============ NEW DESIGN COMPONENTS ============

const HeroCard = ({ item, onPress, hasNewDailyInsight }) => {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.heroCard,
        pressed && styles.cardPressed
      ]}
    >
      <ImageBackground
        source={item.image}
        style={styles.heroImage}
        imageStyle={{ borderRadius: 20 }}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadgeContainer}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                <Text style={styles.heroBadgeText}>{t('עיקר העבודה היא האמונה')}</Text>
              </View>
              {hasNewDailyInsight && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroTitle}>{t(item.title)}</Text>
            <Text style={styles.heroDesc} numberOfLines={2}>{t(item.desc)}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
};

const GridCard = ({ item, onPress, index }) => {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.gridCard,
        pressed && styles.cardPressed,
        Platform.select({
          android: index % 2 === 0 ? { marginLeft: 8 } : { marginRight: 8 },
          default: index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }
        })
      ]}
    >
      <View style={styles.gridCardIconContainer}>
        <Ionicons name={item.icon} size={24} color={PRIMARY_RED} />
      </View>
      <Text style={styles.gridCardTitle} numberOfLines={1}>{t(item.title)}</Text>
      <Text style={styles.gridCardDesc} numberOfLines={2}>{t(item.desc)}</Text>
    </Pressable>
  );
};

// Center FAB Button with spin animation on press
const CenterFabButton = ({ onPress, screenWidth }) => {
  const spinValue = React.useRef(new Animated.Value(0)).current

  const handlePress = () => {
    // Start spinning animation on press
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0)
    })
    onPress?.()
  }

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const fabRadius = screenWidth < 380 ? 39 : 43
  const fabSize = screenWidth < 380 ? 78 : 86
  const fabHalfSize = fabSize / 2

  return (
    <View style={[styles.centerFab, { 
      left: screenWidth / 2 - fabHalfSize,
    }]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)']}
        style={[styles.fabGradient, { width: fabSize, height: fabSize, borderRadius: fabRadius }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable style={[styles.fab, { borderRadius: screenWidth < 380 ? 37 : 41 }]} onPress={handlePress}>
          <Animated.Image
            source={require('../assets/spining_bootom.png')}
            style={[styles.fabIcon, { width: screenWidth < 380 ? 104 : 112, height: screenWidth < 380 ? 104 : 112, transform: [{ rotate: spin }] }]}
            resizeMode="cover"
          />
        </Pressable>
      </LinearGradient>
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { width } = Dimensions.get('window')

  const [activeTab, setActiveTab] = React.useState('home')
  const quote = t('עיקר העבודה היא האמונה')
  const quoteText = t('home.quoteText')
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [activeAlerts, setActiveAlerts] = React.useState([])
  const [podcasts, setPodcasts] = React.useState([])
  const [loadingPodcasts, setLoadingPodcasts] = React.useState(true)
  const [hasNewDailyInsight, setHasNewDailyInsight] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [primaryWhatsAppGroup, setPrimaryWhatsAppGroup] = React.useState(null)
  const notificationsAnim = React.useRef(new Animated.Value(0)).current
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  // Fade in animation on mount
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  // Load and filter alerts
  React.useEffect(() => {
    let isMounted = true // Flag to prevent state updates after unmount

    const loadAlerts = async () => {
      try {
        const allAlerts = await getAlerts(true)

        // Check if component is still mounted before updating state
        if (!isMounted) return

        const now = new Date()

        // Filter active alerts that haven't expired
        const validAlerts = allAlerts.filter(alert => {
          if (!alert.expiresAt) return true
          const expiresAt = alert.expiresAt.toDate ? alert.expiresAt.toDate() : new Date(alert.expiresAt)
          return expiresAt > now
        })

        // Auto-delete expired alerts (after 24 hours)
        const expiredAlerts = allAlerts.filter(alert => {
          if (!alert.expiresAt) return false
          const expiresAt = alert.expiresAt.toDate ? alert.expiresAt.toDate() : new Date(alert.expiresAt)
          return expiresAt <= now
        })

        // Delete expired alerts completely
        for (const alert of expiredAlerts) {
          try {
            await deleteAlert(alert.id)
          } catch (error) {
            console.error('Error deleting expired alert:', error)
            // Fallback: deactivate if delete fails
            try {
              await updateAlert(alert.id, { isActive: false })
            } catch (updateError) {
              console.error('Error deactivating expired alert:', updateError)
            }
          }
        }

        // Only update state if component is still mounted
        if (isMounted) {
          setActiveAlerts(validAlerts)
          // Get unread count based on viewed alerts
          const count = await getUnreadAlertsCount()
          setUnreadCount(count)
        }
      } catch (error) {
        console.error('Error loading alerts:', error)
      }
    }

    loadAlerts()
    // Refresh every 5 minutes
    const interval = setInterval(loadAlerts, 5 * 60 * 1000)

    // Cleanup function
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Load podcasts
  React.useEffect(() => {
    let isMounted = true

    const loadPodcasts = async () => {
      try {
        setLoadingPodcasts(true)
        const allPodcasts = await getPodcasts()

        if (!isMounted) return

        // Show only first 5 podcasts on home screen
        const limitedPodcasts = Array.isArray(allPodcasts) ? allPodcasts.slice(0, 5) : []
        setPodcasts(limitedPodcasts)
      } catch (error) {
        console.error('Error loading podcasts:', error)
        if (isMounted) {
          setPodcasts([])
        }
      } finally {
        if (isMounted) {
          setLoadingPodcasts(false)
        }
      }
    }

    loadPodcasts()

    return () => {
      isMounted = false
    }
  }, [])

  // Check for new daily insight updates
  React.useEffect(() => {
    let isMounted = true

    const checkForNewDailyInsight = async () => {
      try {
        const lastUpdated = await getDailyInsightLastUpdated()
        const lastViewed = await getDailyInsightLastViewed()

        if (!isMounted) return

        // If there's an update and user hasn't viewed it yet, or update is newer than last viewed
        if (lastUpdated) {
          if (!lastViewed || lastUpdated > lastViewed) {
            setHasNewDailyInsight(true)
          } else {
            setHasNewDailyInsight(false)
          }
        } else {
          setHasNewDailyInsight(false)
        }
      } catch (error) {
        console.error('Error checking for new daily insight:', error)
      }
    }

    checkForNewDailyInsight()
    // Check every 30 seconds
    const interval = setInterval(checkForNewDailyInsight, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const handleDismissAlert = async (alertId) => {
    try {
      await updateAlert(alertId, { isActive: false })
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error dismissing alert:', error)
    }
  }

  const onShareQuote = React.useCallback(() => {
    Share.share({
      message: `"${quote}"

"${quoteText}"`
    }).catch(() => { })
  }, [quote, quoteText])

  const handleCardPress = React.useCallback(async (key) => {
    if (key === 'faith-daily') {
      // Mark as viewed when user opens the screen
      await saveDailyInsightLastViewed()
      setHasNewDailyInsight(false)
      navigation?.navigate('DailyInsight')
      return
    }
    if (key === 'flyers') {
      navigation?.navigate('Flyers')
      return
    }
    if (key === 'books') {
      navigation?.navigate('Books')
      return
    }
    if (key === 'institutions') {
      navigation?.navigate('Institutions')
      return
    }
    if (key === 'lessons') {
      navigation?.navigate('WeeklyLessons')
      return
    }
    if (key === 'contact') {
      navigation?.navigate('ContactRabbi')
      return
    }
    if (key === 'lessons-library') {
      navigation?.navigate('LessonsLibrary')
      return
    }
    Alert.alert(t('home.comingSoon'), t('home.screenInDevelopment'))
  }, [navigation, t])

  // Animate notifications dropdown
  React.useEffect(() => {
    if (notificationsOpen) {
      Animated.spring(notificationsAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(notificationsAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [notificationsOpen, notificationsAnim])

  const handleNotificationPress = React.useCallback(() => {
    setNotificationsOpen(!notificationsOpen)
  }, [notificationsOpen])

  const handleCloseNotifications = React.useCallback(() => {
    setNotificationsOpen(false)
  }, [])

  const handleNotificationItemPress = React.useCallback(async (alert) => {
    await markAlertAsViewed(alert.id)
    // Refresh unread count
    const count = await getUnreadAlertsCount()
    setUnreadCount(count)
  }, [])

  const openSocialLink = React.useCallback((url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('home.error'), t('home.linkError'))
    })
  }, [t])

  // Split cards into Hero (Daily Insight) and Grid (others)
  const heroItem = CARDS.find(c => c.key === 'faith-daily');
  const gridItems = CARDS.filter(c => c.key !== 'faith-daily');

  return (
    <Animated.View style={[styles.screen, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          style={styles.headerMenu}
          hitSlop={12}
          onPress={() => navigation?.navigate('SideMenu')}
        >
          <Ionicons name="menu-outline" size={28} color={BLACK} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.headerBell}
          hitSlop={12}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={31} color={BLACK} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.title, i18n.language === 'en' && styles.titleEnglish]}>{t('home.rabbiName')}</Text>
          <Text style={styles.subtitle}>{t('home.tagline')}</Text>
        </View>
      </View>

      {/* Notifications Dropdown */}
      {notificationsOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <Pressable
            style={styles.notificationsBackdrop}
            onPress={handleCloseNotifications}
          />
          <Animated.View
            style={[
              styles.notificationsDropdown,
              {
                opacity: notificationsAnim,
                transform: [
                  {
                    translateY: notificationsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                  {
                    scale: notificationsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              }
            ]}
          >
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>התראות</Text>
              <Pressable onPress={handleCloseNotifications} hitSlop={8}>
                <Ionicons name="close" size={24} color={BLACK} />
              </Pressable>
            </View>
          <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
            {activeAlerts.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyNotificationsText}>אין התראות חדשות</Text>
              </View>
            ) : (
              activeAlerts.map((alert) => {
                const priorityColors = {
                  high: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
                  medium: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
                  low: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' }
                }
                const colors = priorityColors[alert.priority] || priorityColors.medium

                return (
                  <Pressable
                    key={alert.id}
                    style={[styles.notificationItem, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}
                    onPress={() => handleNotificationItemPress(alert)}
                  >
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationTitle, { color: colors.text }]}>{alert.title}</Text>
                      {alert.message && (
                        <Text style={[styles.notificationMessage, { color: colors.text }]} numberOfLines={2}>
                          {alert.message}
                        </Text>
                      )}
                    </View>
                    {alert.imageUrl && (
                      <Image
                        source={{ uri: alert.imageUrl }}
                        style={styles.notificationImage}
                        resizeMode="cover"
                      />
                    )}
                  </Pressable>
                )
              })
            )}
          </ScrollView>
        </Animated.View>
        </>
      )}

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <View style={styles.alertsBanner}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alertsScrollContent}>
            {activeAlerts.map((alert) => {
              const priorityColors = {
                high: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
                medium: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
                low: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' }
              }
              const colors = priorityColors[alert.priority] || priorityColors.medium
              
              return (
                <View key={alert.id} style={[styles.alertBanner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  {alert.imageUrl && (
                    <Image 
                      source={{ uri: alert.imageUrl }} 
                      style={styles.alertBannerImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.alertBannerContent}>
                    <Text style={[styles.alertBannerTitle, { color: colors.text }]}>{alert.title}</Text>
                    <Text style={[styles.alertBannerMessage, { color: colors.text }]} numberOfLines={1}>
                      {alert.message}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.alertDismissButton}
                    onPress={() => handleDismissAlert(alert.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={18} color={colors.text} />
                  </Pressable>
                </View>
              )
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          {heroItem && (
            <View style={styles.section}>
              <HeroCard
                item={heroItem}
                onPress={() => handleCardPress(heroItem.key)}
                hasNewDailyInsight={hasNewDailyInsight}
              />
            </View>
          )}

          {/* Grid Section */}
          <View style={styles.section}>
            <View style={styles.gridContainer}>
              {gridItems.map((item, index) => (
                <View key={item.key} style={styles.gridItemWrapper}>
                  <GridCard
                item={item}
                index={index}
                onPress={() => handleCardPress(item.key)}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Quote */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.tagline')}</Text>
            </View>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{quote}"</Text>
              <Text style={styles.quoteSubText}>"{quoteText}"</Text>
              <View style={styles.quoteFooter}>
                <Pressable onPress={onShareQuote} style={styles.shareBtn} accessibilityRole="button">
                  <Ionicons name="share-social-outline" size={16} color="#ffffff" />
                  <Text style={styles.shareBtnText}>{t('home.share')}</Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.donationLinkBtn}
                onPress={() => {
                  const donationUrl = 'https://www.jgive.com/new/he/ils/donation-targets/142539?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPMTI0MDI0NTc0Mjg3NDE0AAGneTs411D0SUzm0ox_gnuWPlxtVYAo5WTjwYpjMtO5LF7NsfEFaSluhrNTOGE_aem_C7zwEIXjMrBF46Exo9F4Jg'
                  openSocialLink(donationUrl)
                }}
                accessibilityRole="button"
              >
                <Ionicons name="heart" size={18} color={PRIMARY_RED} />
                <Text style={styles.donationLinkText}>{t('home.donation')}</Text>
              </Pressable>
            </View>
          </View>

          {/* Faith Learning Topics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>לימודי אמונה</Text>
              <Text style={styles.faithSubtitle}>לימוד ממוקד לחיזוק האמונה</Text>
            </View>
            <View style={styles.faithTopicsGrid}>
              {FAITH_TOPICS.map(topic => (
                <Pressable
                  key={topic.key}
                  style={styles.faithTopicCard}
                  onPress={() => navigation?.navigate('FaithLearning', { category: topic.key })}
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={[`${topic.color}15`, `${topic.color}08`]}
                    style={styles.faithTopicGradient}
                  >
                    <View style={[styles.faithTopicIcon, { backgroundColor: `${topic.color}20` }]}>
                      <Ionicons name="sparkles" size={20} color={topic.color} />
                    </View>
                    <Text style={styles.faithTopicTitle}>{topic.title}</Text>
                    <Text style={styles.faithTopicHint} numberOfLines={1}>לחץ ללימוד מעמיק</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>

          {/* YouTube Link */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.youtube')}</Text>
            </View>
            <Pressable
              style={styles.youtubeCard}
              onPress={() => openSocialLink('https://youtube.com/@rabbieyalamrami?si=aeiBPpBARJfBq5jF')}
              accessibilityRole="button"
            >
              <Image
                source={require('../assets/photos/youtube/3094A982-37D9-47CE-B017-6F6917C4A3FA.jpeg')}
                style={styles.youtubeImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.0)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.youtubeOverlay}>
                <Ionicons name="logo-youtube" size={40} color={PRIMARY_RED} />
                <Text style={styles.youtubeText}>{t('home.youtubeChannel')}</Text>
              </View>
            </Pressable>
          </View>

          {/* Social Media Icons */}
          <View style={styles.section}>
            <View style={styles.socialIconsContainer}>
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => openSocialLink('https://www.instagram.com/harav_eyal_amrami?igsh=aWRqeDVmZXQ2cW44')}
                accessibilityRole="button"
                accessibilityLabel={t('home.instagram')}
              >
                <Ionicons name="logo-instagram" size={32} color="#E4405F" />
              </Pressable>
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => openSocialLink('https://www.facebook.com/share/1DU65z7iee/?mibextid=wwXIfr')}
                accessibilityRole="button"
                accessibilityLabel={t('home.facebook')}
              >
                <Ionicons name="logo-facebook" size={32} color="#1877F2" />
              </Pressable>
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => openSocialLink('https://youtube.com/@rabbieyalamrami?si=aeiBPpBARJfBq5jF')}
                accessibilityRole="button"
                accessibilityLabel={t('home.youtube')}
              >
                <Ionicons name="logo-youtube" size={32} color="#FF0000" />
              </Pressable>
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => {
                  const whatsappMessage = encodeURIComponent('היי תצרפו אותי לקבוצה של הרב!')
                  let whatsappUrl = primaryWhatsAppGroup?.url || 'https://chat.whatsapp.com/LDY1KQlNKz4CULkirL3e7c?mode=hqrc'
                  // Add text parameter - use & if URL already has parameters, otherwise use ?
                  const separator = whatsappUrl.includes('?') ? '&' : '?'
                  whatsappUrl = `${whatsappUrl}${separator}text=${whatsappMessage}`
                  openSocialLink(whatsappUrl)
                }}
                accessibilityRole="button"
                accessibilityLabel={t('home.whatsapp')}
              >
                <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
              </Pressable>
            </View>
          </View>

          {/* Podcasts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.podcasts')}</Text>
              {podcasts.length > 0 && (
                <Pressable
                  onPress={() => navigation?.navigate('Podcasts')}
                  accessibilityRole="button"
                >
                  <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
                </Pressable>
              )}
            </View>
            {loadingPodcasts ? (
              <View style={styles.podcastLoadingContainer}>
                <ActivityIndicator size="small" color={PRIMARY_RED} />
                <Text style={styles.podcastLoadingText}>{t('home.loadingPodcasts')}</Text>
              </View>
            ) : podcasts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.podcastRow}>
                {podcasts.map((podcast) => (
                  <View key={podcast.id} style={styles.podcastCardWrapper}>
                    <Text style={styles.podcastCardTitle} numberOfLines={2}>{podcast.title}</Text>
                    <Pressable
                      style={styles.podcastCard}
                    onPress={() => {
                      // Navigate to podcast player or YouTube video
                      if (podcast.youtubeUrl || podcast.youtubeVideoId) {
                        const videoId = podcast.youtubeVideoId || (podcast.youtubeUrl ? extractYouTubeId(podcast.youtubeUrl) : null)
                        if (videoId) {
                          navigation?.navigate('VideoPlayer', { 
                            videoId, 
                            title: podcast.title,
                            url: podcast.youtubeUrl 
                          })
                        } else {
                          Alert.alert(t('home.comingSoon'), t('home.podcastDesc'))
                        }
                      } else if (podcast.audioUrl) {
                        navigation?.navigate('PodcastPlayer', { podcast })
                      } else {
                        Alert.alert(t('home.comingSoon'), t('home.podcastDesc'))
                      }
                    }}
                    accessibilityRole="button"
                  >
                    {(() => {
                      // Priority: thumbnailUrl > YouTube thumbnail > icon
                      if (podcast.thumbnailUrl) {
                        return (
                          <Image 
                            source={{ uri: podcast.thumbnailUrl }} 
                            style={styles.podcastThumbnail}
                            resizeMode="cover"
                          />
                        )
                      } else if (podcast.youtubeVideoId || (podcast.youtubeUrl && extractYouTubeId(podcast.youtubeUrl))) {
                        const videoId = podcast.youtubeVideoId || extractYouTubeId(podcast.youtubeUrl)
                        return (
                          <View style={styles.podcastThumbnailContainer}>
                            <Image 
                              source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }} 
                              style={[styles.podcastThumbnail, { marginBottom: 0 }]}
                              resizeMode="cover"
                            />
                            <View style={styles.youtubePlayIcon}>
                              <Ionicons name="play-circle" size={32} color="#fff" />
                            </View>
                          </View>
                        )
                      } else {
                        return (
                          <View style={styles.podcastIconContainer}>
                            <Ionicons name="headset-outline" size={34} color={PRIMARY_RED} />
                          </View>
                        )
                      }
                    })()}
                      {podcast.description && (
                        <Text style={styles.podcastDesc} numberOfLines={1}>{podcast.description}</Text>
                      )}
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.podcastEmptyContainer}>
                <Ionicons name="headset-outline" size={32} color="#d1d5db" />
                <Text style={styles.podcastEmptyText}>{t('home.noPodcasts')}</Text>
              </View>
            )}
          </View>

          {/* Partnership Section */}
          <View style={styles.partnershipSection}>
            <LinearGradient
              colors={[DEEP_BLUE, '#1e3a5f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.partnershipGradient}
            >
              <View style={styles.partnershipContent}>
                <Text style={styles.partnershipTitle}>אתם יכולים להיות שותפים של הרב!</Text>
                
                <View style={styles.partnershipRabbiInfo}>
                  <Text style={styles.partnershipRabbiName}>הרב הגאון אייל עמרמי שליט״א</Text>
                  <Text style={styles.partnershipRabbiRole}>ראש מוסדות כאייל תערוג</Text>
                </View>

                <Text style={styles.partnershipIntro}>
                  מציע לכם להיות שותפים של ממש בכל פעילות המוסדות ולקנות זכויות לנצח!
                </Text>

                <View style={styles.partnershipList}>
                  <View style={styles.partnershipListItem}>
                    <Ionicons name="flame" size={16} color={PRIMARY_GOLD} />
                    <Text style={styles.partnershipListText}>הפצת האמונה וזיכוי הרבים</Text>
                  </View>
                  <View style={styles.partnershipListItem}>
                    <Ionicons name="restaurant" size={16} color={PRIMARY_GOLD} />
                    <Text style={styles.partnershipListText}>בית התבשיל</Text>
                  </View>
                  <View style={styles.partnershipListItem}>
                    <Ionicons name="heart" size={16} color={PRIMARY_GOLD} />
                    <Text style={styles.partnershipListText}>חלוקה לנזקקים</Text>
                  </View>
                  <View style={styles.partnershipListItem}>
                    <Ionicons name="library" size={16} color={PRIMARY_GOLD} />
                    <Text style={styles.partnershipListText}>כולל אברכים</Text>
                  </View>
                  <View style={styles.partnershipListItem}>
                    <Ionicons name="shield" size={16} color={PRIMARY_GOLD} />
                    <Text style={styles.partnershipListText}>חלוקה לחיילים בבסיסים</Text>
                  </View>
                  <View style={styles.partnershipListItem}>
                    <Ionicons name="school" size={16} color={PRIMARY_GOLD} />
                    <Text style={styles.partnershipListText}>ישיבה לחוזרים בתשובה</Text>
                  </View>
                  <View style={styles.partnershipListItem}>
                    <Ionicons name="ellipsis-horizontal" size={16} color={PRIMARY_GOLD} />
                    <Text style={styles.partnershipListText}>ועוד ועוד...</Text>
                  </View>
                </View>

                <Text style={styles.partnershipOpportunity}>
                  זו ההזדמנות שלכם לקנות נצח!
                </Text>

                <View style={styles.partnershipFooter}>
                  <Text style={styles.partnershipFooterTitle}>מוסדות כאייל תערוג</Text>
                  <Text style={styles.partnershipFooterSubtitle}>אמונה תורה וחסד במקום אחד</Text>
                </View>

                <Pressable
                  style={styles.partnershipButton}
                  onPress={() => {
                    // Use primary WhatsApp group or fallback to new group link
                    const whatsappMessage = encodeURIComponent('היי תצרפו אותי לקבוצה של הרב!')
                    let whatsappUrl = primaryWhatsAppGroup?.url || 'https://chat.whatsapp.com/LDY1KQlNKz4CULkirL3e7c?mode=hqrc'
                    // Add text parameter - use & if URL already has parameters, otherwise use ?
                    const separator = whatsappUrl.includes('?') ? '&' : '?'
                    whatsappUrl = `${whatsappUrl}${separator}text=${whatsappMessage}`
                    Linking.openURL(whatsappUrl).catch(() => {
                      Alert.alert('שגיאה', 'לא ניתן לפתוח את וואטסאפ')
                    })
                  }}
                >
                  <LinearGradient colors={[PRIMARY_GOLD, '#ffed4e']} style={styles.partnershipButtonGradient}>
                    <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                    <Text style={styles.partnershipButtonText}>אני רוצה להצטרף</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </View>

          {/* Memorial Section */}
          <View style={styles.memorialSection}>
            <Ionicons name="flame" size={16} color="#DC2626" />
            <Text style={styles.memorialText}>לעילוי נשמת: רוז׳ה אהרון בן רחל</Text>
            <Ionicons name="flame" size={16} color="#DC2626" />
          </View>

          {/* Memorial Section */}
          <View style={[styles.memorialSection, { marginTop: -8 }]}>
            <Ionicons name="flame" size={16} color="#DC2626" />
            <Text style={styles.memorialText}>לעילוי נשמת: אביבה בת דליה</Text>
            <Ionicons name="flame" size={16} color="#DC2626" />
          </View>

          {/* Powered by footer */}
          <Pressable
            style={styles.poweredByFooter}
            onPress={() => {
              const phone = '972523985505'
              const message = encodeURIComponent('אהבתי את האפליקציה של הרב אייל עמרמי! אשמח לשמוע פרטים על אפליקציה לעסק.')
              Linking.openURL(`https://wa.me/${phone}?text=${message}`)
            }}
          >
            <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
            <Text style={styles.poweredByText}>Powered by Orel Aharon</Text>
          </Pressable>

        </ScrollView>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNavWrapper}>
        {/* Background */}
        <View style={styles.bottomNavBackground} />

        <View style={styles.navBar}>
          {/* Left Side */}
          <View style={styles.leftSide}>
            <Pressable
              accessibilityRole="button"
              style={styles.iconBtn}
              onPress={() => { setActiveTab('home'); navigation?.navigate('Home') }}
            >
              <View style={activeTab === 'home' ? styles.iconGlow : null}>
                <Ionicons name="home" size={22} color={activeTab === 'home' ? '#FFD700' : '#fff'} />
              </View>
              <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>בית</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.iconBtn}
              onPress={() => { setActiveTab('contact'); navigation?.navigate('ContactRabbi') }}
            >
              <View style={activeTab === 'contact' ? styles.iconGlow : null}>
                <Ionicons name="mail" size={22} color={activeTab === 'contact' ? '#FFD700' : '#fff'} />
              </View>
              <Text style={[styles.navLabel, activeTab === 'contact' && styles.navLabelActive]}>צור קשר</Text>
            </Pressable>
          </View>

          {/* Center FAB */}
          <CenterFabButton
            screenWidth={width}
            onPress={() => { 
              setActiveTab('shortLessons'); 
              navigation?.navigate('LessonsLibrary', { initialCategory: 'shortLessons' })
            }}
          />

          {/* Right Side */}
          <View style={styles.rightSide}>
            <Pressable
              accessibilityRole="button"
              style={styles.iconBtn}
              onPress={() => { setActiveTab('community'); navigation?.navigate('CommunityNews') }}
            >
              <View style={activeTab === 'community' ? styles.iconGlow : null}>
                <Ionicons name="newspaper" size={22} color={activeTab === 'community' ? '#FFD700' : '#fff'} />
              </View>
              <Text style={[styles.navLabel, activeTab === 'community' && styles.navLabelActive]}>חדשות</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.iconBtn}
              onPress={() => { setActiveTab('profile'); navigation?.navigate('Profile') }}
            >
              <View style={activeTab === 'profile' ? styles.iconGlow : null}>
                <Ionicons name="person" size={22} color={activeTab === 'profile' ? '#FFD700' : '#fff'} />
              </View>
              <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>פרופיל</Text>
            </Pressable>
          </View>
        </View>

        {/* Home Indicator */}
        <View style={styles.homeIndicatorWrapper}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </Animated.View>
  )
}



const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    ...Platform.select({
      android: {
        direction: 'rtl',
      },
    }),
  },
  header: {
    paddingTop: Platform.select({ ios: 48, android: 34, default: 42 }),
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 6,
  },
  headerMenu: {
    position: 'absolute',
    left: 16,
    top: Platform.select({ ios: 54, android: 52, default: 48 }),
    zIndex: 10,
  },
  headerBell: {
    position: 'absolute',
    right: 16,
    top: Platform.select({ ios: 54, android: 52, default: 48 }),
    zIndex: 10,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: BG,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
  },
  title: {
    color: BLACK,
    fontSize: 28,
    fontWeight: '700',
    maxWidth: '70%',
    fontFamily: 'CinzelDecorative_700Bold',
    letterSpacing: 3,
    textShadowColor: 'rgba(220,38,38,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'right',
    ...Platform.select({
      android: {
        textAlign: 'right',
        writingDirection: 'rtl',
      },
    }),
  },
  titleEnglish: {
    fontSize: 20,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.5,
    textAlign: 'right',
    ...Platform.select({
      android: {
        textAlign: 'right',
        writingDirection: 'rtl',
      },
    }),
  },
  main: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 72,
    marginTop: -4,
    ...Platform.select({
      android: {
        direction: 'rtl',
      },
    }),
  },
  scrollContent: {
    paddingBottom: 92,
    gap: 20,
  },
  section: {
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: DEEP_BLUE,
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.3,
    textAlign: 'right',
    ...Platform.select({
      android: {
        textAlign: 'right',
        writingDirection: 'rtl',
      },
    }),
  },

  // Hero Card Styles
  heroCard: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    gap: 8,
  },
  heroBadgeContainer: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heroBadge: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Heebo_700Bold',
    textAlign: Platform.select({ android: 'right', default: 'left' }),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    textAlign: Platform.select({ android: 'right', default: 'left' }),
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  newBadge: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
  },

  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItemWrapper: {
    width: '50%',
    padding: 8,
  },
  gridCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  gridCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(220,38,38,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  gridCardDesc: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    textAlign: 'center',
    lineHeight: 16,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Quote Styles
  quoteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  quoteText: {
    color: DEEP_BLUE,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'right',
    fontFamily: 'Heebo_900Black',
    letterSpacing: 0.2,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  quoteSubText: {
    color: PRIMARY_RED,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'right',
    fontFamily: 'Heebo_900Black',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  quoteFooter: {
    marginTop: 10,
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareBtn: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: Platform.select({ android: 'right', default: 'center' }),
  },
  donationLinkBtn: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  donationLinkText: {
    color: PRIMARY_RED,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: Platform.select({ android: 'right', default: 'center' }),
  },

  // Social & YouTube
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 16,
  },
  socialIconBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
  },
  youtubeCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  youtubeImage: {
    width: '100%',
    height: '100%',
  },
  youtubeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    gap: 12,
  },
  youtubeText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: Platform.select({ android: 'right', default: 'left' }),
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },

  // Podcasts
  podcastRow: {
    gap: 12,
    paddingHorizontal: 2,
  },
  podcastCardWrapper: {
    width: 200,
    alignItems: 'flex-end',
  },
  podcastCardTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
    marginBottom: 8,
    paddingHorizontal: 4,
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  podcastCard: {
    width: 200,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    padding: 16,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  podcastTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  podcastDesc: {
    color: '#6b7280',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 6,
    textAlign: 'right',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  podcastCategoryBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(220,38,38,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
    marginTop: 4,
  },
  podcastCategoryBadgeText: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  podcastThumbnailContainer: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  podcastThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 14,
  },
  youtubePlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastIconContainer: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  podcastLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  podcastLoadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  podcastEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  podcastEmptyText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#9ca3af',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY_RED,
    textAlign: 'right',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },

  // Partnership
  partnershipSection: {
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  partnershipGradient: {
    padding: 20,
  },
  partnershipContent: {
    alignItems: 'center',
  },
  partnershipTitle: {
    color: PRIMARY_GOLD,
    fontSize: 22,
    fontFamily: 'Heebo_900Black',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  partnershipRabbiInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  partnershipRabbiName: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    marginBottom: 2,
  },
  partnershipRabbiRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  partnershipIntro: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Heebo_500Medium',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  partnershipList: {
    width: '100%',
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  partnershipListItem: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  partnershipListText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Heebo_400Regular',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  partnershipOpportunity: {
    color: PRIMARY_GOLD,
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  partnershipFooter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  partnershipFooterTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Heebo_700Bold',
  },
  partnershipFooterSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  partnershipButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: PRIMARY_GOLD,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  partnershipButtonGradient: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  partnershipButtonText: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Heebo_900Black',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },

  // Memorial
  memorialSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    opacity: 0.8,
  },
  memorialText: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },

  // Footer
  poweredByFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    opacity: 0.6,
  },
  poweredByText: {
    color: '#6b7280',
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
  },

  // Bottom Nav
  bottomNavWrapper: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    height: TAB_HEIGHT,
  },
  bottomNavBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PRIMARY_RED,
    zIndex: 0,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingTop: 15,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    zIndex: 100,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 10,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Heebo_400Regular',
    marginTop: 3,
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#FFD700',
    fontFamily: 'Heebo_700Bold',
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  iconGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  centerFab: {
    position: 'absolute',
    top: -35,
    zIndex: 101,
  },
  fabGradient: {
    padding: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 30,
  },
  fab: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  fabIcon: {
    borderRadius: 56,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 25,
  },
  homeIndicatorWrapper: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
    width: '100%',
    zIndex: 102,
  },
  homeIndicator: {
    width: 130,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 100,
    opacity: 0.3,
  },

  // Notifications
  notificationsDropdown: {
    position: 'absolute',
    top: Platform.select({ ios: 90, android: 80, default: 85 }),
    right: 16,
    width: SCREEN_WIDTH - 32,
    maxWidth: 400,
    maxHeight: 500,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
    overflow: 'hidden',
  },
  notificationsHeader: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  notificationsTitle: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: DEEP_BLUE,
    textAlign: Platform.select({ android: 'right', default: 'left' }),
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  notificationsList: {
    maxHeight: 440,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Heebo_500Medium',
    color: '#9ca3af',
    textAlign: 'center',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  notificationItem: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderLeftWidth: Platform.select({ android: 0, default: 4 }),
    borderRightWidth: Platform.select({ android: 4, default: 0 }),
  },
  notificationContent: {
    flex: 1,
    paddingRight: Platform.select({ android: 0, default: 12 }),
    paddingLeft: Platform.select({ android: 12, default: 0 }),
  },
  notificationTitle: {
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    marginBottom: 4,
    textAlign: Platform.select({ android: 'right', default: 'left' }),
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    lineHeight: 20,
    textAlign: Platform.select({ android: 'right', default: 'left' }),
  },
  notificationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  notificationsBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },

  // Alerts Banner
  alertsBanner: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    maxHeight: 100,
  },
  alertsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  alertBanner: {
    flexDirection: Platform.select({ android: 'row-reverse', default: 'row' }),
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 280,
    maxWidth: 320,
    gap: 10,
  },
  alertBannerImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  alertBannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  alertBannerTitle: {
    fontSize: 13,
    fontFamily: 'Heebo_700Bold',
    marginBottom: 2,
    textAlign: Platform.select({ android: 'right', default: 'left' }),
  },
  alertBannerMessage: {
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    textAlign: Platform.select({ android: 'right', default: 'left' }),
  },
  alertDismissButton: {
    padding: 4,
  },

  // Faith Learning Topics
  faithSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    fontFamily: 'Heebo_400Regular',
    textAlign: 'right',
    marginTop: 4,
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  faithTopicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  faithTopicCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
  },
  faithTopicGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 130,
    justifyContent: 'center',
  },
  faithTopicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  faithTopicTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    textAlign: 'center',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
  faithTopicHint: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    textAlign: 'center',
    ...Platform.select({
      android: {
        writingDirection: 'rtl',
      },
    }),
  },
})
