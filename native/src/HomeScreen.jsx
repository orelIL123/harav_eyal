import React, { useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, Animated, Platform, Dimensions, Image, ImageBackground, ScrollView, Share, Alert, Easing, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Grayscale } from 'react-native-color-matrix-image-filters'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'
const BLACK = '#000000'

const CARDS = [
  { key: 'faith-daily', title: 'זריקת אמונה', desc: 'מערך יומי לאמונה וחיזוק', icon: 'sparkles-outline', image: require('../assets/photos/זריקת אמונה.png') },
  { key: 'books', title: 'ספרים', desc: 'ספרי תורה וחידושים', icon: 'book-outline', image: require('../assets/photos/ספרים/hbooks183_06072020180826.jpg') },
  { key: 'institutions', title: 'מוסדות הרב', desc: 'מידע על המוסדות, תמונות ועוד', icon: 'school-outline', image: require('../assets/icon.png') },
  { key: 'lessons', title: 'ספריית שיעורים', desc: 'כל השיעורים במקום אחד', icon: 'library-outline', image: require('../assets/photos/שיעורי_הרב.jpg') },
  { key: 'faith-stories', title: 'סיפורי אמונה', desc: 'סרטונים קצרים על אמונה', icon: 'videocam-outline', image: require('../assets/photos/artworks-f5GgAyzhR486zQ8F-9vQqvw-t500x500.jpg') },
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
        <Text style={[styles.cardLabelTitle, { textAlign: 'right' }]}>{item.title}</Text>
        <Text style={[styles.cardLabelDesc, { textAlign: 'right' }]} numberOfLines={2}>{item.desc}</Text>
      </View>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          if (item.locked) {
            Alert.alert('תוכן נעול', 'התוכן מיועד למשתמשים רשומים בלבד')
            return
          }
          onPress?.(item)
        }}
        style={styles.cardPressable}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} - ${item.desc}`}
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
  const quote = 'ציטוט יומי'
  const quoteText = 'אין בריאה בעולם שיכולה להיטיב לך או להרע לך זולתי גזרת הבורא יתברך'
  const [unreadCount, setUnreadCount] = React.useState(0)

  const onShareQuote = React.useCallback(() => {
    Share.share({ message: `"${quote}"\n\n"${quoteText}"` }).catch(() => {})
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
      Alert.alert('בקרוב', 'סיפורי אמונה יופיעו כאן')
      return
    }
    Alert.alert('בקרוב', 'המסך הזה עדיין בפיתוח')
  }, [navigation])

  const handleNotificationPress = React.useCallback(() => {
    Alert.alert('בקרוב', 'מערכת התראות תתווסף בקרוב')
  }, [])

  const openSocialLink = React.useCallback((url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
  }, [])

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
          <Text style={styles.title}>הרב אייל עמרמי</Text>
          <Text style={styles.subtitle}>כאייל תערוג</Text>
        </View>
      </View>

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
              <Text style={styles.sectionTitle}>כאייל תערוג</Text>
            </View>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{quote}"</Text>
              <Text style={styles.quoteSubText}>"{quoteText}"</Text>
              <View style={styles.quoteFooter}>
                <Pressable onPress={onShareQuote} style={styles.shareBtn} accessibilityRole="button">
                  <Ionicons name="share-social-outline" size={16} color="#ffffff" />
                  <Text style={styles.shareBtnText}>שיתוף</Text>
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
                <Text style={styles.donationLinkText}>תרומה לחיזוק מוסדות הרב</Text>
              </Pressable>
            </View>
          </View>

          {/* YouTube Link */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>יוטיוב</Text>
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
                <Text style={styles.youtubeText}>ערוץ יוטיוב</Text>
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
                accessibilityLabel="אינסטגרם"
              >
                <Ionicons name="logo-instagram" size={32} color="#E4405F" />
              </Pressable>
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => openSocialLink('https://www.facebook.com/share/1DU65z7iee/?mibextid=wwXIfr')}
                accessibilityRole="button"
                accessibilityLabel="פייסבוק"
              >
                <Ionicons name="logo-facebook" size={32} color="#1877F2" />
              </Pressable>
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => openSocialLink('https://youtube.com/@rabbieyalamrami?si=aeiBPpBARJfBq5jF')}
                accessibilityRole="button"
                accessibilityLabel="יוטיוב"
              >
                <Ionicons name="logo-youtube" size={32} color="#FF0000" />
              </Pressable>
              <Pressable
                style={styles.socialIconBtn}
                onPress={() => openSocialLink('https://chat.whatsapp.com/H4t7m6NfuBD9GgEuw80EeP')}
                accessibilityRole="button"
                accessibilityLabel="וואטסאפ"
              >
                <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
              </Pressable>
            </View>
          </View>

          {/* Podcasts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>פודקאסטים</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.podcastRow}>
              {[1,2,3].map(i => (
                <Pressable
                  key={`podcast-${i}`}
                  style={styles.podcastCard}
                  onPress={() => Alert.alert('בקרוב', 'פודקאסטים - קבצי אודיו ארוכים או רילסים יופיעו כאן')}
                  accessibilityRole="button"
                >
                  <Ionicons name="headset-outline" size={34} color={PRIMARY_RED} />
                  <Text style={styles.podcastTitle}>פודקאסט {i}</Text>
                  <Text style={styles.podcastDesc} numberOfLines={1}>קבצי אודיו / רילסים</Text>
                </Pressable>
              ))}
            </ScrollView>
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
            <Text style={[styles.navLabel, { color: activeTab === 'home' ? PRIMARY_RED : '#B3B3B3' }]}>בית</Text>
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
            <Text style={[styles.navLabel, { color: activeTab === 'contact' ? PRIMARY_RED : '#B3B3B3' }]}>כתיבה לרב</Text>
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
            <Text style={[styles.navLabel, { color: activeTab === 'community' ? PRIMARY_RED : '#B3B3B3' }]}>חדשות</Text>
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
            <Text style={[styles.navLabel, { color: activeTab === 'profile' ? PRIMARY_RED : '#B3B3B3' }]}>פרופיל</Text>
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
    fontFamily: 'CinzelDecorative_700Bold',
    letterSpacing: 3,
    textShadowColor: 'rgba(220,38,38,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    width: 90,
    height: 90,
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
})


