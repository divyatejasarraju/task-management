import express from 'express';
import { addHoliday, getHolidays, deleteHoliday } from './controller.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Holidays
 *   description: Holiday management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Holiday:
 *       type: object
 *       required:
 *         - name
 *         - date
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the holiday
 *         name:
 *           type: string
 *           description: Holiday name
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the holiday
 *         description:
 *           type: string
 *           description: Description of the holiday
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the holiday was added
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the holiday was last updated
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         name: Christmas Day
 *         date: 2023-12-25
 *         description: Christmas holiday
 *         createdAt: 2021-06-22T18:25:43.511Z
 *         updatedAt: 2021-06-22T18:25:43.511Z
 */

/**
 * @swagger
 * /api/holidays:
 *   post:
 *     summary: Add a new holiday (Admin only)
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Holiday added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Holiday'
 *       400:
 *         description: Invalid holiday data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as an admin
 *   get:
 *     summary: Get all holidays
 *     tags: [Holidays]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter holidays by year
 *     responses:
 *       200:
 *         description: List of holidays
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Holiday'
 */
router.route('/')
  .post(protect, admin, addHoliday)
  .get(getHolidays);

/**
 * @swagger
 * /api/holidays/{id}:
 *   delete:
 *     summary: Delete a holiday (Admin only)
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Holiday ID
 *     responses:
 *       200:
 *         description: Holiday removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Holiday not found
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as an admin
 */
router.route('/:id')
  .delete(protect, admin, deleteHoliday);

export default router;