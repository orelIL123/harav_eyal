import React, { useEffect, useRef, useState } from 'react'
import './src/config/i18n';
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, Image, Animated } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Notifications from 'expo-notifications'
import * as Updates from 'expo-updates'
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
import ContactRabbiScreen from './src/screens/ContactRabbiScreen'
import WeeklyLessonsScreen from './src/screens/WeeklyLessonsScreen'
import ReelsScreen from './src/screens/ReelsScreen'
import SideMenuScreen from './src/screens/SideMenuScreen'
import DonationScreen from './src/screens/DonationScreen'
import FlyersScreen from './src/screens/FlyersScreen'
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
import PodcastsScreen from './src/screens/PodcastsScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen'
import TermsAndConsentScreen from './src/screens/TermsAndConsentScreen'
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen'
import { AuthProvider } from './src/utils/AuthContext'
import { hasAcceptedConsent } from './src/utils/storage'
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins'
import { CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative'
import { Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold, Heebo_900Black } from '@expo-google-fonts/heebo'
import ErrorBoundary from './src/components/ErrorBoundary'
// import { registerForPushNotificationsAsync } from './src/utils/notifications'

const Stack = createNativeStackNavigator()

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [initialRoute, setInitialRoute] = useState('Home')
  const fadeAnim = useRef(new Animated.Value(1)).current
  const navigationRef = useRef(null)

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
    // Check for updates
    const checkForUpdates = async () => {
      if (__DEV__) {
        return // Skip updates in development
      }
      try {
        const update = await Updates.checkForUpdateAsync()
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync()
          await Updates.reloadAsync()
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }
    checkForUpdates()

    // Check if user has accepted consent
    const checkConsent = async () => {
      try {
        const accepted = await hasAcceptedConsent()
        if (!accepted) {
          setInitialRoute('TermsAndConsent')
        }
      } catch (error) {
        console.error('Error checking consent:', error)
      }
    }
    checkConsent()

    // Show for 2s, then fade out over 1s
    const t = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setShowSplash(false)
      })
    }, 2000)
    return () => clearTimeout(t)
  }, [fadeAnim])

  // Push notifications disabled - will be added later
  // useEffect(() => {
  //   registerForPushNotificationsAsync().then(token => {
  //     if (token) {
  //       console.log('Push Token:', token)
  //     }
  //   })
  //   ...
  // }, [])

  if (!fontsLoaded) {
    return (
      <AuthProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
          <ActivityIndicator color="#DC2626" />
          <StatusBar style="dark" />
        </View>
      </AuthProvider>
    )
  }

  return (
    <ErrorBoundary
      onGoHome={() => {
        navigationRef.current?.navigate('Home')
      }}
    >
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <NavigationContainer ref={navigationRef}>
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
            <Stack.Screen name="ContactRabbi" component={ContactRabbiScreen} />
            <Stack.Screen name="WeeklyLessons" component={WeeklyLessonsScreen} />
            <Stack.Screen name="Reels" component={ReelsScreen} />
            <Stack.Screen name="SideMenu" component={SideMenuScreen} />
            <Stack.Screen name="Donation" component={DonationScreen} />
            <Stack.Screen name="Flyers" component={FlyersScreen} />
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
            <Stack.Screen name="Podcasts" component={PodcastsScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
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
                backgroundColor: '#000' 
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
      </View>
    </AuthProvider>
    </ErrorBoundary>
  )
}
