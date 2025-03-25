import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  undoTaskChange, 
  getTaskHistory 
} from './controller.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - dueDate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the task
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date of the task
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *           description: Current status of the task
 *         user:
 *           type: string
 *           description: User ID who owns this task
 *         history:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               changes:
 *                 type: object
 *               changedBy:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *           description: History of task changes
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the task was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the task was last updated
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         title: Complete project documentation
 *         description: Write comprehensive documentation for the project
 *         dueDate: 2023-12-31
 *         status: pending
 *         user: 60d21b4667d0d8992e610c85
 *         createdAt: 2021-06-22T18:25:43.511Z
 *         updatedAt: 2021-06-22T18:25:43.511Z
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: Not authorized
 *       400:
 *         description: Invalid task data
 *   get:
 *     summary: Get all tasks for logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filter tasks by status
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Not authorized
 */
router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       401:
 *         description: Not authorized
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       401:
 *         description: Not authorized
 *   delete:
 *     summary: Delete a task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Task not found
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as an admin
 */
router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/undo:
 *   post:
 *     summary: Undo the last change to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task change undone successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: No changes to undo
 *       404:
 *         description: Task not found
 *       401:
 *         description: Not authorized
 */
router.route('/:id/undo')
  .post(protect, undoTaskChange);

/**
 * @swagger
 * /api/tasks/{id}/history:
 *   get:
 *     summary: Get the change history of a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   changes:
 *                     type: object
 *                   changedBy:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Task not found
 *       401:
 *         description: Not authorized
 */
router.route('/:id/history')
  .get(protect, getTaskHistory);

export default router;