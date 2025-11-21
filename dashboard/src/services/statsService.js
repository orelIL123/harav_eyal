import { db } from '../config/firebase'
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore'

/**
 * Get total count for a collection
 */
async function getCollectionCount(collectionName, whereClause = null) {
  try {
    const collectionRef = collection(db, collectionName)
    let q = collectionRef

    if (whereClause) {
      q = query(collectionRef, where(whereClause.field, whereClause.operator, whereClause.value))
    }

    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error(`Error getting count for ${collectionName}:`, error)
    return 0
  }
}

/**
 * Get all users with their details
 */
export async function getAllUsers() {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)

    const users = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        uid: data.uid,
        displayName: data.displayName || 'ללא שם',
        email: data.email || null,
        phone: data.phone || null,
        role: data.role || 'user',
        tier: data.tier || 'free',
        createdAt: data.createdAt?.toDate?.() || null,
        lastLoginAt: data.lastLoginAt?.toDate?.() || null,
        notificationsEnabled: data.notificationsEnabled ?? true,
        metadata: data.metadata || {}
      })
    })

    return users
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    const users = await getAllUsers()

    const totalUsers = users.length
    const adminUsers = users.filter(u => u.role === 'admin').length
    const premiumUsers = users.filter(u => u.tier === 'premium').length
    const usersWithEmail = users.filter(u => u.email).length
    const usersWithPhone = users.filter(u => u.phone).length

    // Calculate new users this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newUsersThisMonth = users.filter(u => {
      return u.createdAt && u.createdAt >= startOfMonth
    }).length

    return {
      totalUsers,
      adminUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      usersWithEmail,
      usersWithPhone,
      newUsersThisMonth,
      users
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      totalUsers: 0,
      adminUsers: 0,
      premiumUsers: 0,
      freeUsers: 0,
      usersWithEmail: 0,
      usersWithPhone: 0,
      newUsersThisMonth: 0,
      users: []
    }
  }
}

/**
 * Get content statistics
 */
export async function getContentStats() {
  try {
    const [
      lessonsCount,
      podcastsCount,
      newsCount,
      booksCount,
      flyersCount,
      alertsCount,
      communityPostsCount,
      faithStoriesCount
    ] = await Promise.all([
      getCollectionCount('lessons'),
      getCollectionCount('podcasts'),
      getCollectionCount('news'),
      getCollectionCount('books'),
      getCollectionCount('flyers'),
      getCollectionCount('alerts'),
      getCollectionCount('communityPosts'),
      getCollectionCount('faithStories')
    ])

    return {
      lessons: lessonsCount,
      podcasts: podcastsCount,
      news: newsCount,
      books: booksCount,
      flyers: flyersCount,
      alerts: alertsCount,
      communityPosts: communityPostsCount,
      faithStories: faithStoriesCount,
      total: lessonsCount + podcastsCount + newsCount + booksCount + flyersCount + alertsCount + communityPostsCount + faithStoriesCount
    }
  } catch (error) {
    console.error('Error getting content stats:', error)
    return {
      lessons: 0,
      podcasts: 0,
      news: 0,
      books: 0,
      flyers: 0,
      alerts: 0,
      communityPosts: 0,
      faithStories: 0,
      total: 0
    }
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limitCount = 10) {
  try {
    // Get recent lessons
    const lessonsRef = collection(db, 'lessons')
    const lessonsQuery = query(lessonsRef, orderBy('createdAt', 'desc'), limit(limitCount))
    const lessonsSnap = await getDocs(lessonsQuery)

    const activities = []

    lessonsSnap.forEach(doc => {
      const data = doc.data()
      activities.push({
        type: 'lesson',
        title: data.title,
        date: data.createdAt?.toDate?.() || null
      })
    })

    // Get recent podcasts
    const podcastsRef = collection(db, 'podcasts')
    const podcastsQuery = query(podcastsRef, orderBy('createdAt', 'desc'), limit(limitCount))
    const podcastsSnap = await getDocs(podcastsQuery)

    podcastsSnap.forEach(doc => {
      const data = doc.data()
      activities.push({
        type: 'podcast',
        title: data.title,
        date: data.createdAt?.toDate?.() || null
      })
    })

    // Sort by date
    activities.sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date - a.date
    })

    return activities.slice(0, limitCount)
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return []
  }
}

/**
 * Get growth data for charts (last 30 days)
 */
export async function getGrowthData() {
  try {
    const users = await getAllUsers()

    // Create array for last 30 days
    const days = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const usersOnDay = users.filter(u => {
        return u.createdAt && u.createdAt >= date && u.createdAt < nextDate
      }).length

      days.push({
        date: date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
        users: usersOnDay
      })
    }

    return days
  } catch (error) {
    console.error('Error getting growth data:', error)
    return []
  }
}

/**
 * Get engagement statistics
 */
export async function getEngagementStats() {
  try {
    const users = await getAllUsers()

    // Calculate users who logged in in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeUsers = users.filter(u => {
      return u.lastLoginAt && u.lastLoginAt >= sevenDaysAgo
    }).length

    const engagementRate = users.length > 0
      ? ((activeUsers / users.length) * 100).toFixed(1)
      : 0

    return {
      activeUsers,
      totalUsers: users.length,
      engagementRate: parseFloat(engagementRate)
    }
  } catch (error) {
    console.error('Error getting engagement stats:', error)
    return {
      activeUsers: 0,
      totalUsers: 0,
      engagementRate: 0
    }
  }
}
