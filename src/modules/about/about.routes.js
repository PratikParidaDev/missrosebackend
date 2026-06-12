import express from 'express';
import * as aboutController from './about.controller.js';
import validate from '../../middleware/validate.js';
import { updateAboutSchema } from './about.schema.js';
import { protect } from '../../middleware/auth.js';
import { uploadImage } from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Get about section data
 *     tags: [About]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', aboutController.getAbout);

/**
 * @swagger
 * /api/about:
 *   put:
 *     summary: Update about section
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sectionTitle:
 *                 type: string
 *               sectionSubtitle:
 *                 type: string
 *               psychicName:
 *                 type: string
 *               designation:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               yearsExperience:
 *                 type: number
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               ctaLabel:
 *                 type: string
 *               ctaLink:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/', protect, uploadImage.single('profileImage'), validate(updateAboutSchema), aboutController.updateAbout);

export default router;
