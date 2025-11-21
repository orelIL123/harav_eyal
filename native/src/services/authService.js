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
import { setDocument, getDocument, getAllDocuments } from './firestore'
import { validateEmail, validatePassword, validatePhone } from '../utils/validation'
import { Analytics, setUserPropertiesCustom, setCrashlyticsUser } from './analyticsService'

/**
 * Authentication Service - כל פונקציות ה-Auth
 */

/**
 * Helper: Check if input is email or phone
 */
function isEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim())
}

/**
 * Helper: Normalize phone number for storage/search
 */
function normalizePhone(phone) {
  return phone.trim().replace(/[\s\-\(\)\+]/g, '')
}

/**
 * Helper: Find user email by phone number
 */
async function findEmailByPhone(phone) {
  try {
    const normalizedPhone = normalizePhone(phone)
    // Search in Firestore for user with this phone
    const users = await getAllDocuments('users', [
      { field: 'phone', operator: '==', value: normalizedPhone }
    ], null, 'asc', 1)
    
    if (users && users.length > 0) {
      // Return the email or the phone-based email format
      const user = users[0]
      if (user.email && !user.email.includes('@phone.local')) {
        return user.email
      }
      // If user registered with phone, return the phone-based email
      return `${normalizedPhone}@phone.local`
    }
    return null
  } catch (error) {
    console.error('Error finding email by phone:', error)
    return null
  }
}

/**
 * Register new user (with email or phone)
 */
export async function register(emailOrPhone, password, displayName = '', phone = null) {
  try {
    let email = emailOrPhone
    let phoneNumber = phone

    // Determine if input is email or phone
    if (isEmail(emailOrPhone)) {
      // Validate email
      const emailValidation = validateEmail(emailOrPhone)
      if (!emailValidation.valid) {
        return { user: null, error: emailValidation.error }
      }
      email = emailOrPhone.trim()
    } else {
      // It's a phone number
      const phoneValidation = validatePhone(emailOrPhone)
      if (!phoneValidation.valid) {
        return { user: null, error: phoneValidation.error }
      }
      
      // For phone registration, create email-like identifier
      // Format: phone@phone.local (Firebase requires email format)
      const normalizedPhone = normalizePhone(emailOrPhone)
      email = `${normalizedPhone}@phone.local`
      phoneNumber = normalizedPhone
    }

    // Validate password
    const passwordValidation = validatePassword(password, { minLength: 6 })
    if (!passwordValidation.valid) {
      return { user: null, error: passwordValidation.error }
    }

    // Check if user already exists (by email or phone)
    if (phoneNumber) {
      const existingEmail = await findEmailByPhone(phoneNumber)
      if (existingEmail) {
        return { user: null, error: 'מספר טלפון זה כבר רשום במערכת' }
      }
    }

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
      email: isEmail(emailOrPhone) ? email : null, // Only store real email
      phone: phoneNumber || null,
      displayName: displayName || (isEmail(emailOrPhone) ? email.split('@')[0] : 'משתמש'),
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
    
    // Track registration in Analytics
    Analytics.userRegister()
    setUserPropertiesCustom(user.uid, { email: email, phone: phoneNumber })
    setCrashlyticsUser(user.uid, email)
    
    return { user, error: null }
  } catch (error) {
    console.error('Registration error:', error)
    return { user: null, error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Login user (with email or phone)
 */
export async function login(emailOrPhone, password) {
  try {
    let email = emailOrPhone

    // Determine if input is email or phone
    if (!isEmail(emailOrPhone)) {
      // It's a phone number - find the associated email
      const phoneValidation = validatePhone(emailOrPhone)
      if (!phoneValidation.valid) {
        return { user: null, error: phoneValidation.error }
      }
      
      const foundEmail = await findEmailByPhone(emailOrPhone)
      if (!foundEmail) {
        return { user: null, error: 'מספר טלפון זה לא רשום במערכת' }
      }
      email = foundEmail
    } else {
      // Validate email
      const emailValidation = validateEmail(emailOrPhone)
      if (!emailValidation.valid) {
        return { user: null, error: emailValidation.error }
      }
      email = emailOrPhone.trim()
    }

    // Password is validated by Firebase, but we can add basic check
    if (!password || password.length === 0) {
      return { user: null, error: 'סיסמה נדרשת' }
    }

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
    
    // Track login in Analytics
    Analytics.userLogin('email')
    setUserPropertiesCustom(user.uid, { email: user.email })
    setCrashlyticsUser(user.uid, user.email)
    
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
    // Track logout in Analytics before signing out
    Analytics.userLogout()
    
    await signOut(auth)
    return { error: null }
  } catch (error) {
    console.error('Logout error:', error)
    return { error: getAuthErrorMessage(error.code) }
  }
}

/**
 * Send password reset (with email or phone)
 */
export async function resetPassword(emailOrPhone) {
  try {
    let email = emailOrPhone

    // Determine if input is email or phone
    if (!isEmail(emailOrPhone)) {
      // It's a phone number - find the associated email
      const phoneValidation = validatePhone(emailOrPhone)
      if (!phoneValidation.valid) {
        return { error: phoneValidation.error }
      }
      
      const foundEmail = await findEmailByPhone(emailOrPhone)
      if (!foundEmail) {
        return { error: 'מספר טלפון זה לא רשום במערכת. אנא פנה לתמיכה' }
      }
      email = foundEmail
    } else {
      // Validate email
      const emailValidation = validateEmail(emailOrPhone)
      if (!emailValidation.valid) {
        return { error: emailValidation.error }
      }
      email = emailOrPhone.trim()
    }

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

    // Validate new password
    const passwordValidation = validatePassword(newPassword, { minLength: 6 })
    if (!passwordValidation.valid) {
      return { error: passwordValidation.error }
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


