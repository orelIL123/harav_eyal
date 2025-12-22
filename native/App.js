import React, { useEffect, useRef, useState } from 'react'
import './src/config/i18n';
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, Image, Animated, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Notifications from 'expo-notifications'
import * as Updates from 'expo-updates'
import * as SplashScreen from 'expo-splash-screen'
import { initAnalytics, logScreenView, logEventCustom } from './src/services/analyticsService'
import HomeScreen from './src/HomeScreen'
import DailyInsightScreen from './src/screens/DailyInsightScreen'
import CoursesScreen from './src/screens/CoursesScreen'
import NewsScreen from './src/screens/NewsScreen'
import NewsDetailScreen from './src/screens/NewsDetailScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import LiveAlertsScreen from './src/screens/LiveAlertsScreen'
import AdminScreen from './src/screens/AdminScreen'
import PrayersScreen from './src/screens/PrayersScreen'
import PdfViewerScreen from './src/screens/PdfViewerScreen'
import ImageViewerScreen from './src/screens/ImageViewerScreen'
import ContactRabbiScreen from './src/screens/ContactRabbiScreen'
import WeeklyLessonsScreen from './src/screens/WeeklyLessonsScreen'
import ReelsScreen from './src/screens/ReelsScreen'
import SideMenuScreen from './src/screens/SideMenuScreen'
import DonationScreen from './src/screens/DonationScreen'
import FlyersScreen from './src/screens/FlyersScreen'
import FlyerDetailScreen from './src/screens/FlyerDetailScreen'
import AboutScreen from './src/screens/AboutScreen'
import LanguageScreen from './src/screens/LanguageScreen'
import CommunityNewsScreen from './src/screens/CommunityNewsScreen'
import FaithLearningScreen from './src/screens/FaithLearningScreen'
import BooksScreen from './src/screens/BooksScreen'
import InstitutionsScreen from './src/screens/InstitutionsScreen'
import OurActivitiesScreen from './src/screens/OurActivitiesScreen'
import KindergartenScreen from './src/screens/KindergartenScreen'
import TalmudTorahScreen from './src/screens/TalmudTorahScreen'
import GirlsSchoolScreen from './src/screens/GirlsSchoolScreen'
import SmallYeshivaScreen from './src/screens/SmallYeshivaScreen'
import LargeYeshivaScreen from './src/screens/LargeYeshivaScreen'
import KollelScreen from './src/screens/KollelScreen'
import WomenLessonsScreen from './src/screens/WomenLessonsScreen'
import CommunityActivitiesScreen from './src/screens/CommunityActivitiesScreen'
import YouthClubScreen from './src/screens/YouthClubScreen'
import LessonsLibraryScreen from './src/screens/LessonsLibraryScreen'
import VideoPlayerScreen from './src/screens/VideoPlayerScreen'
import FaithStoriesScreen from './src/screens/FaithStoriesScreen'
import PodcastsScreen from './src/screens/PodcastsScreen'
import PodcastPlayerScreen from './src/screens/PodcastPlayerScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen'
import TermsAndConsentScreen from './src/screens/TermsAndConsentScreen'
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen'
import NotificationsScreen from './src/screens/NotificationsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import { AuthProvider } from './src/utils/AuthContext'
import { hasAcceptedConsent } from './src/utils/storage'
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins'
import { CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative'
import { Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold, Heebo_900Black } from '@expo-google-fonts/heebo'
import ErrorBoundary from './src/components/ErrorBoundary'
import { registerForPushNotificationsAsync } from './src/utils/notifications'

const Stack = createNativeStackNavigator()

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [initialRoute, setInitialRoute] = useState('Home')
  const fadeAnim = useRef(new Animated.Value(1)).current
  const navigationRef = useRef(null)
  const appStartTime = useRef(Date.now())

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    CinzelDecorative_400Regular,
    CinzelDecorative_700Bold,
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
    Heebo_900Black,
  })

  useEffect(() => {
    let mounted = true

    // Prevent native splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync().catch((error) => {
      console.error('Error preventing splash screen:', error)
    })

    // Initialize Analytics - wrapped in try-catch to prevent crashes
    const initAnalyticsAsync = async () => {
      try {
        await initAnalytics()
        // Log app opened event - only if analytics is enabled
        if (mounted) {
          await logEventCustom('app_opened', { platform: Platform.OS }).catch(() => {
            // Silently fail
          })
        }
      } catch (error) {
        console.error('Error initializing Analytics:', error)
        // Don't crash if analytics fails
      }
    }
    initAnalyticsAsync().catch(() => {
      // Silently handle errors to prevent crashes
    })

    // Check for updates - only in production and with better error handling
    const checkForUpdates = async () => {
      if (__DEV__) {
        console.log('🔧 Development mode - skipping updates check')
        return // Skip updates in development
      }
      try {
        console.log('🔍 Checking for updates...')
        console.log('Updates.isEnabled:', Updates.isEnabled)
        console.log('Updates.channel:', Updates.channel)
        console.log('Updates.runtimeVersion:', Updates.runtimeVersion)
        console.log('Updates.updateId:', Updates.updateId)

        // Check if Updates is available
        if (!Updates.isEnabled) {
          console.warn('⚠️ Updates are not enabled')
          return
        }

        console.log('📡 Checking for update...')
        const update = await Updates.checkForUpdateAsync()
        console.log('Update check result:', {
          isAvailable: update.isAvailable,
          manifest: update.manifest ? 'present' : 'missing'
        })

        if (update.isAvailable && mounted) {
          console.log('📥 Update available! Fetching...')
          await Updates.fetchUpdateAsync()
          console.log('✅ Update fetched successfully')

          if (mounted) {
            console.log('🔄 Reloading app with new update...')
            await Updates.reloadAsync()
          }
        } else {
          console.log('✅ App is up to date')
        }
      } catch (error) {
        console.error('❌ Error checking for updates:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        })
        // Don't crash if update check fails - this is non-critical
      }
    }
    checkForUpdates().catch(() => {
      // Silently handle errors to prevent crashes
    })

    // Check if user has accepted consent
    const checkConsent = async () => {
      try {
        const accepted = await hasAcceptedConsent()
        if (mounted && !accepted) {
          setInitialRoute('TermsAndConsent')
        }
      } catch (error) {
        console.error('Error checking consent:', error)
        // Default to Home if consent check fails
        if (mounted) {
          setInitialRoute('Home')
        }
      }
    }
    checkConsent().catch(() => {
      // Default to Home if consent check fails
      if (mounted) {
        setInitialRoute('Home')
      }
    })

    // Register for push notifications
    const registerPushNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync()
        if (token && mounted) {
          console.log('📱 Push notification token:', token)
          // TODO: Save token to Firestore user document
          // This will be done when user logs in
        }
      } catch (error) {
        console.error('Error registering for push notifications:', error)
        // Don't crash if push notifications fail
      }
    }
    registerPushNotifications().catch(() => {
      // Silently handle errors
    })

    // Set up notification listeners
    const setupNotificationListeners = () => {
      // Handle notification received while app is in foreground
      const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('📬 Notification received (foreground):', notification)
        // You can show a custom UI here if needed
      })

      // Handle notification tapped/opened
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response)
        const data = response.notification.request.content.data

        // Navigate to relevant screen based on notification data
        if (data?.screen && navigationRef.current) {
          navigationRef.current.navigate(data.screen, data)
        }
      })

      return () => {
        foregroundSubscription.remove()
        responseSubscription.remove()
      }
    }
    const removeListeners = setupNotificationListeners()

    return () => {
      mounted = false
      removeListeners()
    }
  }, [])

  // Hide splash screen when fonts are loaded with minimum display time
  useEffect(() => {
    if (!fontsLoaded) return

    // Hide splash screen with minimum 1 second display time and smooth fade animation
    const hideSplash = async () => {
      try {
        // Calculate elapsed time since app start
        const elapsedTime = Date.now() - appStartTime.current
        const minDisplayTime = 1000 // Minimum 1 second display time
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime)

        // Wait for minimum display time + small buffer for UI readiness
        setTimeout(async () => {
          // Smooth fade-out animation
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(async () => {
            try {
              await SplashScreen.hideAsync()
              setShowSplash(false)
            } catch (error) {
              console.error('Error hiding splash screen:', error)
              setShowSplash(false)
            }
          })
        }, remainingTime + 100) // Small buffer for UI readiness
      } catch (error) {
        console.error('Error hiding splash screen:', error)
        setShowSplash(false)
      }
    }

    hideSplash()
  }, [fontsLoaded, fadeAnim])

  // Push notifications disabled - will be added later
  // useEffect(() => {
  //   registerForPushNotificationsAsync().then(token => {
  //     if (token) {
  //       console.log('Push Token:', token)
  //     }
  //   })
  //   ...
  // }, [])

  return (
    <AuthProvider>
      <ErrorBoundary
        onGoHome={() => {
          navigationRef.current?.navigate('Home')
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {/* Always render navigation when fonts loaded, but splash will cover it */}
          {fontsLoaded && (
            <NavigationContainer
              ref={navigationRef}
              onStateChange={async () => {
                try {
                  const currentRouteName = navigationRef.current?.getCurrentRoute()?.name
                  if (currentRouteName) {
                    await logScreenView(currentRouteName).catch(() => {
                      // Silently fail if analytics fails
                    })
                  }
                } catch (error) {
                  console.error('Error logging screen view:', error)
                  // Don't crash if screen view logging fails
                }
              }}
            >
              <StatusBar style="dark" />
              <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="TermsAndConsent" component={TermsAndConsentScreen} />
                <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="DailyInsight" component={DailyInsightScreen} />
                <Stack.Screen name="Courses" component={CoursesScreen} />
                <Stack.Screen name="News" component={NewsScreen} />
                <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="LiveAlerts" component={LiveAlertsScreen} />
                <Stack.Screen name="Admin" component={AdminScreen} />
                <Stack.Screen name="Prayers" component={PrayersScreen} />
                <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
                <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
                <Stack.Screen name="ContactRabbi" component={ContactRabbiScreen} />
                <Stack.Screen name="WeeklyLessons" component={WeeklyLessonsScreen} />
                <Stack.Screen name="Reels" component={ReelsScreen} />
                <Stack.Screen name="SideMenu" component={SideMenuScreen} />
                <Stack.Screen name="Donation" component={DonationScreen} />
                <Stack.Screen name="Flyers" component={FlyersScreen} />
                <Stack.Screen name="FlyerDetail" component={FlyerDetailScreen} />
                <Stack.Screen name="About" component={AboutScreen} />
                <Stack.Screen name="Language" component={LanguageScreen} />
                <Stack.Screen name="CommunityNews" component={CommunityNewsScreen} />
                <Stack.Screen name="FaithLearning" component={FaithLearningScreen} />
                <Stack.Screen name="Books" component={BooksScreen} />
                <Stack.Screen name="Institutions" component={InstitutionsScreen} />
                <Stack.Screen name="OurActivities" component={OurActivitiesScreen} />
                <Stack.Screen name="Kindergarten" component={KindergartenScreen} />
                <Stack.Screen name="TalmudTorah" component={TalmudTorahScreen} />
                <Stack.Screen name="GirlsSchool" component={GirlsSchoolScreen} />
                <Stack.Screen name="SmallYeshiva" component={SmallYeshivaScreen} />
                <Stack.Screen name="LargeYeshiva" component={LargeYeshivaScreen} />
                <Stack.Screen name="Kollel" component={KollelScreen} />
                <Stack.Screen name="WomenLessons" component={WomenLessonsScreen} />
                <Stack.Screen name="CommunityActivities" component={CommunityActivitiesScreen} />
                <Stack.Screen name="YouthClub" component={YouthClubScreen} />
                <Stack.Screen name="LessonsLibrary" component={LessonsLibraryScreen} />
                <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
                <Stack.Screen name="FaithStories" component={FaithStoriesScreen} />
                <Stack.Screen name="Podcasts" component={PodcastsScreen} />
                <Stack.Screen name="PodcastPlayer" component={PodcastPlayerScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen
                  name="Notifications"
                  component={NotificationsScreen}
                  options={{ presentation: 'modal' }}
                />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          )}
          {/* Show splash screen immediately - covers everything */}
          {showSplash && (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: fadeAnim,
                  backgroundColor: '#FFFFFF',
                  zIndex: 9999
                }
              ]}
            >
              <Image
                source={require('./assets/splashphoto.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </Animated.View>
          )}
          {/* Show loading state when fonts not loaded */}
          {!fontsLoaded && !showSplash && (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={require('./assets/splashphoto.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <StatusBar style="dark" />
            </View>
          )}
        </View>
      </ErrorBoundary>
    </AuthProvider>
  )
}
