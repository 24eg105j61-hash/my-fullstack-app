import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle, Sparkles } from 'lucide-react';

const SUGGESTED_SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Literature',
  'Psychology'
];

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit = null, isSaving = false }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    completed: false
  });

  const [errors, setErrors] = useState({});
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        subject: taskToEdit.subject || '',
        due_date: taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
        priority: taskToEdit.priority || 'Medium',
        completed: Boolean(taskToEdit.completed)
      });
    } else {
      // Default due date: tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: '',
        subject: '',
        due_date: tomorrow.toISOString().split('T')[0],
        priority: 'Medium',
        completed: false
      });
    }
    setErrors({});
  }, [taskToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Please enter a task title.';
    } else if (formData.title.trim().length > 255) {
      errs.title = 'Title must be 255 characters or fewer.';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Please specify a course or subject.';
    }

    if (!formData.due_date) {
      errs.due_date = 'Please select a due date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const setQuickDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setFormData(prev => ({ ...prev, due_date: d.toISOString().split('T')[0] }));
    setErrors(prev => ({ ...prev, due_date: undefined }));
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isSaving) onClose(); }}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-heading" className="modal-title">
            {taskToEdit ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            className="btn btn-icon"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              className="form-input"
              placeholder="e.g. Read Chapters 3-4 and solve exercise set"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              disabled={isSaving}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Subject */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-subject">
              Subject / Course <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="task-subject"
              type="text"
              className="form-input"
              placeholder="e.g. Mathematics, History, Biology"
              value={formData.subject}
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value });
                if (errors.subject) setErrors({ ...errors, subject: undefined });
              }}
              disabled={isSaving}
            />
            {errors.subject && <span className="form-error">{errors.subject}</span>}

            {/* Quick suggested chips */}
            <div className="subject-chips">
              {SUGGESTED_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className="subject-chip"
                  onClick={() => {
                    setFormData({ ...formData, subject: sub });
                    if (errors.subject) setErrors({ ...errors, subject: undefined });
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Quick shortcuts */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="task-due-date">
                Due Date <span style={{ color: '#f87171' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="subject-chip"
                  onClick={() => setQuickDate(0)}
                  title="Due today"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="subject-chip"
                  onClick={() => setQuickDate(1)}
                  title="Due tomorrow"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  className="subject-chip"
                  onClick={() => setQuickDate(7)}
                  title="Due next week"
                >
                  +1 Week
                </button>
              </div>
            </div>
            <input
              id="task-due-date"
              type="date"
              className="form-input"
              value={formData.due_date}
              onChange={(e) => {
                setFormData({ ...formData, due_date: e.target.value });
                if (errors.due_date) setErrors({ ...errors, due_date: undefined });
              }}
              disabled={isSaving}
            />
            {errors.due_date && <span className="form-error">{errors.due_date}</span>}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">
              Priority Level <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div className="priority-options">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`priority-pill ${formData.priority === p ? `selected-${p}` : ''}`}
                  onClick={() => setFormData({ ...formData, priority: p })}
                  disabled={isSaving}
                >
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Completion Status (for editing) */}
          {taskToEdit && (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  disabled={isSaving}
                />
                <span className="form-label" style={{ margin: 0 }}>Mark as completed</span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
