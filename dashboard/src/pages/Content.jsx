import React, { useState, useEffect } from 'react'
import { getContentStats } from '../services/statsService'
import {
  BookOpen,
  Headphones,
  Newspaper,
  Book,
  FileText,
  Bell,
  MessageCircle,
  Video
} from 'lucide-react'

export default function Content() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getContentStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading content stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>טוען נתוני תוכן...</p>
      </div>
    )
  }

  const contentItems = [
    { label: 'שיעורים', value: stats?.lessons || 0, icon: BookOpen, color: '#4a90e2' },
    { label: 'פודקאסטים', value: stats?.podcasts || 0, icon: Headphones, color: '#8b5cf6' },
    { label: 'חדשות', value: stats?.news || 0, icon: Newspaper, color: '#10b981' },
    { label: 'ספרים', value: stats?.books || 0, icon: Book, color: '#f59e0b' },
    { label: 'עלונים', value: stats?.flyers || 0, icon: FileText, color: '#06b6d4' },
    { label: 'התראות', value: stats?.alerts || 0, icon: Bell, color: '#ef4444' },
    { label: 'פוסטים קהילתיים', value: stats?.communityPosts || 0, icon: MessageCircle, color: '#ec4899' },
    { label: 'סיפורי אמונה', value: stats?.faithStories || 0, icon: Video, color: '#6366f1' }
  ]

  return (
    <div>
      <div className="page-header">
        <h2>תוכן</h2>
        <p>סקירה של כל סוגי התוכן באפליקציה</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div className="chart-container">
          <div className="chart-header">
            <h3>סה"כ תוכן: {stats?.total || 0} פריטים</h3>
            <p>התפלגות לפי קטגוריות</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {contentItems.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="stat-card-header">
              <h3>{item.label}</h3>
              <div className="stat-icon" style={{ background: item.color + '20', color: item.color }}>
                <item.icon size={20} />
              </div>
            </div>
            <div className="stat-value">{item.value.toLocaleString('he-IL')}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              {((item.value / (stats?.total || 1)) * 100).toFixed(1)}% מהתוכן הכולל
            </div>
          </div>
        ))}
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3>התפלגות תוכן</h3>
          <p>תרשים התפלגות מפורט</p>
        </div>
        <div style={{ padding: '20px' }}>
          {contentItems.map((item) => {
            const percentage = stats?.total > 0 ? (item.value / stats.total) * 100 : 0
            return (
              <div key={item.label} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: item.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color
                    }}>
                      <item.icon size={16} />
                    </div>
                    <span style={{ fontWeight: '500' }}>{item.label}</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '18px' }}>{item.value}</strong>
                    <span style={{ color: '#666', marginRight: '8px' }}>
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div style={{ background: '#e5e7eb', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: item.color,
                      height: '100%',
                      width: `${percentage}%`,
                      transition: 'width 0.5s ease-out'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
