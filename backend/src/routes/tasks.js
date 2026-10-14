import express from 'express';
import {
  getTasks,
  getTaskCounts,
  getTask,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  seedTasks
} from '../controllers/tasksController.js';

const router = express.Router();

router.get('/', getTasks);
router.get('/counts', getTaskCounts);
router.post('/seed', seedTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

export default router;
