import React from 'react';
import { BookOpen, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StatsOverview({ summary = { total: 0, pending: 0, completed: 0 } }) {
  const { total = 0, pending = 0, completed = 0 } = summary;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="stats-grid" aria-label="Task Statistics">
      {/* Total Tasks */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Tasks</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <BookOpen size={20} />
          </div>
        </div>
        <div className="stat-value">{total}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Across all courses & subjects
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Pending</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={20} />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#fbbf24' }}>{pending}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {pending === 1 ? '1 task needs attention' : `${pending} tasks need attention`}
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Completed</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#34d399' }}>{completed}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Great job staying on track!
        </div>
      </div>

      {/* Completion Rate */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Progress</span>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#22d3ee' }}>{completionPercentage}%</div>
        <div className="stat-progress-bar">
          <div 
            className="stat-progress-fill" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </section>
  );
}
