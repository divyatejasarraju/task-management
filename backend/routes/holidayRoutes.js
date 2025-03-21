import express from 'express';
import { addHoliday, getHolidays, deleteHoliday } from '../controllers/holidayController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, addHoliday)
  .get(getHolidays);

router.route('/:id')
  .delete(protect, admin, deleteHoliday);

export default router;