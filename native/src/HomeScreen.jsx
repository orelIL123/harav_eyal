import React, { useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, Animated, Platform, Dimensions, Image, ImageBackground, ScrollView, Share, Alert, Easing, Linking, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Grayscale } from 'react-native-color-matrix-image-filters'
import { useTranslation } from 'react-i18next'
import i18n from './config/i18n'
import { getAlerts, updateAlert } from './services/alertsService'
import { getPodcasts } from './services/podcastsService'
import { getDailyVideos } from './services/dailyVideosService'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'
const BLACK = '#000000'

const CARDS = [
  { key: 'faith-daily', title: 'home.faithBoost', desc: 'home.faithBoostDesc', icon: 'sparkles-outline', image: require('../assets/photos/זריקת אמונה.png') },
  { key: 'books', title: 'home.books', desc: 'home.booksDesc', icon: 'book-outline', image: require('../assets/photos/ספרים/hbooks183_06072020180826.jpg') },
  { key: 'institutions', title: 'home.rabbiInstitutions', desc: 'home.rabbiInstitutionsDesc', icon: 'school-outline', image: require('../assets/icon.png') },
  { key: 'lessons', title: 'home.lessonsLibrary', desc: 'home.lessonsLibraryDesc', icon: 'library-outline', image: require('../assets/photos/שיעורי_הרב.jpg') },
  { key: 'faith-stories', title: 'home.faithStories', desc: 'home.faithStoriesDesc', icon: 'videocam-outline', image: require('../assets/photos/artworks-f5GgAyzhR486zQ8F-9vQqvw-t500x500.jpg') },
]

// Carousel image order
const IMAGES = [
  require('../assets/photos/ספרים/hbooks183_06072020180826.jpg'),
  require('../assets/photos/זריקת אמונה.png'),
  require('../assets/photos/שיעורי_הרב.jpg'),
  require('../assets/icon.png'),
]

function useFadeIn(delay = 0) {
  const anim = useMemo(() => new Animated.Value(0), [])
  React.useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start()
  }, [anim, delay])
  return anim
}


function Card({ item, index, scrollX, SNAP, CARD_WIDTH, CARD_HEIGHT, OVERLAP, onPress }) {
  const { t } = useTranslation();
  const fade = useFadeIn(index * 80)
  const pressAnim = React.useRef(new Animated.Value(0)).current

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start()
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start()

  const inputRange = [ (index - 1) * SNAP, index * SNAP, (index + 1) * SNAP ]
  const animatedStyle = {
    opacity: fade,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    transform: [
      { translateY: scrollX.interpolate({ inputRange, outputRange: [12, -8, 12], extrapolate: 'clamp' }) },
      { scale: scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' }) },
      { perspective: 900 },
      { rotateY: scrollX.interpolate({ inputRange, outputRange: ['12deg', '0deg', '-12deg'], extrapolate: 'clamp' }) },
      { rotateZ: scrollX.interpolate({ inputRange, outputRange: ['2deg', '0deg', '-2deg'], extrapolate: 'clamp' }) },
      { scale: pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] }) },
    ],
  }

  const imageStyle = [StyleSheet.absoluteFill, item?.imageScale ? { transform: [{ scale: item.imageScale }] } : null]

  return (
    <View style={[styles.cardItemContainer, { width: CARD_WIDTH, marginRight: -OVERLAP }]}>
      <View style={styles.cardLabelContainer}>
        <Text style={[styles.cardLabelTitle, { textAlign: 'right' }]}>{t(item.title)}</Text>
        <Text style={[styles.cardLabelDesc, { textAlign: 'right' }]} numberOfLines={2}>{t(item.desc)}</Text>
      </View>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          if (item.locked) {
            Alert.alert(t('home.lockedContent'), t('home.lockedContentMessage'))
            return
          }
          onPress?.(item)
        }}
        style={styles.cardPressable}
        accessibilityRole="button"
        accessibilityLabel={`${t(item.title)} - ${t(item.desc)}`}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <ImageBackground
            source={item.image || IMAGES[index % IMAGES.length]}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            imageStyle={imageStyle}
          />
          <LinearGradient
            colors={[ 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.0)' ]}
            locations={[0, 0.45]}
            style={StyleSheet.absoluteFill}
          />
          {item.key === 'lessons' && (
            <View style={styles.cardSmallImageContainer}>
              <Image
                source={require('../assets/photos/שיעורי_הרב.jpg')}
                style={styles.cardSmallImage}
                resizeMode="cover"
              />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { width } = Dimensions.get('window')
  const SPACING = 12
  const CARD_WIDTH = Math.min(width * 0.76, 360)
  const CARD_HEIGHT = Math.round(CARD_WIDTH * (16/9))
  const OVERLAP = 56
  const SNAP = CARD_WIDTH - OVERLAP
  const sideInset = (width - CARD_WIDTH) / 2

  const scrollX = React.useRef(new Animated.Value(0)).current
  const [activeTab, setActiveTab] = React.useState('home')
  const pulse = React.useRef(new Animated.Value(0)).current
  const centerButtonOffset = (width / 2) - 40 // 40 is half of button width

  const triggerPulse = React.useCallback(() => {
    pulse.setValue(0)
    Animated.timing(pulse, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  }, [pulse])

  const pulseStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
    transform: [
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.0] }) },
    ],
  }
  const quote = t('home.dailyQuote')
  const quoteText = t('home.quoteText')
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [activeAlerts, setActiveAlerts] = React.useState([])
  const [podcasts, setPodcasts] = React.useState([])
  const [loadingPodcasts, setLoadingPodcasts] = React.useState(true)
  const [dailyVideos, setDailyVideos] = React.useState([])
  const [loadingDailyVideos, setLoadingDailyVideos] = React.useState(true)

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

        // Auto-deactivate expired alerts
        const expiredAlerts = allAlerts.filter(alert => {
          if (!alert.expiresAt) return false
          const expiresAt = alert.expiresAt.toDate ? alert.expiresAt.toDate() : new Date(alert.expiresAt)
          return expiresAt <= now && alert.isActive
        })

        // Deactivate expired alerts
        for (const alert of expiredAlerts) {
          try {
            await updateAlert(alert.id, { isActive: false })
          } catch (error) {
            console.error('Error deactivating expired alert:', error)
          }
        }

        // Only update state if component is still mounted
        if (isMounted) {
          setActiveAlerts(validAlerts)
          setUnreadCount(validAlerts.length)
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

  // Load daily videos
  React.useEffect(() => {
    let isMounted = true

    const loadDailyVideos = async () => {
      try {
        setLoadingDailyVideos(true)
        const videos = await getDailyVideos()

        if (!isMounted) return

        // Filter videos that are less than 24 hours old
        const now = Date.now()
        const validVideos = videos.filter(video => {
          if (!video.createdAt) return false
          const createdAt = video.createdAt.toDate ? video.createdAt.toDate().getTime() : new Date(video.createdAt).getTime()
          const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60)
          return hoursSinceCreation < 24
        })

        setDailyVideos(validVideos)
      } catch (error) {
        console.error('Error loading daily videos:', error)
        if (isMounted) {
          setDailyVideos([])
        }
      } finally {
        if (isMounted) {
          setLoadingDailyVideos(false)
        }
      }
    }

    loadDailyVideos()

    return () => {
      isMounted = false
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
    Share.share({ message: `"${quote}"

"${quoteText}"` }).catch(() => {})
  }, [quote, quoteText])

  const handleCardPress = React.useCallback((key) => {
    if (key === 'faith-daily') {
      navigation?.navigate('DailyInsight')
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
      navigation?.navigate('LessonsLibrary')
      return
    }
    if (key === 'faith-stories') {
      navigation?.navigate('FaithStories')
      return
    }
    Alert.alert(t('home.comingSoon'), t('home.screenInDevelopment'))
  }, [navigation, t])

  const handleNotificationPress = React.useCallback(() => {
    Alert.alert(t('home.comingSoon'), t('home.notificationsComingSoon'))
  }, [t])

  const openSocialLink = React.useCallback((url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('home.error'), t('home.linkError'))
    })
  }, [t])

  return (
    <View style={styles.screen}>
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

      {/* Daily Videos Stories Row - WhatsApp style */}
      {dailyVideos.length > 0 && (
        <View style={styles.storiesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.storiesRow}
          >
            {dailyVideos.map((video, index) => (
              <Pressable
                key={video.id}
                style={styles.storyBubble}
                onPress={() => navigation?.navigate('DailyInsight')}
                accessibilityRole="button"
              >
                <View style={styles.storyRing}>
                  {video.thumbnailUrl ? (
                    <Image 
                      source={{ uri: video.thumbnailUrl }} 
                      style={styles.storyThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="videocam" size={24} color="#fff" />
                  )}
                </View>
                {video.title && (
                  <Text style={styles.storyTitle} numberOfLines={1}>
                    {video.title}
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
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
          <Animated.FlatList
            data={CARDS}
            keyExtractor={(it) => it.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP}
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{ paddingHorizontal: sideInset, paddingVertical: 4 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <Card
                item={item}
                index={index}
                scrollX={scrollX}
                SNAP={SNAP}
                CARD_WIDTH={CARD_WIDTH}
                CARD_HEIGHT={CARD_HEIGHT}
                OVERLAP={OVERLAP}
                onPress={() => handleCardPress(item.key)}
              />
            )}
          />

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
                onPress={() => openSocialLink('https://chat.whatsapp.com/H4t7m6NfuBD9GgEuw80EeP')}
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
                  <Pressable
                    key={podcast.id}
                    style={styles.podcastCard}
                    onPress={() => {
                      // Navigate to podcast player or detail screen
                      if (podcast.audioUrl) {
                        navigation?.navigate('PodcastPlayer', { podcast })
                      } else {
                        Alert.alert(t('home.comingSoon'), t('home.podcastDesc'))
                      }
                    }}
                    accessibilityRole="button"
                  >
                    {podcast.thumbnailUrl ? (
                      <Image 
                        source={{ uri: podcast.thumbnailUrl }} 
                        style={styles.podcastThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.podcastIconContainer}>
                        <Ionicons name="headset-outline" size={34} color={PRIMARY_RED} />
                      </View>
                    )}
                    <Text style={styles.podcastTitle} numberOfLines={2}>{podcast.title}</Text>
                    {podcast.description && (
                      <Text style={styles.podcastDesc} numberOfLines={1}>{podcast.description}</Text>
                    )}
                    {podcast.category && (
                      <Text style={styles.podcastCategory}>{podcast.category}</Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.podcastEmptyContainer}>
                <Ionicons name="headset-outline" size={32} color="#d1d5db" />
                <Text style={styles.podcastEmptyText}>{t('home.noPodcasts')}</Text>
              </View>
            )}
          </View>

        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
        {/* בית - צד שמאל */}
        <View style={styles.navItemContainer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => { setActiveTab('home'); triggerPulse(); navigation?.navigate('Home') }}
            style={styles.navItemPressable}
          >
            <View style={styles.iconBox}>
              <Animated.View style={[styles.pulseRing, pulseStyle]} />
              <Ionicons name="home-outline" size={22} color={activeTab === 'home' ? PRIMARY_RED : '#B3B3B3'} />
            </View>
            <Text style={[styles.navLabel, { color: activeTab === 'home' ? PRIMARY_RED : '#B3B3B3' }]}>{t('home.homeTab')}</Text>
          </Pressable>
        </View>

        {/* כתיבה לרב */}
        <View style={[styles.navItemContainer, styles.navItemSpacedRight]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => { setActiveTab('contact'); navigation?.navigate('ContactRabbi') }}
            style={styles.navItemPressable}
          >
            <View style={styles.iconBox}>
              <Ionicons name="mail-outline" size={22} color={activeTab === 'contact' ? PRIMARY_RED : '#B3B3B3'} />
            </View>
            <Text style={[styles.navLabel, { color: activeTab === 'contact' ? PRIMARY_RED : '#B3B3B3' }]}>{t('home.contactTab')}</Text>
          </Pressable>
        </View>

        {/* CENTER - Short Lessons (Featured Button) */}
        <View style={[styles.centerNavContainer, { left: (width / 2) - 40 }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => { 
              setActiveTab('shortLessons'); 
              navigation?.navigate('LessonsLibrary', { initialCategory: 'shortLessons' })
            }}
            style={styles.centerNavButton}
          >
            <View style={styles.centerNavGlowOuter} />
            <View style={styles.centerNavGradient}>
              <Image 
                source={require('../assets/iconspining.png')} 
                style={styles.spinningIcon}
                resizeMode="cover"
              />
            </View>
          </Pressable>
        </View>

        {/* חדשות הקהילה */}
        <View style={[styles.navItemContainer, styles.navItemSpacedLeft]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => { setActiveTab('community'); navigation?.navigate('CommunityNews') }}
            style={styles.navItemPressable}
          >
            <View style={styles.iconBox}>
              <Ionicons name="newspaper-outline" size={22} color={activeTab === 'community' ? PRIMARY_RED : '#B3B3B3'} />
            </View>
            <Text style={[styles.navLabel, { color: activeTab === 'community' ? PRIMARY_RED : '#B3B3B3' }]}>{t('home.newsTab')}</Text>
          </Pressable>
        </View>

        {/* פרופיל - צד ימין */}
        <View style={styles.navItemContainer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => { setActiveTab('profile'); navigation?.navigate('Profile') }}
            style={styles.navItemPressable}
          >
            <View style={styles.iconBox}>
              <Ionicons name="person-circle-outline" size={22} color={activeTab === 'profile' ? PRIMARY_RED : '#B3B3B3'} />
            </View>
            <Text style={[styles.navLabel, { color: activeTab === 'profile' ? PRIMARY_RED : '#B3B3B3' }]}>{t('home.profileTab')}</Text>
          </Pressable>
        </View>
      </View>
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
  headerWebsite: {
    position: 'absolute',
    right: 60,
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
  },
  main: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 72,
    marginTop: -4,
  },
  scrollContent: {
    paddingBottom: 92,
    gap: 20,
  },
  grid: {
  },
  gridRow: {
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
  },
  snapshotBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  snapshotItem: {
    alignItems: 'flex-end',
    minWidth: 96,
  },
  snapshotLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  snapshotValue: {
    color: DEEP_BLUE,
    fontSize: 15,
    marginTop: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  snapshotChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    justifyContent: 'flex-end',
  },
  snapshotChange: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteAuthor: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  shareBtn: {
    flexDirection: 'row',
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
  },
  donationLinkBtn: {
    flexDirection: 'row',
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
  },
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
  podcastRow: {
    gap: 10,
    paddingHorizontal: 2,
  },
  podcastCard: {
    width: 160,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.1)',
    padding: 14,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  podcastTitle: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  podcastDesc: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  podcastCategory: {
    color: PRIMARY_RED,
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    marginTop: 4,
  },
  podcastThumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  podcastIconContainer: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  youtubeText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  medalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  medalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(30,58,138,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalTitle: {
    color: DEEP_BLUE,
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(11,27,58,0.06)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY_RED,
  },
  progressText: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'Poppins_500Medium',
  },
  recoBanner: {
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
  },
  recoTitle: {
    color: PRIMARY_RED,
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Poppins_600SemiBold',
  },
  recoDesc: {
    color: '#e5e7eb',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'right',
    fontFamily: 'Poppins_400Regular',
  },
  recoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30,58,138,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  recoCtaText: {
    color: PRIMARY_RED,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  cardItemContainer: {
    alignItems: 'flex-end',
  },
  cardLabelContainer: {
    alignItems: 'flex-end',
    paddingRight: 32,
    paddingLeft: 8,
    marginBottom: 10,
  },
  cardLabelTitle: {
    color: PRIMARY_RED,
    fontSize: 20,
    fontFamily: 'Heebo_900Black',
    marginBottom: 2,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardLabelDesc: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  cardPressable: {
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  lockIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
  },
  cardContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    padding: 16,
    paddingRight: 28,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,58,138,0.12)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#B3B3B3',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: Platform.select({ ios: 20, android: 12, default: 12 }),
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  navItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 80,
  },
  navItemSpacedRight: {
    marginRight: 12,
  },
  navItemSpacedLeft: {
    marginLeft: 12,
  },
  navItemPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    width: '100%',
  },
  centerNavContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -58,
    zIndex: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    alignItems: 'center',
    gap: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  pulseRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRIMARY_RED,
  },
  navLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: 'Poppins_500Medium',
    marginTop: 2,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,27,58,0.04)',
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(11,27,58,0.08)',
    gap: 8,
  },
  socialLabel: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  centerNavButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNavGlowOuter: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: PRIMARY_GOLD,
    opacity: 0.08,
    top: -6,
    left: -6,
  },
  centerNavGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'hidden',
  },
  centerNavLabel: {
    marginTop: 6,
    fontSize: 12,
    color: PRIMARY_GOLD,
    fontFamily: 'Poppins_600SemiBold',
  },
  spinningIcon: {
    width: 140,
    height: 140,
  },
  cardSmallImageContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cardSmallImage: {
    width: '100%',
    height: '100%',
  },
  alertsBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,27,58,0.08)',
  },
  alertsScrollContent: {
    gap: 8,
    paddingRight: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 8,
    minWidth: 280,
    maxWidth: 320,
  },
  alertBannerContent: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  alertBannerTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  alertBannerMessage: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    opacity: 0.9,
  },
  alertDismissButton: {
    padding: 4,
    borderRadius: 12,
  },
  storiesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,27,58,0.08)',
  },
  storiesRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  storyBubble: {
    alignItems: 'center',
    gap: 6,
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 3,
    borderColor: PRIMARY_RED,
    overflow: 'hidden',
  },
  storyThumbnail: {
    width: '100%',
    height: '100%',
  },
  storyTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: DEEP_BLUE,
    textAlign: 'center',
    maxWidth: 70,
  },
})


