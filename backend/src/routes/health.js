import express from 'express';
import { getDbInfo } from '../db/index.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbInfo = getDbInfo();
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'Student Planner API',
    database: dbInfo,
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
