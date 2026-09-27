import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getAdminShows,
  getAdminShowById,
  createShow,
  bulkCreateShows,
  checkConflictEndpoint,
  updateShow,
  cancelShow,
  deleteShow,
} from '../controllers/showAdminController.js';

const router = Router();

// Protect all show management routes with adminAuth
router.use(adminAuth);

/**
 * @route   GET /api/admin/shows
 * @desc    Get all shows with filtering, search, pagination, and KPI metrics (or timeline mode)
 * @access  Private (Admin only)
 */
router.get('/', getAdminShows);

/**
 * @route   POST /api/admin/shows/check-conflict
 * @desc    Pre-flight conflict check with calculated end times & suggested next slot
 * @access  Private (Admin only)
 */
router.post('/check-conflict', checkConflictEndpoint);

/**
 * @route   POST /api/admin/shows/bulk
 * @desc    Bulk create shows across multiple daily time slots
 * @access  Private (Admin only)
 */
router.post('/bulk', bulkCreateShows);

/**
 * @route   POST /api/admin/shows
 * @desc    Schedule new show (single or recurring) with conflict detection, buffers, & dynamic pricing
 * @access  Private (Admin only)
 */
router.post('/', createShow);

/**
 * @route   GET /api/admin/shows/:id
 * @desc    Get single show details
 * @access  Private (Admin only)
 */
router.get('/:id', getAdminShowById);

/**
 * @route   PUT /api/admin/shows/:id
 * @desc    Update show details with conflict re-validation
 * @access  Private (Admin only)
 */
router.put('/:id', updateShow);

/**
 * @route   DELETE /api/admin/shows/:id
 * @desc    Soft-delete a show
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteShow);

/**
 * @route   PATCH /api/admin/shows/:id/cancel
 * @desc    Cancel a show and release the screen slot for conflict checks
 * @access  Private (Admin only)
 */
router.patch('/:id/cancel', cancelShow);

export default router;
