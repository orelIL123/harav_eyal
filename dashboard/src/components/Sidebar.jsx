import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut
} from 'lucide-react'

export default function Sidebar({ onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>לוח בקרה</h1>
        <p>הרב אייל עמרמי</p>
      </div>

      <nav>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              <LayoutDashboard size={20} />
              <span>דף הבית</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/users" className="nav-link">
              <Users size={20} />
              <span>משתמשים</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/analytics" className="nav-link">
              <BarChart3 size={20} />
              <span>ניתוחים</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/content" className="nav-link">
              <FileText size={20} />
              <span>תוכן</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div style={{ position: 'absolute', bottom: '20px', width: 'calc(100% - 40px)' }}>
        <button
          onClick={onLogout}
          className="nav-link"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#ccc'
          }}
        >
          <LogOut size={20} />
          <span>יציאה</span>
        </button>
      </div>
    </div>
  )
}
