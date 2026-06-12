import express from 'express';
import * as footerController from './footer.controller.js';
import validate from '../../middleware/validate.js';
import { updateFooterSchema } from './footer.schema.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/footer:
 *   get:
 *     summary: Get footer config
 *     tags: [Footer]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', footerController.getFooter);

/**
 * @swagger
 * /api/footer/admin:
 *   put:
 *     summary: Update footer config
 *     tags: [Footer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               copyrightText:
 *                 type: string
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *               quickLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/admin', protect, validate(updateFooterSchema), footerController.updateFooter);

export default router;
