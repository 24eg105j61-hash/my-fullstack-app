import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, task, isDeleting = false }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) onClose(); }}>
      <div className="modal-content" role="dialog" aria-modal="true" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Delete Task</h2>
          </div>
          <button className="btn btn-icon" onClick={onClose} disabled={isDeleting} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Are you sure you want to delete <strong style={{ color: 'white' }}>"{task.title}"</strong>?
          This action cannot be undone.
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(task.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
