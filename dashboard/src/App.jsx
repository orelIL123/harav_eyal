import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from './config/firebase'
import { doc, getDoc } from 'firebase/firestore'

import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import Content from './pages/Content'
import Login from './pages/Login'

import './styles/global.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check authorization
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.role === 'admin' || userData.role === 'dashboard') {
              setUser(firebaseUser)
              setAuthorized(true)
            } else {
              await signOut(auth)
              setUser(null)
              setAuthorized(false)
            }
          } else {
            await signOut(auth)
            setUser(null)
            setAuthorized(false)
          }
        } catch (error) {
          console.error('Auth check error:', error)
          setUser(null)
          setAuthorized(false)
        }
      } else {
        setUser(null)
        setAuthorized(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
    setAuthorized(true)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setAuthorized(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>טוען...</p>
      </div>
    )
  }

  if (!user || !authorized) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="dashboard-container">
        <Sidebar onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/content" element={<Content />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
