import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  undoTaskChange, 
  getTaskHistory 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/undo')
  .post(protect, undoTaskChange);

router.route('/:id/history')
  .get(protect, getTaskHistory);

export default router;