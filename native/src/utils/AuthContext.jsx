import React, { createContext, useState, useEffect, useContext } from 'react'
import { onAuthStateChange, getUserData, isUserAdmin } from '../services/authService'

const AuthContext = createContext({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUid, setLastUid] = useState(null)

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        console.log('🔄 Auth state changed - user logged in:', firebaseUser.uid)

        // Only fetch if user changed or data missing
        const userChanged = lastUid !== firebaseUser.uid

        if (userChanged || !userData) {
          setUser(firebaseUser)
          setLastUid(firebaseUser.uid)
          console.log('🔄 User changed or data missing - fetching fresh data')

          // Get user data from Firestore (cached by authService)
          try {
            const { userData: data } = await getUserData(firebaseUser.uid)
            setUserData(data)
          console.log('📋 User data loaded:', { 
            uid: firebaseUser.uid, 
            email: data?.email, 
            role: data?.role,
            tier: data?.tier,
            displayName: data?.displayName
          })
          
          // Check if admin - use direct check without cache
          const admin = await isUserAdmin(firebaseUser.uid)
          console.log('🔐 Admin check result:', admin, 'Role from data:', data?.role)
          setIsAdmin(admin)
          
          if (admin) {
            console.log('✅ User is ADMIN - admin panel should be visible!')
          } else {
            console.log('❌ User is NOT admin - role:', data?.role)
          }

          // Register for push notifications and save token
          try {
            const { registerForPushNotificationsAsync } = await import('../utils/notifications')
            const token = await registerForPushNotificationsAsync()
            if (token) {
              console.log('📱 Push notification token received:', token)

              // Try to migrate tokens from anonymous user
              let tokensToSave = data?.expoPushTokens || []

              try {
                const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default)
                const { getDocument, deleteDocument } = await import('../services/firestore')

                // Get anonymous user ID
                const anonymousId = await AsyncStorage.getItem('@anonymous_user_id')
                if (anonymousId && anonymousId !== firebaseUser.uid) {
                  console.log('📱 Found anonymous user ID:', anonymousId)

                  // Try to get tokens from anonymous user
                  try {
                    const anonData = await getDocument('users', anonymousId)
                    if (anonData?.expoPushTokens) {
                      console.log('📱 Migrating tokens from anonymous user:', anonData.expoPushTokens)
                      // Merge tokens
                      tokensToSave = [...new Set([...tokensToSave, ...anonData.expoPushTokens])]

                      // Delete anonymous user document
                      await deleteDocument('users', anonymousId)
                      console.log('✅ Anonymous user document deleted')
                    }
                  } catch (anonError) {
                    console.log('ℹ️ No anonymous user document found')
                  }

                  // Clear anonymous ID from storage
                  await AsyncStorage.removeItem('@anonymous_user_id')
                }
              } catch (migrateError) {
                console.warn('⚠️ Error migrating anonymous tokens:', migrateError)
              }

              // Add current token if not already in list
              if (!tokensToSave.includes(token)) {
                tokensToSave.push(token)
              }

              // Save all tokens to Firestore
              try {
                const { updateUserData } = await import('../services/firestore')
                await updateUserData(firebaseUser.uid, {
                  expoPushTokens: tokensToSave,
                  lastPushTokenUpdate: new Date()
                })
                console.log('✅ Push tokens saved to Firestore:', tokensToSave.length)
              } catch (saveError) {
                console.warn('⚠️ Could not save push token to Firestore:', saveError)
                // Don't fail if token save fails
              }
            } else {
              console.log('ℹ️ No push token received (permissions may not be granted)')
              // This is normal - user might have denied permissions or it's a simulator
            }
          } catch (pushError) {
            console.warn('⚠️ Could not register for push notifications:', pushError)
            // Don't fail auth if push notifications fail - this is non-critical
          }
          } catch (error) {
            console.error('❌ Error loading user data:', error)
            setUserData(null)
            setIsAdmin(false)
          }
        } else {
          // User persisted from previous session - just update state without refetching
          console.log('✅ User persisted - using existing data')
          setUser(firebaseUser)
        }
      } else {
        console.log('🔄 Auth state changed - user logged out')
        setUser(null)
        setUserData(null)
        setIsAdmin(false)
        setLastUid(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [lastUid, userData])

  const login = async (email, password) => {
    const { login: loginFunc } = await import('../services/authService')
    return await loginFunc(email, password)
  }

  const logout = async () => {
    const { logout: logoutFunc } = await import('../services/authService')
    const result = await logoutFunc()
    if (!result.error) {
      setUser(null)
      setUserData(null)
      setIsAdmin(false)
    }
    return result
  }

  const register = async (email, password, displayName) => {
    const { register: registerFunc } = await import('../services/authService')
    return await registerFunc(email, password, displayName)
  }

  const refreshUserData = async () => {
    if (user) {
      try {
        const { userData: data } = await getUserData(user.uid);
        setUserData(data);
        const admin = await isUserAdmin(user.uid);
        setIsAdmin(admin);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      isAdmin,
      loading,
      login,
      logout,
      register,
      refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}


