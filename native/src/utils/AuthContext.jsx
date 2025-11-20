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

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        console.log('🔄 Auth state changed - user logged in:', firebaseUser.uid)
        
        // Clear cache first to ensure fresh data
        try {
          const { clearAllCache } = await import('../utils/cache')
          await clearAllCache()
          console.log('🧹 Cache cleared in AuthContext')
        } catch (cacheError) {
          console.warn('Warning: Could not clear cache:', cacheError)
        }
        
        // Get user data from Firestore
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
        } catch (error) {
          console.error('❌ Error loading user data:', error)
          setUserData(null)
          setIsAdmin(false)
        }
      } else {
        console.log('🔄 Auth state changed - user logged out')
        setUser(null)
        setUserData(null)
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      isAdmin,
      loading,
      login,
      logout,
      register,
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


