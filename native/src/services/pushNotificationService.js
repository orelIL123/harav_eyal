import { db } from '../config/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

/**
 * Send push notifications to multiple users using Expo Push API
 */
export async function sendPushNotificationsToUsers(title, body, data = {}, targetAudience = ['all']) {
  try {
    console.log('📤 Sending push notifications...', { title, targetAudience })

    // Get all user tokens from Firestore
    const usersRef = collection(db, 'users')
    let snapshot

    // Determine which users to target
    if (targetAudience.includes('all')) {
      // Send to ALL users (even those without accounts - we'll get all tokens)
      console.log('📤 Targeting: ALL users')
      snapshot = await getDocs(usersRef)
    } else if (targetAudience.includes('registered')) {
      // Send to registered users only (users with email/account info)
      console.log('📤 Targeting: Registered users only')
      const q = query(usersRef, where('email', '!=', null))
      snapshot = await getDocs(q)
    } else {
      // Default to all users
      console.log('📤 Targeting: ALL users (default)')
      snapshot = await getDocs(usersRef)
    }

    const allTokens = []
    let userCount = 0

    snapshot.forEach((doc) => {
      const userData = doc.data()
      const tokens = userData.expoPushTokens || []

      // Only count users who have at least one token
      if (tokens.length > 0) {
        userCount++
        allTokens.push(...tokens)
      }
    })

    // Remove duplicates
    const uniqueTokens = [...new Set(allTokens)]

    console.log(`📱 Found ${uniqueTokens.length} unique push tokens from ${userCount} users`)

    if (uniqueTokens.length === 0) {
      console.warn('⚠️ No push tokens found')
      return { success: true, sentCount: 0, userCount: 0 }
    }

    // Prepare messages for Expo Push API
    const messages = uniqueTokens
      .filter(token => token && token.startsWith('ExponentPushToken['))
      .map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
        channelId: 'default',
      }))

    console.log(`📨 Prepared ${messages.length} messages`)

    // Send in chunks of 100 (Expo's limit)
    const chunkSize = 100
    const results = []

    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize)

      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        })

        const result = await response.json()
        results.push(result)

        console.log(`✅ Sent chunk ${i / chunkSize + 1}:`, result)
      } catch (error) {
        console.error(`❌ Error sending chunk ${i / chunkSize + 1}:`, error)
      }
    }

    // Count successful sends
    let successCount = 0
    let errorCount = 0

    results.forEach(result => {
      if (result.data) {
        result.data.forEach(receipt => {
          if (receipt.status === 'ok') {
            successCount++
          } else {
            errorCount++
            console.error('❌ Push notification error:', receipt)
          }
        })
      }
    })

    console.log(`✅ Push notifications sent: ${successCount} success, ${errorCount} errors`)

    return {
      success: true,
      sentCount: successCount,
      errorCount: errorCount,
      userCount: userCount,
      results: results
    }
  } catch (error) {
    console.error('❌ Error sending push notifications:', error)
    throw error
  }
}

/**
 * Send push notification to a specific user by userId
 */
export async function sendPushNotificationToUser(userId, title, body, data = {}) {
  try {
    console.log('📤 Sending push notification to user:', userId)

    // Get user tokens from Firestore
    const { getDocument } = await import('./firestore')
    const userData = await getDocument('users', userId)

    if (!userData || !userData.expoPushTokens || userData.expoPushTokens.length === 0) {
      console.warn('⚠️ No push tokens found for user:', userId)
      return { success: false, error: 'No push tokens found' }
    }

    const messages = userData.expoPushTokens
      .filter(token => token && token.startsWith('ExponentPushToken['))
      .map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
        channelId: 'default',
      }))

    if (messages.length === 0) {
      console.warn('⚠️ No valid push tokens found for user:', userId)
      return { success: false, error: 'No valid push tokens' }
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()
    console.log('✅ Push notification sent:', result)

    return {
      success: true,
      result: result
    }
  } catch (error) {
    console.error('❌ Error sending push notification to user:', error)
    throw error
  }
}

/**
 * Get all users with push tokens (for analytics)
 */
export async function getUsersWithPushTokens() {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('expoPushTokens', '!=', null))
    const snapshot = await getDocs(q)

    const users = []
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return users
  } catch (error) {
    console.error('❌ Error getting users with push tokens:', error)
    throw error
  }
}
