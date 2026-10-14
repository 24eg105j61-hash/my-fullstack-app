import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export default function TaskFilterBar({
  currentStatus,
  onStatusChange,
  counts = { total: 0, pending: 0, completed: 0 },
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  subjects = [],
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="filter-bar">
      {/* Left: Status Filter Tabs */}
      <div className="filter-left">
        <button
          className={`status-tab ${currentStatus === 'all' ? 'active' : ''}`}
          onClick={() => onStatusChange('all')}
        >
          <span>All Tasks</span>
          <span className="tab-badge">{counts.total}</span>
        </button>

        <button
          className={`status-tab ${currentStatus === 'pending' ? 'active' : ''}`}
          onClick={() => onStatusChange('pending')}
        >
          <span>Pending</span>
          <span className="tab-badge">{counts.pending}</span>
        </button>

        <button
          className={`status-tab ${currentStatus === 'completed' ? 'active' : ''}`}
          onClick={() => onStatusChange('completed')}
        >
          <span>Completed</span>
          <span className="tab-badge">{counts.completed}</span>
        </button>
      </div>

      {/* Right: Search, Subject, Priority, Sort */}
      <div className="filter-right">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks or subjects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Subject Filter */}
        <select
          className="select-dropdown"
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          aria-label="Filter by subject"
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          className="select-dropdown"
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Sort */}
        <select
          className="select-dropdown"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort tasks by"
        >
          <option value="due_date-asc">Due Date (Earliest)</option>
          <option value="due_date-desc">Due Date (Latest)</option>
          <option value="priority-desc">Priority (High to Low)</option>
          <option value="title-asc">Title (A - Z)</option>
        </select>
      </div>
    </div>
  );
}
