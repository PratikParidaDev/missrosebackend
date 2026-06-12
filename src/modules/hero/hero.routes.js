import express from 'express';
import * as heroController from './hero.controller.js';
import validate from '../../middleware/validate.js';
import { updateHeroSchema } from './hero.schema.js';
import { protect } from '../../middleware/auth.js';
import { uploadImage } from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/hero:
 *   get:
 *     summary: Get hero section data
 *     tags: [Hero]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', heroController.getHero);

/**
 * @swagger
 * /api/hero:
 *   put:
 *     summary: Update hero section
 *     tags: [Hero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               headline:
 *                 type: string
 *               subheadline:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *                 format: binary
 *               ctaPrimaryLabel:
 *                 type: string
 *               ctaPrimaryLink:
 *                 type: string
 *               ctaSecondaryLabel:
 *                 type: string
 *               ctaSecondaryLink:
 *                 type: string
 *               badgeText:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/', protect, uploadImage.single('backgroundImage'), validate(updateHeroSchema), heroController.updateHero);

export default router;
