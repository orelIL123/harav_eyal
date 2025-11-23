import { auth, db } from '../config/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'

/**
 * Auth Service - Handle authentication operations
 */

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function that receives the user object
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Get user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<{userData: object | null, error: string | null}>}
 */
export async function getUserData(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { userData: userDoc.data(), error: null }
    }
    return { userData: null, error: 'User data not found' }
  } catch (error) {
    console.error('Error getting user data:', error)
    return { userData: null, error: error.message }
  }
}

/**
 * Check if user is admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function isUserAdmin(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.role === 'admin'
    }
    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Login user with email/phone and password
 * @param {string} emailOrPhone - User email or phone number
 * @param {string} password - User password
 * @returns {Promise<{user: object | null, error: string | null}>}
 */
export async function login(emailOrPhone, password) {
  try {
    // Determine if input is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone.trim())

    let authEmail = emailOrPhone.trim()

    // If phone number, convert to fake email format
    if (!isEmail) {
      const cleanPhone = emailOrPhone.trim().replace(/[\s\-\(\)\+]/g, '')
      const normalizedPhone = cleanPhone.startsWith('972') ? '0' + cleanPhone.slice(3) : cleanPhone
      authEmail = `${normalizedPhone}@phone.local`
    }

    const userCredential = await signInWithEmailAndPassword(auth, authEmail, password)

    // Update last login time
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.warn('Could not update last login time:', error)
    }

    return { user: userCredential.user, error: null }
  } catch (error) {
    console.error('Login error:', error)
    let errorMessage = 'שגיאה בהתחברות'

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'משתמש לא נמצא'
        break
      case 'auth/wrong-password':
        errorMessage = 'סיסמה שגויה'
        break
      case 'auth/invalid-email':
        errorMessage = 'כתובת אימייל או טלפון לא תקין'
        break
      case 'auth/user-disabled':
        errorMessage = 'המשתמש הושבת'
        break
      case 'auth/too-many-requests':
        errorMessage = 'יותר מדי ניסיונות. נסה שוב מאוחר יותר'
        break
      default:
        errorMessage = error.message || 'שגיאה בהתחברות'
    }

    return { user: null, error: errorMessage }
  }
}

/**
 * Register new user
 * @param {string} emailOrPhone - User email or phone number
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @param {string} phone - Phone number (optional, used if emailOrPhone is phone)
 * @returns {Promise<{user: object | null, error: string | null}>}
 */
export async function register(emailOrPhone, password, displayName, phone = null) {
  try {
    // Determine if input is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone.trim())

    let authEmail = emailOrPhone.trim()
    let userPhone = phone

    // If phone number, create a fake email for Firebase Auth
    if (!isEmail) {
      // Clean phone number - remove spaces, dashes, etc
      const cleanPhone = emailOrPhone.trim().replace(/[\s\-\(\)\+]/g, '')
      // Normalize to start with 0 if it starts with 972
      const normalizedPhone = cleanPhone.startsWith('972') ? '0' + cleanPhone.slice(3) : cleanPhone
      userPhone = normalizedPhone
      // Create fake email from phone for Firebase Auth
      authEmail = `${normalizedPhone}@phone.local`
    }

    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password)

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: isEmail ? emailOrPhone.trim() : null,
      phone: userPhone,
      displayName: displayName || '',
      photoURL: null,
      tier: 'free',
      role: 'user',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      notificationsEnabled: true,
      fcmTokens: [],
      streakDays: 0,
      completedCourses: [],
      metadata: {
        onboardingCompleted: false,
        preferredLanguage: 'he'
      }
    })

    return { user: userCredential.user, error: null }
  } catch (error) {
    console.error('Registration error:', error)
    let errorMessage = 'שגיאה בהרשמה'

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'האימייל או מספר הטלפון כבר בשימוש'
        break
      case 'auth/invalid-email':
        errorMessage = 'כתובת אימייל לא תקינה'
        break
      case 'auth/weak-password':
        errorMessage = 'הסיסמה חלשה מדי'
        break
      default:
        errorMessage = error.message || 'שגיאה בהרשמה'
    }

    return { user: null, error: errorMessage }
  }
}

/**
 * Logout current user
 * @returns {Promise<{error: string | null}>}
 */
export async function logout() {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    console.error('Logout error:', error)
    return { error: error.message || 'שגיאה בהתנתקות' }
  }
}

/**
 * Reset password
 * @param {string} email - User email
 * @returns {Promise<{error: string | null}>}
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error) {
    console.error('Password reset error:', error)
    let errorMessage = 'שגיאה באיפוס סיסמה'
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'משתמש לא נמצא'
        break
      case 'auth/invalid-email':
        errorMessage = 'כתובת אימייל לא תקינה'
        break
      default:
        errorMessage = error.message || 'שגיאה באיפוס סיסמה'
    }
    
    return { error: errorMessage }
  }
}

/**
 * Update user password
 * @param {string} newPassword - The new password
 * @returns {Promise<{error: string | null}>}
 */
export async function updateUserPassword(newPassword) {
  const user = auth.currentUser
  if (!user) {
    return { error: 'No user is currently signed in.' }
  }

  try {
    await updatePassword(user, newPassword)
    return { error: null }
  } catch (error) {
    console.error('Password update error:', error)
    let errorMessage = 'שגיאה בעדכון הסיסמה.'
    if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'פעולה זו דורשת אימות מחדש. אנא התחבר שוב ונסה שנית.'
    }
    return { error: errorMessage }
  }
}

/**
 * Delete user account permanently
 * Requires reauthentication with password for security
 * @param {string} password - User password for reauthentication
 * @returns {Promise<{error: string | null}>}
 */
export async function deleteAccount(password) {
  const user = auth.currentUser
  if (!user) {
    return { error: 'אין משתמש מחובר' }
  }

  try {
    // Reauthenticate user with password
    const email = user.email
    if (!email) {
      return { error: 'לא ניתן לזהות את המשתמש' }
    }

    // Create credential for reauthentication
    const credential = EmailAuthProvider.credential(email, password)
    await reauthenticateWithCredential(user, credential)

    // Delete user document from Firestore
    try {
      await deleteDoc(doc(db, 'users', user.uid))
      console.log('✅ User document deleted from Firestore')
    } catch (firestoreError) {
      console.error('Error deleting user document from Firestore:', firestoreError)
      // Continue with auth deletion even if Firestore deletion fails
    }

    // Delete Firebase Auth account
    await deleteUser(user)
    console.log('✅ User account deleted from Firebase Auth')

    // Sign out (should happen automatically, but ensure it)
    await signOut(auth)

    return { error: null }
  } catch (error) {
    console.error('Account deletion error:', error)
    let errorMessage = 'שגיאה במחיקת החשבון'

    switch (error.code) {
      case 'auth/wrong-password':
        errorMessage = 'סיסמה שגויה. אנא נסה שוב.'
        break
      case 'auth/requires-recent-login':
        errorMessage = 'פעולה זו דורשת אימות מחדש. אנא התחבר שוב ונסה שנית.'
        break
      case 'auth/user-mismatch':
        errorMessage = 'שגיאה באימות המשתמש'
        break
      case 'auth/invalid-credential':
        errorMessage = 'פרטי התחברות לא תקינים'
        break
      default:
        errorMessage = error.message || 'שגיאה במחיקת החשבון'
    }

    return { error: errorMessage }
  }
}

