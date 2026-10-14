import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { sampleTasks } from './sampleData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const JSON_DB_FILE = path.join(DATA_DIR, 'tasks-db.json');

const { Pool } = pg;

let pool = null;
let useFallback = false;
let dbInfo = {
  type: 'uninitialized',
  connected: false,
  message: ''
};

// Ensure data directory exists for local fallback persistence
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Fallback in-memory / JSON store helpers
function readFallbackData() {
  try {
    if (fs.existsSync(JSON_DB_FILE)) {
      const raw = fs.readFileSync(JSON_DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Database Fallback] Error reading fallback file:', err.message);
  }
  return [];
}

function writeFallbackData(tasks) {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database Fallback] Error saving fallback file:', err.message);
  }
}

/**
 * Initialize Database (PostgreSQL if available, fallback persistent store otherwise)
 */
export async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('user:password@localhost')) {
    try {
      console.log('[Database] Connecting to PostgreSQL via DATABASE_URL...');
      const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

      pool = new Pool({
        connectionString: databaseUrl,
        ssl: isLocal ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });

      // Test connection
      const client = await pool.connect();
      console.log('[Database] PostgreSQL connection established successfully.');

      // Initialize table safely
      await client.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subject VARCHAR(100) NOT NULL,
          due_date DATE NOT NULL,
          priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
          completed BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('[Database] Table "tasks" is ready.');

      // Check if table is empty; if so, populate with clearly identified sample data
      const countRes = await client.query('SELECT COUNT(*) FROM tasks');
      const count = parseInt(countRes.rows[0].count, 10);
      if (count === 0) {
        console.log('[Database] Seeding initial sample tasks into PostgreSQL...');
        for (const task of sampleTasks) {
          await client.query(
            `INSERT INTO tasks (title, subject, due_date, priority, completed)
             VALUES ($1, $2, $3, $4, $5)`,
            [task.title, task.subject, task.due_date, task.priority, task.completed]
          );
        }
        console.log('[Database] Seeded default sample tasks successfully.');
      }

      client.release();

      useFallback = false;
      dbInfo = {
        type: 'postgresql',
        connected: true,
        message: 'Connected to PostgreSQL database'
      };
      return;
    } catch (err) {
      console.warn(`[Database] PostgreSQL connection failed: ${err.message}`);
      console.warn('[Database] Activating persistent local storage fallback (backend/data/tasks-db.json).');
      if (pool) {
        try { await pool.end(); } catch (_) {}
        pool = null;
      }
    }
  } else {
    console.log('[Database] No external DATABASE_URL provided. Activating persistent local storage (backend/data/tasks-db.json).');
  }

  // Fallback persistent storage
  useFallback = true;
  dbInfo = {
    type: 'persistent-json-fallback',
    connected: true,
    message: 'Using local file-backed persistence (PostgreSQL available via DATABASE_URL)'
  };

  const currentTasks = readFallbackData();
  if (currentTasks.length === 0) {
    console.log('[Database] Initializing fallback store with sample tasks...');
    const initialTasks = sampleTasks.map((t, index) => ({
      id: index + 1,
      title: t.title,
      subject: t.subject,
      due_date: t.due_date,
      priority: t.priority,
      completed: t.completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    writeFallbackData(initialTasks);
  }
}

/**
 * Get Database Info for health-check endpoint
 */
export function getDbInfo() {
  return dbInfo;
}

/**
 * Get all tasks with filtering, search, and sorting
 */
export async function getAllTasks({ status = 'all', search = '', subject = '', priority = '', sortBy = 'due_date', sortOrder = 'asc' } = {}) {
  if (!useFallback && pool) {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (status === 'pending') {
      params.push(false);
      query += ` AND completed = $${params.length}`;
    } else if (status === 'completed') {
      params.push(true);
      query += ` AND completed = $${params.length}`;
    }

    if (subject && subject.trim() !== '') {
      params.push(subject.trim());
      query += ` AND LOWER(subject) = LOWER($${params.length})`;
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(subject) LIKE $${params.length})`;
    }

    // Sorting
    const allowedSortFields = ['due_date', 'priority', 'title', 'created_at', 'subject'];
    const validSort = allowedSortFields.includes(sortBy) ? sortBy : 'due_date';
    const validOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${validSort} ${validOrder}, id ASC`;

    const res = await pool.query(query, params);
    
    // Format due_date to YYYY-MM-DD string
    const formatted = res.rows.map(row => ({
      ...row,
      due_date: row.due_date instanceof Date ? row.due_date.toISOString().split('T')[0] : String(row.due_date).split('T')[0]
    }));

    return formatted;
  }

  // Fallback logic
  let tasks = readFallbackData();

  if (status === 'pending') {
    tasks = tasks.filter(t => !t.completed);
  } else if (status === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }

  if (subject && subject.trim() !== '') {
    tasks = tasks.filter(t => t.subject.toLowerCase() === subject.trim().toLowerCase());
  }

  if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
    tasks = tasks.filter(t => t.priority === priority);
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
  }

  tasks.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder.toLowerCase() === 'desc' ? 1 : -1;
    if (valA > valB) return sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    return a.id - b.id;
  });

  return tasks;
}

/**
 * Get task counts summary (total, pending, completed)
 */
export async function getCounts() {
  if (!useFallback && pool) {
    const res = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(CASE WHEN completed = false THEN 1 END)::int AS pending,
        COUNT(CASE WHEN completed = true THEN 1 END)::int AS completed
      FROM tasks
    `);
    return res.rows[0];
  }

  const tasks = readFallbackData();
  const total = tasks.length;
  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;

  return { total, pending, completed };
}

/**
 * Get single task by ID
 */
export async function getTaskById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;

  if (!useFallback && pool) {
    const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [numericId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      due_date: row.due_date instanceof Date ? row.due_date.toISOString().split('T')[0] : String(row.due_date).split('T')[0]
    };
  }

  const tasks = readFallbackData();
  return tasks.find(t => t.id === numericId) || null;
}

/**
 * Create a new task
 */
export async function createTask({ title, subject, due_date, priority, completed = false }) {
  if (!useFallback && pool) {
    const res = await pool.query(
      `INSERT INTO tasks (title, subject, due_date, priority, completed, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [title, subject, due_date, priority, Boolean(completed)]
    );
    const row = res.rows[0];
    return {
      ...row,
      due_date: row.due_date instanceof Date ? row.due_date.toISOString().split('T')[0] : String(row.due_date).split('T')[0]
    };
  }

  const tasks = readFallbackData();
  const maxId = tasks.reduce((max, t) => Math.max(max, t.id || 0), 0);
  const newTask = {
    id: maxId + 1,
    title,
    subject,
    due_date,
    priority,
    completed: Boolean(completed),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  tasks.push(newTask);
  writeFallbackData(tasks);
  return newTask;
}

/**
 * Update an existing task
 */
export async function updateTask(id, { title, subject, due_date, priority, completed }) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;

  if (!useFallback && pool) {
    const res = await pool.query(
      `UPDATE tasks
       SET title = $1, subject = $2, due_date = $3, priority = $4, completed = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, subject, due_date, priority, Boolean(completed), numericId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      due_date: row.due_date instanceof Date ? row.due_date.toISOString().split('T')[0] : String(row.due_date).split('T')[0]
    };
  }

  const tasks = readFallbackData();
  const index = tasks.findIndex(t => t.id === numericId);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    title,
    subject,
    due_date,
    priority,
    completed: Boolean(completed),
    updated_at: new Date().toISOString()
  };
  writeFallbackData(tasks);
  return tasks[index];
}

/**
 * Toggle task completion status
 */
export async function toggleTask(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;

  if (!useFallback && pool) {
    const res = await pool.query(
      `UPDATE tasks
       SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [numericId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      due_date: row.due_date instanceof Date ? row.due_date.toISOString().split('T')[0] : String(row.due_date).split('T')[0]
    };
  }

  const tasks = readFallbackData();
  const index = tasks.findIndex(t => t.id === numericId);
  if (index === -1) return null;

  tasks[index].completed = !tasks[index].completed;
  tasks[index].updated_at = new Date().toISOString();
  writeFallbackData(tasks);
  return tasks[index];
}

/**
 * Delete a task
 */
export async function deleteTask(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return false;

  if (!useFallback && pool) {
    const res = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [numericId]);
    return res.rows.length > 0;
  }

  const tasks = readFallbackData();
  const index = tasks.findIndex(t => t.id === numericId);
  if (index === -1) return false;

  tasks.splice(index, 1);
  writeFallbackData(tasks);
  return true;
}

/**
 * Seed or reset sample tasks
 */
export async function seedSampleData(clearExisting = false) {
  if (!useFallback && pool) {
    if (clearExisting) {
      await pool.query('TRUNCATE TABLE tasks RESTART IDENTITY');
    }
    for (const t of sampleTasks) {
      await pool.query(
        `INSERT INTO tasks (title, subject, due_date, priority, completed)
         VALUES ($1, $2, $3, $4, $5)`,
        [t.title, t.subject, t.due_date, t.priority, t.completed]
      );
    }
    const res = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
    return res.rows;
  }

  let tasks = clearExisting ? [] : readFallbackData();
  const maxId = tasks.reduce((max, t) => Math.max(max, t.id || 0), 0);
  
  sampleTasks.forEach((t, i) => {
    tasks.push({
      id: maxId + i + 1,
      title: t.title,
      subject: t.subject,
      due_date: t.due_date,
      priority: t.priority,
      completed: t.completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });

  writeFallbackData(tasks);
  return tasks;
}
