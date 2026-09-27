import { Router } from 'express';
import { validateTicket, getScanHistory } from '../controllers/ticketValidationController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// Protect all ticket validation routes with admin/staff authentication
router.use(adminAuth);

/**
 * @route   POST /api/admin/tickets/validate
 * @desc    Validate QR ticket or manual booking ID at cinema entry gate
 * @access  Private (Admin / Staff)
 */
router.post('/validate', validateTicket);

/**
 * @route   GET /api/admin/tickets/history
 * @desc    Retrieve entry scan audit logs and daily validation metrics
 * @access  Private (Admin / Staff)
 */
router.get('/history', getScanHistory);

export default router;
