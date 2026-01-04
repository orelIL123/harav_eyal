import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, change, icon: Icon, iconColor, changeLabel }) {
  const isPositive = change > 0
  const changeAbs = Math.abs(change)
  // If change is less than 100, it's likely a count, not a percentage
  const isCount = change !== undefined && changeAbs < 100
  const displayLabel = changeLabel || (isCount ? 'החודש' : '% מהחודש שעבר')

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3>{title}</h3>
        <div className="stat-icon" style={{ background: iconColor + '20', color: iconColor }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value">{value.toLocaleString('he-IL')}</div>
      {change !== undefined && (
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{changeAbs.toLocaleString('he-IL')} {displayLabel}</span>
        </div>
      )}
    </div>
  )
}
