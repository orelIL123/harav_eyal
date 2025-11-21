import React, { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import { Users, FileText, TrendingUp, Award } from 'lucide-react'
import { getUserStats, getContentStats, getEngagementStats } from '../services/statsService'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState(null)
  const [contentStats, setContentStats] = useState(null)
  const [engagementStats, setEngagementStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [users, content, engagement] = await Promise.all([
        getUserStats(),
        getContentStats(),
        getEngagementStats()
      ])

      setUserStats(users)
      setContentStats(content)
      setEngagementStats(engagement)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>טוען נתונים...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h2>דף הבית</h2>
        <p>סקירה כללית של הסטטיסטיקות והנתונים</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="סך כל המשתמשים"
          value={userStats?.totalUsers || 0}
          change={userStats?.newUsersThisMonth || 0}
          icon={Users}
          iconColor="#4a90e2"
        />

        <StatCard
          title="תוכן כולל"
          value={contentStats?.total || 0}
          icon={FileText}
          iconColor="#10b981"
        />

        <StatCard
          title="משתמשים פעילים (7 ימים)"
          value={engagementStats?.activeUsers || 0}
          change={engagementStats?.engagementRate || 0}
          icon={TrendingUp}
          iconColor="#f59e0b"
        />

        <StatCard
          title="משתמשי פרמיום"
          value={userStats?.premiumUsers || 0}
          icon={Award}
          iconColor="#8b5cf6"
        />
      </div>

      <div className="stats-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h3>פילוח משתמשים</h3>
            <p>חלוקת המשתמשים לפי סוג</p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>משתמשים רגילים</span>
                <strong>{userStats?.freeUsers || 0}</strong>
              </div>
              <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    background: '#4a90e2',
                    height: '100%',
                    width: `${userStats?.totalUsers > 0 ? (userStats.freeUsers / userStats.totalUsers) * 100 : 0}%`,
                    transition: 'width 0.3s'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>משתמשי פרמיום</span>
                <strong>{userStats?.premiumUsers || 0}</strong>
              </div>
              <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    background: '#8b5cf6',
                    height: '100%',
                    width: `${userStats?.totalUsers > 0 ? (userStats.premiumUsers / userStats.totalUsers) * 100 : 0}%`,
                    transition: 'width 0.3s'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>מנהלים</span>
                <strong>{userStats?.adminUsers || 0}</strong>
              </div>
              <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    background: '#f59e0b',
                    height: '100%',
                    width: `${userStats?.totalUsers > 0 ? (userStats.adminUsers / userStats.totalUsers) * 100 : 0}%`,
                    transition: 'width 0.3s'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>פילוח תוכן</h3>
            <p>סך כל פריטי התוכן לפי קטגוריה</p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>שיעורים</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {contentStats?.lessons || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>פודקאסטים</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {contentStats?.podcasts || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>חדשות</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {contentStats?.news || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>ספרים</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {contentStats?.books || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>עלונים</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {contentStats?.flyers || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>התראות</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {contentStats?.alerts || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
