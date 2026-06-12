import express from 'express';
import * as navbarController from './navbar.controller.js';
import validate from '../../middleware/validate.js';
import { updateNavbarSchema } from './navbar.schema.js';
import { protect } from '../../middleware/auth.js';
import { uploadImage } from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/navbar:
 *   get:
 *     summary: Get navbar config
 *     tags: [Navbar]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', navbarController.getNavbar);

/**
 * @swagger
 * /api/navbar/admin:
 *   put:
 *     summary: Update navbar config
 *     tags: [Navbar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *               logoText:
 *                 type: string
 *               ctaLabel:
 *                 type: string
 *               ctaLink:
 *                 type: string
 *               isSticky:
 *                 type: boolean
 *               navLinks:
 *                 type: string
 *                 description: JSON string of array of navlink objects
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/admin', protect, uploadImage.single('logo'), validate(updateNavbarSchema), navbarController.updateNavbar);

export default router;
