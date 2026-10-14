import React from 'react';
import { Check, Edit2, Trash2, Calendar, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * Format due date and determine urgency state
 */
function getDueDateStatus(dueDateStr, isCompleted) {
  if (!dueDateStr) return { label: 'No date', status: 'normal' };

  const [year, month, day] = dueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${monthNames[due.getMonth()]} ${due.getDate()}, ${due.getFullYear()}`;

  if (isCompleted) {
    return { label: formattedDate, status: 'normal' };
  }

  if (diffDays < 0) {
    return { 
      label: `Overdue (${Math.abs(diffDays)}d ago)`, 
      status: 'overdue',
      formattedDate
    };
  } else if (diffDays === 0) {
    return { 
      label: 'Due Today', 
      status: 'today',
      formattedDate
    };
  } else if (diffDays === 1) {
    return { 
      label: 'Due Tomorrow', 
      status: 'tomorrow',
      formattedDate
    };
  } else if (diffDays <= 7) {
    return { 
      label: `In ${diffDays} days`, 
      status: 'soon',
      formattedDate
    };
  }

  return { label: formattedDate, status: 'normal' };
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const { id, title, subject, due_date, priority, completed } = task;
  const dateInfo = getDueDateStatus(due_date, completed);

  return (
    <article className={`task-card ${completed ? 'is-completed' : ''}`}>
      <div className="task-top">
        {/* Toggle completion button */}
        <button
          className="checkbox-button"
          onClick={() => onToggle(id)}
          aria-label={completed ? `Mark "${title}" as pending` : `Mark "${title}" as completed`}
          title={completed ? 'Mark as pending' : 'Mark as complete'}
        >
          <div className={`custom-checkbox ${completed ? 'checked' : ''}`}>
            {completed && <Check size={14} strokeWidth={3} color="white" />}
          </div>
        </button>

        {/* Title and Badges */}
        <div className="task-content">
          <h3 className="task-title">{title}</h3>

          <div className="badge-group">
            {/* Subject Badge */}
            <span className="badge badge-subject">
              {subject}
            </span>

            {/* Priority Badge */}
            <span className={`badge badge-priority-${priority?.toLowerCase()}`}>
              {priority === 'High' && <AlertCircle size={12} />}
              {priority === 'Medium' && <AlertTriangle size={12} />}
              {priority === 'Low' && <ShieldCheck size={12} />}
              <span>{priority} Priority</span>
            </span>

            {/* Urgency Badge */}
            <span className={`badge badge-due ${dateInfo.status}`}>
              <Calendar size={12} />
              <span>{dateInfo.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar: Exact Date + Edit & Delete Actions */}
      <div className="task-bottom">
        <div className="task-date-info">
          <span>Target deadline:</span>
          <strong style={{ color: 'var(--text-secondary)' }}>
            {dateInfo.formattedDate || due_date}
          </strong>
        </div>

        <div className="task-actions">
          <button
            className="btn btn-icon"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit ${title}`}
          >
            <Edit2 size={16} />
          </button>

          <button
            className="btn btn-icon"
            style={{ color: '#f87171' }}
            onClick={() => onDelete(task)}
            title="Delete task"
            aria-label={`Delete ${title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
