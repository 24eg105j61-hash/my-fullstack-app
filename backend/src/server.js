import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDb } from './db/index.js';
import tasksRouter from './routes/tasks.js';
import healthRouter from './routes/health.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0';

// Middleware
app.use(morgan('dev'));

// Configure CORS for local development, Vercel frontend, and production origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow wildcard or specified origins or any Vercel domain or localhost
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      // Permissive fallback so legitimate client deployments are not blocked
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.options('*', cors());
app.use(express.json());

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/tasks', tasksRouter);

// Serve Frontend Static Assets if built (unified deployment fallback)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

if (fs.existsSync(frontendDistPath)) {
  console.log(`[Server] Serving production frontend build from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback for frontend client routing (handle all non-API GET requests)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(frontendIndexPath);
  });
} else {
  console.log('[Server] Frontend build not found. Running in standalone API mode.');
  app.get('/', (req, res) => {
    res.json({
      service: 'Student Planner API',
      status: 'active',
      healthCheck: '/api/health',
      tasks: '/api/tasks',
      documentation: 'REST API for Student Planner web application',
      cors: 'Enabled (supports Vercel & localhost clients)'
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred.'
  });
});

// Start Server after initializing database
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, HOST, () => {
      console.log(`=========================================`);
      console.log(` Student Planner Server is running!`);
      console.log(` Local:            http://localhost:${PORT}`);
      console.log(` Bound Address:    http://${HOST}:${PORT}`);
      console.log(` Health Endpoint:  http://localhost:${PORT}/api/health`);
      console.log(` Tasks Endpoint:   http://localhost:${PORT}/api/tasks`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('[Server] Critical failure during startup:', err);
    process.exit(1);
  }
}

startServer();
