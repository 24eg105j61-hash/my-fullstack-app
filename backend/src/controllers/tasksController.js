import * as db from '../db/index.js';

/**
 * Validate task input data
 */
function validateTaskInput({ title, subject, due_date, priority }) {
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Task title is required.' });
  } else if (title.trim().length > 255) {
    errors.push({ field: 'title', message: 'Task title cannot exceed 255 characters.' });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    errors.push({ field: 'subject', message: 'Subject is required.' });
  } else if (subject.trim().length > 100) {
    errors.push({ field: 'subject', message: 'Subject cannot exceed 100 characters.' });
  }

  if (!due_date || typeof due_date !== 'string') {
    errors.push({ field: 'due_date', message: 'Due date is required.' });
  } else {
    const parsedDate = new Date(due_date);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: 'due_date', message: 'Due date must be a valid date (YYYY-MM-DD).' });
    }
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  if (!priority || !validPriorities.includes(priority)) {
    errors.push({ field: 'priority', message: "Priority must be either 'Low', 'Medium', or 'High'." });
  }

  return errors;
}

/**
 * GET /api/tasks - list tasks with filters and summary
 */
export async function getTasks(req, res) {
  try {
    const { status, search, subject, priority, sortBy, sortOrder } = req.query;

    const [tasks, counts] = await Promise.all([
      db.getAllTasks({ status, search, subject, priority, sortBy, sortOrder }),
      db.getCounts()
    ]);

    return res.json({
      success: true,
      count: tasks.length,
      summary: counts,
      data: tasks
    });
  } catch (err) {
    console.error('[Tasks Controller] getTasks error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tasks. Please try again later.'
    });
  }
}

/**
 * GET /api/tasks/counts - summary counts only
 */
export async function getTaskCounts(req, res) {
  try {
    const counts = await db.getCounts();
    return res.json({
      success: true,
      data: counts
    });
  } catch (err) {
    console.error('[Tasks Controller] getTaskCounts error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve task counts.'
    });
  }
}

/**
 * GET /api/tasks/:id - single task
 */
export async function getTask(req, res) {
  try {
    const task = await db.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found.`
      });
    }

    return res.json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error('[Tasks Controller] getTask error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve task.'
    });
  }
}

/**
 * POST /api/tasks - create new task
 */
export async function createTask(req, res) {
  try {
    const { title, subject, due_date, priority, completed = false } = req.body;

    const errors = validateTaskInput({ title, subject, due_date, priority });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors[0].message,
        errors
      });
    }

    const newTask = await db.createTask({
      title: title.trim(),
      subject: subject.trim(),
      due_date: due_date.split('T')[0],
      priority,
      completed: Boolean(completed)
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask
    });
  } catch (err) {
    console.error('[Tasks Controller] createTask error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create task.'
    });
  }
}

/**
 * PUT /api/tasks/:id - update existing task
 */
export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, subject, due_date, priority, completed } = req.body;

    const errors = validateTaskInput({ title, subject, due_date, priority });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors[0].message,
        errors
      });
    }

    const updated = await db.updateTask(id, {
      title: title.trim(),
      subject: subject.trim(),
      due_date: due_date.split('T')[0],
      priority,
      completed: Boolean(completed)
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found.`
      });
    }

    return res.json({
      success: true,
      message: 'Task updated successfully.',
      data: updated
    });
  } catch (err) {
    console.error('[Tasks Controller] updateTask error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update task.'
    });
  }
}

/**
 * PATCH /api/tasks/:id/toggle - toggle completion status
 */
export async function toggleTask(req, res) {
  try {
    const { id } = req.params;
    const updated = await db.toggleTask(id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found.`
      });
    }

    return res.json({
      success: true,
      message: updated.completed ? 'Task marked as completed.' : 'Task marked as pending.',
      data: updated
    });
  } catch (err) {
    console.error('[Tasks Controller] toggleTask error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle task status.'
    });
  }
}

/**
 * DELETE /api/tasks/:id - delete a task
 */
export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const success = await db.deleteTask(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${id} not found.`
      });
    }

    return res.json({
      success: true,
      message: 'Task deleted successfully.',
      data: { id: parseInt(id, 10) }
    });
  } catch (err) {
    console.error('[Tasks Controller] deleteTask error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete task.'
    });
  }
}

/**
 * POST /api/tasks/seed - populate or reset sample demo tasks
 */
export async function seedTasks(req, res) {
  try {
    const { clearExisting = false } = req.body || {};
    const seeded = await db.seedSampleData(Boolean(clearExisting));

    return res.json({
      success: true,
      message: 'Sample demo tasks seeded successfully.',
      count: seeded.length,
      data: seeded
    });
  } catch (err) {
    console.error('[Tasks Controller] seedTasks error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to seed sample tasks.'
    });
  }
}
