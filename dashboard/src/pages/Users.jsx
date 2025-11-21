import React, { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { getAllUsers } from '../services/statsService'
import { format } from 'date-fns'

export default function Users() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = users.filter(user => {
      return (
        (user.displayName && user.displayName.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.phone && user.phone.includes(term))
      )
    })
    setFilteredUsers(filtered)
  }

  const exportToCSV = () => {
    const headers = ['שם', 'אימייל', 'טלפון', 'תפקיד', 'סוג חשבון', 'תאריך הצטרפות']
    const rows = filteredUsers.map(user => [
      user.displayName,
      user.email || '',
      user.phone || '',
      user.role,
      user.tier,
      user.createdAt ? format(user.createdAt, 'dd/MM/yyyy') : ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>טוען משתמשים...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h2>משתמשים</h2>
        <p>רשימת כל המשתמשים באפליקציה</p>
      </div>

      <div className="data-table-container">
        <div className="table-header">
          <h3>סך כל משתמשים: {filteredUsers.length}</h3>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="חיפוש לפי שם, אימייל או טלפון..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" onClick={exportToCSV}>
              <Download size={16} style={{ marginLeft: '8px' }} />
              ייצא ל-CSV
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>שם</th>
              <th>אימייל</th>
              <th>טלפון</th>
              <th>תפקיד</th>
              <th>סוג חשבון</th>
              <th>תאריך הצטרפות</th>
              <th>כניסה אחרונה</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.displayName}</td>
                <td>{user.email || '-'}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.tier}`}>
                    {user.tier === 'premium' ? 'פרמיום' : 'חינם'}
                  </span>
                </td>
                <td>
                  {user.createdAt ? format(user.createdAt, 'dd/MM/yyyy') : '-'}
                </td>
                <td>
                  {user.lastLoginAt ? format(user.lastLoginAt, 'dd/MM/yyyy HH:mm') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            לא נמצאו משתמשים
          </div>
        )}
      </div>
    </div>
  )
}
