import React from 'react';
import { GraduationCap, Database, Plus, RefreshCw } from 'lucide-react';

export default function Navbar({ onAddTask, onRefresh, backendHealth, loading }) {
  const isConnected = backendHealth?.status === 'ok';
  const dbType = backendHealth?.database?.type === 'postgresql' ? 'PostgreSQL' : 'Active';

  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="brand-logo-icon">
          <GraduationCap size={26} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="brand-title">Student Planner</h1>
          <p className="brand-subtitle">Academic Workspace & Deadline Tracker</p>
        </div>
      </div>

      <div className="nav-right">
        <div 
          className="health-badge" 
          title={backendHealth?.database?.message || 'Server & Database Connected'}
        >
          <span className="health-dot"></span>
          <span>{isConnected ? `DB: ${dbType}` : 'Connecting...'}</span>
        </div>

        <button 
          className="btn btn-secondary btn-icon" 
          onClick={onRefresh} 
          title="Refresh tasks"
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spinner' : ''} />
        </button>

        <button className="btn btn-primary" onClick={onAddTask}>
          <Plus size={18} strokeWidth={2.5} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
