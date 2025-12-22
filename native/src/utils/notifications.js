import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

/**
 * Request permissions and get push token
 */
export async function registerForPushNotificationsAsync() {
  try {
    let token

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      })
    }

    if (!Device.isDevice) {
      console.warn('⚠️ Push notifications require a physical device')
      return null
    }

    // Check current permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    console.log('📱 Current notification permission status:', existingStatus)
    
    let finalStatus = existingStatus

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      console.log('📱 Requesting notification permissions...')
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
      console.log('📱 Permission request result:', status)
    }

    // Check final status
    if (finalStatus === 'granted') {
      try {
        // Get push token - requires projectId for iOS
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: '429bf080-b8a2-42be-a2f6-ba6d3a70cff2' // From app.json extra.eas.projectId
        })
        token = tokenData.data
        console.log('✅ Push notification token received:', token)
        return token
      } catch (tokenError) {
        console.error('❌ Error getting push token:', tokenError)
        // This might happen if:
        // 1. Network issue
        // 2. Expo Push service temporarily unavailable
        // 3. Invalid projectId
        // Don't show alert - this is a technical issue, not user rejection
        return null
      }
    } else if (finalStatus === 'denied') {
      console.warn('⚠️ Notification permissions denied by user')
      // User explicitly denied - don't show alert, they made a choice
      return null
    } else if (finalStatus === 'undetermined') {
      console.log('ℹ️ Notification permissions still undetermined - user may need to grant in Settings')
      // iOS can return undetermined even after user taps allow
      // This usually resolves on next app launch
      return null
    } else {
      console.warn('⚠️ Unknown permission status:', finalStatus)
      return null
    }
  } catch (error) {
    console.error('❌ Error in registerForPushNotificationsAsync:', error)
    // Don't show alert on error - might be temporary network issue
    return null
  }
}

/**
 * Send a local notification (for testing)
 */
export async function sendLocalNotification({ title, body, data = {} }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Send immediately
  })
}

/**
 * Format alert data for push notification
 */
export function formatAlertForPush(alert) {
  const typeEmoji = {
    buy: '📈',
    sell: '📉',
    watch: '👁️'
  }

  return {
    title: `${typeEmoji[alert.type] || '🔔'} ${alert.symbol} - ${alert.type === 'buy' ? 'קנייה' : alert.type === 'sell' ? 'מכירה' : 'מעקב'}`,
    body: `${alert.price} (${alert.change})\n${alert.message}`,
    data: {
      alertId: alert.id,
      symbol: alert.symbol,
      type: alert.type,
      screen: 'LiveAlerts'
    }
  }
}

/**
 * Schedule a notification for later (optional - for scheduled alerts)
 */
export async function scheduleNotification({ title, body, data = {}, triggerDate }) {
  const trigger = triggerDate instanceof Date 
    ? { date: triggerDate }
    : triggerDate
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger,
  })
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/**
 * Get notification badge count
 */
export async function getBadgeCount() {
  return await Notifications.getBadgeCountAsync()
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count) {
  await Notifications.setBadgeCountAsync(count)
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  await Notifications.dismissAllNotificationsAsync()
}
