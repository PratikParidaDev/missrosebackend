import express from 'express';
import * as testimonialsController from './testimonials.controller.js';
import validate from '../../middleware/validate.js';
import { createTestimonialSchema, updateTestimonialSchema } from './testimonials.schema.js';
import { protect } from '../../middleware/auth.js';
import { uploadImage } from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     summary: Get all approved testimonials (Public)
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', testimonialsController.getPublicTestimonials);

/**
 * @swagger
 * /api/testimonials/admin:
 *   get:
 *     summary: Get all testimonials (Admin)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/admin', protect, testimonialsController.getAdminTestimonials);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonials]
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
router.get('/admin/:id', protect, testimonialsController.getTestimonialById);

/**
 * @swagger
 * /api/testimonials/admin:
 *   post:
 *     summary: Create new testimonial
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - rating
 *               - review
 *             properties:
 *               clientName:
 *                 type: string
 *               clientAvatar:
 *                 type: string
 *                 format: binary
 *               rating:
 *                 type: integer
 *               review:
 *                 type: string
 *               isApproved:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/admin', protect, uploadImage.single('clientAvatar'), validate(createTestimonialSchema), testimonialsController.createTestimonial);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   put:
 *     summary: Update a testimonial
 *     tags: [Testimonials]
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
 *               clientName:
 *                 type: string
 *               clientAvatar:
 *                 type: string
 *                 format: binary
 *               rating:
 *                 type: integer
 *               review:
 *                 type: string
 *               isApproved:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/admin/:id', protect, uploadImage.single('clientAvatar'), validate(updateTestimonialSchema), testimonialsController.updateTestimonial);

/**
 * @swagger
 * /api/testimonials/admin/{id}/approve:
 *   patch:
 *     summary: Approve a testimonial
 *     tags: [Testimonials]
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
 *         description: Approved
 */
router.patch('/admin/:id/approve', protect, testimonialsController.approveTestimonial);

/**
 * @swagger
 * /api/testimonials/admin/{id}:
 *   delete:
 *     summary: Delete a testimonial
 *     tags: [Testimonials]
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
router.delete('/admin/:id', protect, testimonialsController.deleteTestimonial);

export default router;
