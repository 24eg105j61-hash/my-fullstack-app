import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import TaskFilterBar from './components/TaskFilterBar';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import EmptyState from './components/EmptyState';
import ToastNotification from './components/ToastNotification';
import { api } from './api/client';
import { Sparkles, Plus, AlertCircle } from 'lucide-react';

export default function App() {
  // Data state
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, completed: 0 });
  const [backendHealth, setBackendHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search state
  const [currentStatus, setCurrentStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortBy, setSortBy] = useState('due_date-asc');

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check health and retrieve initial database info
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.checkHealth();
      setBackendHealth(res);
    } catch (err) {
      console.warn('Backend health check error:', err.message);
      setBackendHealth({ status: 'error', message: err.message });
    }
  }, []);

  // Fetch tasks and summary from backend REST API
  const fetchTasks = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    const [field, order] = sortBy.split('-');

    try {
      const res = await api.getTasks({
        status: currentStatus,
        search: searchQuery,
        subject: selectedSubject,
        priority: selectedPriority,
        sortBy: field,
        sortOrder: order
      });

      setTasks(res.data || []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Failed to connect to backend server.');
      addToast(err.message || 'Could not connect to backend server.', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [currentStatus, searchQuery, selectedSubject, selectedPriority, sortBy, addToast]);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchTasks();
  }, [fetchTasks, checkHealth]);

  // Extract unique subjects for the filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjectsSet = new Set();
    tasks.forEach((t) => {
      if (t.subject && t.subject.trim()) {
        subjectsSet.add(t.subject.trim());
      }
    });
    return Array.from(subjectsSet).sort();
  }, [tasks]);

  // Handle task completion toggle
  const handleToggleTask = async (id) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const res = await api.toggleTask(id);
      addToast(
        res.data.completed ? 'Task marked as completed! 🎉' : 'Task marked as pending.',
        'success'
      );
      // Refresh summary counts silently
      fetchTasks(true);
    } catch (err) {
      // Revert optimistic update
      setTasks(previousTasks);
      addToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  // Open modal to add new task
  const handleOpenAddModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing task
  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Save new or updated task
  const handleSaveTask = async (formData) => {
    setIsSaving(true);
    try {
      if (taskToEdit) {
        await api.updateTask(taskToEdit.id, formData);
        addToast('Task updated successfully!', 'success');
      } else {
        await api.createTask(formData);
        addToast('New task added to your planner!', 'success');
      }
      setIsModalOpen(false);
      setTaskToEdit(null);
      await fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to save task. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete task
  const handleConfirmDelete = async (id) => {
    setIsDeleting(true);
    try {
      await api.deleteTask(id);
      addToast('Task deleted successfully.', 'info');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      await fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to delete task.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Load sample demo data
  const handleLoadDemoTasks = async () => {
    setIsLoadingDemo(true);
    try {
      const res = await api.seedDemoTasks(false);
      addToast(`Loaded ${res.count || 'sample'} demo assignments!`, 'success');
      await fetchTasks();
    } catch (err) {
      addToast(err.message || 'Failed to load demo tasks.', 'error');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setCurrentStatus('all');
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedPriority('');
    setSortBy('due_date-asc');
  };

  const isFiltered = Boolean(
    currentStatus !== 'all' ||
    searchQuery ||
    selectedSubject ||
    selectedPriority
  );

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        onAddTask={handleOpenAddModal}
        onRefresh={() => fetchTasks(false)}
        backendHealth={backendHealth}
        loading={loading}
      />

      {/* Hero Welcome Banner */}
      <section className="hero-banner">
        <div className="hero-text">
          <h2>Focus on What Matters Today</h2>
          <p>
            Track your assignments, organize courses, and keep exam deadlines under control with real-time PostgreSQL persistence.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add Task</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleLoadDemoTasks}
            disabled={isLoadingDemo}
            title="Populate your planner with clearly marked demo assignments"
          >
            {isLoadingDemo ? (
              <>
                <span className="spinner" />
                <span>Loading Demo...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} color="#fbbf24" />
                <span>Load Demo Data</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Overall Statistics Bar */}
      <StatsOverview summary={summary} />

      {/* Filter and Search Controls */}
      <TaskFilterBar
        currentStatus={currentStatus}
        onStatusChange={setCurrentStatus}
        counts={summary}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        subjects={uniqueSubjects}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Main Task List Content */}
      <main>
        {/* Backend Error Banner */}
        {error && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={22} color="#ef4444" />
            <div style={{ flex: 1 }}>
              <strong>Connection Notice:</strong> {error}
            </div>
            <button className="btn btn-secondary" onClick={() => fetchTasks(false)}>
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
            <p>Loading your planner tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <EmptyState
            isFiltered={isFiltered}
            onClearFilters={handleClearFilters}
            onAddTask={handleOpenAddModal}
            onLoadDemo={handleLoadDemoTasks}
            isLoadingDemo={isLoadingDemo}
          />
        ) : (
          /* Tasks Grid */
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Alert Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
