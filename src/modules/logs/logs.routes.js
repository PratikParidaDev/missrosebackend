import express from 'express';
import * as logsController from './logs.controller.js';
import { protect } from '../../middleware/auth.js';
import { errorResponse } from '../../utils/apiResponse.js';

const router = express.Router();

// Middleware to restrict access to SUPER_ADMIN only
const requireSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'SUPER_ADMIN') {
    next();
  } else {
    return errorResponse(res, 403, 'Forbidden: Requires SUPER_ADMIN role');
  }
};

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get admin activity logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, logsController.getLogs);

/**
 * @swagger
 * /api/admin/logs/stats:
 *   get:
 *     summary: Get log statistics
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/stats', protect, logsController.getLogStats);

/**
 * @swagger
 * /api/admin/logs/export:
 *   get:
 *     summary: Export logs as CSV
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/export', protect, requireSuperAdmin, logsController.exportLogs);

/**
 * @swagger
 * /api/admin/logs/purge:
 *   post:
 *     summary: Purge old logs (> 60 days)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/purge', protect, requireSuperAdmin, logsController.purgeOldLogs);

/**
 * @swagger
 * /api/admin/logs/{id}:
 *   get:
 *     summary: Get single log entry
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', protect, logsController.getLogById);

/**
 * @swagger
 * /api/admin/logs/{id}:
 *   delete:
 *     summary: Delete a single log entry
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', protect, requireSuperAdmin, logsController.deleteLog);

export default router;
