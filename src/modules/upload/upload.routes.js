import express from 'express';
import * as uploadController from './upload.controller.js';
import { uploadImage } from '../../middleware/upload.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/upload:
 *   post:
 *     summary: Upload an image to local storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/', protect, uploadImage.single('image'), uploadController.uploadFile);

/**
 * @swagger
 * /api/admin/upload:
 *   delete:
 *     summary: Delete a locally stored image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/', protect, uploadController.deleteFile);

export default router;
