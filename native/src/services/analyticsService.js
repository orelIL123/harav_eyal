import { getAnalytics, logEvent, setUserId, setUserProperties, isSupported } from 'firebase/analytics'
import app from '../config/firebase'
import { Platform } from 'react-native'

/**
 * Analytics Service - מעקב אחר שימוש באפליקציה
 * 
 * Note: Firebase Analytics works on web. For native apps, you may need to use
 * @react-native-firebase/analytics or expo-firebase-analytics.
 * 
 * This service is designed to work on web immediately and can be extended for native.
 */

let analytics = null
let analyticsEnabled = false

/**
 * Initialize Analytics
 */
export async function initAnalytics() {
  try {
    // Check if Analytics is supported (mainly for web)
    const supported = await isSupported()
    
    if (supported) {
      analytics = getAnalytics(app)
      analyticsEnabled = true
      console.log('📊 Analytics initialized')
    } else {
      console.warn('📊 Analytics not supported on this platform')
      analyticsEnabled = false
    }
  } catch (error) {
    console.error('Error initializing Analytics:', error)
    analyticsEnabled = false
  }
}

/**
 * Track screen views
 */
export async function logScreenView(screenName, screenClass = null) {
  try {
    if (!analyticsEnabled || !analytics) {
      // Fallback: log to console in development
      if (__DEV__) {
        console.log(`📊 Screen view: ${screenName}`)
      }
      return
    }

    await logEvent(analytics, 'screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
      platform: Platform.OS,
    })
    
    if (__DEV__) {
      console.log(`📊 Screen view: ${screenName}`)
    }
  } catch (error) {
    console.error('Analytics error (logScreenView):', error)
  }
}

/**
 * Track user events
 */
export async function logEventCustom(eventName, params = {}) {
  try {
    if (!analyticsEnabled || !analytics) {
      // Fallback: log to console in development
      if (__DEV__) {
        console.log(`📊 Event: ${eventName}`, params)
      }
      return
    }

    await logEvent(analytics, eventName, {
      ...params,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    })
    
    if (__DEV__) {
      console.log(`📊 Event: ${eventName}`, params)
    }
  } catch (error) {
    console.error('Analytics error (logEvent):', error)
  }
}

/**
 * Set user properties
 */
export async function setUserPropertiesCustom(userId, properties = {}) {
  try {
    if (!analyticsEnabled || !analytics) {
      if (__DEV__) {
        console.log('📊 User properties set (fallback):', { userId, properties })
      }
      return
    }

    await setUserId(analytics, userId)
    await setUserProperties(analytics, properties)
    
    if (__DEV__) {
      console.log('📊 User properties set:', { userId, properties })
    }
  } catch (error) {
    console.error('Analytics error (setUserProperties):', error)
  }
}

/**
 * Log errors to Crashlytics (or error tracking service)
 * 
 * Note: Firebase JS SDK doesn't have native Crashlytics support.
 * For native apps, consider using @react-native-firebase/crashlytics
 * or a service like Sentry.
 */
export function logError(error, context = '') {
  try {
    const errorInfo = {
      message: error?.message || String(error),
      stack: error?.stack,
      context,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    }

    // Log to console in development
    if (__DEV__) {
      console.error('🐛 Error logged:', errorInfo)
    }

    // In production, you could send this to:
    // 1. A Firebase Function that logs to Crashlytics
    // 2. A custom error tracking service
    // 3. Firestore for error tracking
    // 4. @react-native-firebase/crashlytics (for native)

    // For now, we'll also log as an Analytics event
    if (analyticsEnabled && analytics) {
      logEventCustom('error_occurred', {
        error_message: errorInfo.message,
        error_context: context,
        platform: Platform.OS,
      }).catch(() => {
        // Silently fail if analytics is not available
      })
    }
  } catch (err) {
    console.error('Error logging error to Crashlytics:', err)
  }
}

/**
 * Set Crashlytics user
 * 
 * Note: This is a placeholder for native Crashlytics integration.
 * For native apps, use @react-native-firebase/crashlytics.
 */
export function setCrashlyticsUser(userId, email = '') {
  try {
    if (__DEV__) {
      console.log('🐛 Crashlytics user set (fallback):', { userId, email })
    }

    // Set as user property for Analytics
    if (analyticsEnabled && analytics) {
      setUserPropertiesCustom(userId, { email }).catch(() => {
        // Silently fail if analytics is not available
      })
    }
  } catch (error) {
    console.error('Crashlytics error (setCrashlyticsUser):', error)
  }
}

/**
 * Custom analytics events for the app
 */
export const Analytics = {
  // User actions
  userLogin: (method) => logEventCustom('login', { method }),
  userRegister: () => logEventCustom('sign_up'),
  userLogout: () => logEventCustom('logout'),

  // Content viewing
  viewLesson: (lessonId, category) => logEventCustom('view_lesson', { 
    lesson_id: lessonId, 
    category 
  }),
  viewNews: (newsId) => logEventCustom('view_news', { news_id: newsId }),
  viewPodcast: (podcastId) => logEventCustom('view_podcast', { podcast_id: podcastId }),

  // User interactions
  shareContent: (contentType, contentId) => logEventCustom('share', { 
    content_type: contentType, 
    item_id: contentId 
  }),
  donate: (amount) => logEventCustom('donate', { 
    value: amount, 
    currency: 'ILS' 
  }),
  contactRabbi: () => logEventCustom('contact_rabbi'),

  // Admin actions
  adminCreateContent: (contentType) => logEventCustom('admin_create', { 
    content_type: contentType 
  }),
  adminUpdateContent: (contentType) => logEventCustom('admin_update', { 
    content_type: contentType 
  }),
  adminDeleteContent: (contentType) => logEventCustom('admin_delete', { 
    content_type: contentType 
  }),
}
