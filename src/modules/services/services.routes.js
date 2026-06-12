import express from 'express';
import * as servicesController from './services.controller.js';
import validate from '../../middleware/validate.js';
import { createServiceSchema, updateServiceSchema } from './services.schema.js';
import { protect } from '../../middleware/auth.js';
import { uploadImage } from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all active services (Public)
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured services
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', servicesController.getPublicServices);

/**
 * @swagger
 * /api/services/admin:
 *   get:
 *     summary: Get all services (Admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/admin', protect, servicesController.getAdminServices);

/**
 * @swagger
 * /api/services/admin/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
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
 *       404:
 *         description: Not found
 */
router.get('/admin/:id', protect, servicesController.getServiceById);

/**
 * @swagger
 * /api/services/admin:
 *   post:
 *     summary: Create new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - shortDescription
 *               - sessionType
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               longDescription:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               iconName:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *               sessionType:
 *                 type: string
 *                 enum: [IN_PERSON, ONLINE, BOTH]
 *               isFeatured:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/admin', protect, uploadImage.single('image'), validate(createServiceSchema), servicesController.createService);

/**
 * @swagger
 * /api/services/admin/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               longDescription:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               iconName:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *               sessionType:
 *                 type: string
 *                 enum: [IN_PERSON, ONLINE, BOTH]
 *               isFeatured:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/admin/:id', protect, uploadImage.single('image'), validate(updateServiceSchema), servicesController.updateService);

/**
 * @swagger
 * /api/services/admin/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
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
 *         description: Deleted
 */
router.delete('/admin/:id', protect, servicesController.deleteService);

export default router;
