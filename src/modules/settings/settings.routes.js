import express from 'express';
import * as settingsController from './settings.controller.js';
import validate from '../../middleware/validate.js';
import { updateSettingsSchema } from './settings.schema.js';
import { protect } from '../../middleware/auth.js';
import { uploadImage } from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/site-settings/admin:
 *   get:
 *     summary: Get site settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/admin', protect, settingsController.getSettings);

/**
 * @swagger
 * /api/site-settings/admin:
 *   put:
 *     summary: Update site settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               seoKeywords:
 *                 type: string
 *               favicon:
 *                 type: string
 *                 format: binary
 *               googleAnalyticsId:
 *                 type: string
 *               facebookPixelId:
 *                 type: string
 *               primaryColor:
 *                 type: string
 *               accentColor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/admin', protect, uploadImage.single('favicon'), validate(updateSettingsSchema), settingsController.updateSettings);

export default router;
