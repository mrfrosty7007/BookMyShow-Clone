import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  createTheater,
  getAdminTheaters,
  updateTheater,
  deleteTheater,
  restoreTheater,
  addScreen,
  updateScreen,
  deleteScreen,
  duplicateScreenLayout,
} from '../controllers/theaterAdminController.js';

const router = express.Router();

// Apply admin authentication to all theater administration routes
router.use(adminAuth);

// Multiplex / Theater CRUD
router.route('/').get(getAdminTheaters).post(createTheater);

router.route('/:id').put(updateTheater).delete(deleteTheater);

router.route('/:id/restore').patch(restoreTheater);

// Screen Management & Visual Layouts
router.route('/:id/screens').post(addScreen);

router.route('/:id/screens/:screenId').put(updateScreen).delete(deleteScreen);

router.route('/:id/screens/:screenId/duplicate').post(duplicateScreenLayout);

export default router;
