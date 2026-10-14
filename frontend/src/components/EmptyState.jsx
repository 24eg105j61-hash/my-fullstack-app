import React from 'react';
import { ClipboardList, Plus, Sparkles, FilterX } from 'lucide-react';

export default function EmptyState({ isFiltered, onClearFilters, onAddTask, onLoadDemo, isLoadingDemo }) {
  if (isFiltered) {
    return (
      <div className="empty-state">
        <div className="empty-icon-circle">
          <FilterX size={32} />
        </div>
        <h3 className="empty-title">No matching tasks found</h3>
        <p className="empty-description">
          We couldn't find any tasks matching your current search or filter criteria. Try adjusting or clearing your filters.
        </p>
        <button className="btn btn-secondary" onClick={onClearFilters}>
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-icon-circle">
        <ClipboardList size={32} />
      </div>
      <h3 className="empty-title">Your planner is currently clear</h3>
      <p className="empty-description">
        Stay ahead of your semester by adding assignments, project milestones, and exam dates!
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={onAddTask}>
          <Plus size={18} />
          <span>Add Your First Task</span>
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onLoadDemo}
          disabled={isLoadingDemo}
        >
          {isLoadingDemo ? (
            <>
              <span className="spinner" />
              <span>Loading Demo...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} color="#fbbf24" />
              <span>Load Demo Tasks</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
