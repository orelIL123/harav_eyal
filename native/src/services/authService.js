import { auth } from '../config/firebase'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { setDocument, getDocument } from './firestore'

/**
 * Authentication Service - כל פונקציות ה-Auth
 */

/**
 * Register new user
 */
export async function register(email, password, displayName = '') {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update display name
    if (displayName) {
      await updateProfile(user, { displayName })
    }
    
    // Create user document in Firestore
    await setDocument('users', user.uid, {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.email?.split('@')[0] || 'משתמש',
      photoURL: null,
      role: 'user',
      tier: 'free',
      notificationsEnabled: true,
      fcmTokens: [],
      metadata: {
        onboardingCompleted: false,
        preferredLanguage: 'he'
      }
    }, false) // false = don't merge, create new
    
    return { user, error: null }
  } catch (error) {
    console.error('Registration error:', error)
    return { user: null, error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Login user
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    console.log('🔐 Login successful:', { uid: user.uid, email: user.email })
    
    // Clear ALL cache for this user to force refresh
    try {
      const { removeCached, CACHE_KEYS, clearAllCache } = await import('../utils/cache')
      // Clear specific user caches
      await removeCached(CACHE_KEYS.USER(user.uid))
      await removeCached(CACHE_KEYS.USER_ADMIN(user.uid))
      // Also clear all cache to be safe
      await clearAllCache()
      console.log('🧹 All cache cleared for user')
    } catch (cacheError) {
      console.warn('Warning: Could not clear cache:', cacheError)
    }
    
    // Force refresh user data immediately
    try {
      const { userData } = await getUserData(user.uid)
      console.log('📋 User data refreshed:', { role: userData?.role, email: userData?.email })
    } catch (error) {
      console.warn('Warning: Could not refresh user data:', error)
    }
    
    // Update last login time
    await setDocument('users', user.uid, {
      lastLoginAt: new Date()
    }, true) // true = merge
    
    return { user, error: null }
  } catch (error) {
    console.error('Login error:', error)
    return { user: null, error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    console.error('Logout error:', error)
    return { error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error) {
    console.error('Password reset error:', error)
    return { error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get user data from Firestore
 */
export async function getUserData(userId) {
  try {
    console.log(`🔍 Getting user data for: ${userId}`)
    const userData = await getDocument('users', userId)
    if (userData) {
      console.log(`✅ User data retrieved:`, { 
        uid: userData.uid, 
        email: userData.email, 
        role: userData.role,
        tier: userData.tier 
      })
    } else {
      console.log(`⚠️ User data is null for: ${userId}`)
    }
    return { userData, error: null }
  } catch (error) {
    console.error('❌ Error getting user data:', error)
    console.error(`   Error code: ${error.code}`)
    console.error(`   Error message: ${error.message}`)
    if (error.code === 'permission-denied') {
      console.error('   ⚠️ PERMISSION DENIED - Check Firestore Rules!')
    }
    return { userData: null, error: error.message }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates) {
  try {
    // Update Firebase Auth profile if needed
    const user = auth.currentUser
    if (user && updates.displayName) {
      await updateProfile(user, { displayName: updates.displayName })
    }
    if (user && updates.photoURL) {
      await updateProfile(user, { photoURL: updates.photoURL })
    }
    
    // Update Firestore
    await setDocument('users', userId, updates, true)
    return { error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Change password
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      return { error: 'משתמש לא מחובר' }
    }
    
    // Re-authenticate
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    
    // Update password
    await updatePassword(user, newPassword)
    return { error: null }
  } catch (error) {
    console.error('Error changing password:', error)
    return { error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(userId) {
  try {
    const userData = await getDocument('users', userId)
    console.log('🔍 isUserAdmin check:', { userId, role: userData?.role, userData })
    const isAdmin = userData?.role === 'admin'
    console.log('✅ isUserAdmin result:', isAdmin)
    return isAdmin
  } catch (error) {
    console.error('❌ Error checking admin status:', error)
    return false
  }
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'כתובת האימייל כבר בשימוש',
    'auth/invalid-email': 'כתובת אימייל לא תקינה',
    'auth/operation-not-allowed': 'פעולה לא מורשית',
    'auth/weak-password': 'הסיסמה חלשה מדי (מינימום 6 תווים)',
    'auth/user-disabled': 'המשתמש הושבת',
    'auth/user-not-found': 'משתמש לא נמצא',
    'auth/wrong-password': 'סיסמה שגויה',
    'auth/invalid-credential': 'פרטי התחברות שגויים',
    'auth/too-many-requests': 'יותר מדי ניסיונות. נסה שוב מאוחר יותר',
    'auth/network-request-failed': 'בעיית רשת. בדוק את החיבור לאינטרנט',
    'auth/requires-recent-login': 'נדרש להתחבר מחדש לביטחון',
  }
  
  return errorMessages[errorCode] || 'שגיאה לא ידועה. נסה שוב'
}


