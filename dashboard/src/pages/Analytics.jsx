import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { getGrowthData, getEngagementStats } from '../services/statsService'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [growthData, setGrowthData] = useState([])
  const [engagement, setEngagement] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [growth, eng] = await Promise.all([
        getGrowthData(),
        getEngagementStats()
      ])

      setGrowthData(growth)
      setEngagement(eng)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>טוען ניתוחים...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h2>ניתוחים</h2>
        <p>תובנות ונתונים סטטיסטיים מפורטים</p>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3>גידול משתמשים - 30 ימים אחרונים</h3>
          <p>מספר משתמשים חדשים ליום</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#4a90e2"
              strokeWidth={2}
              name="משתמשים חדשים"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3>אחוז מעורבות</h3>
          <p>משתמשים פעילים מול משתמשים כוללים</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', fontWeight: '700', color: '#4a90e2', marginBottom: '16px' }}>
            {engagement?.engagementRate || 0}%
          </div>
          <div style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            {engagement?.activeUsers || 0} מתוך {engagement?.totalUsers || 0} משתמשים
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: '#e5e7eb', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
              <div
                style={{
                  background: 'linear-gradient(90deg, #4a90e2 0%, #357abd 100%)',
                  height: '100%',
                  width: `${engagement?.engagementRate || 0}%`,
                  transition: 'width 1s ease-out'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3>פעילות משתמשים לפי יום</h3>
          <p>התפלגות המשתמשים החדשים</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#10b981" name="משתמשים חדשים" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
