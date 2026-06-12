import express from 'express';
import * as contactController from './contact.controller.js';
import validate from '../../middleware/validate.js';
import { updateContactInfoSchema, createMessageSchema } from './contact.schema.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/contact/info:
 *   get:
 *     summary: Get contact info
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/info', contactController.getContactInfo);

/**
 * @swagger
 * /api/contact/admin/info:
 *   put:
 *     summary: Update contact info
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/admin/info', protect, validate(updateContactInfoSchema), contactController.updateContactInfo);

/**
 * @swagger
 * /api/contact/messages:
 *   post:
 *     summary: Submit a contact message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/messages', validate(createMessageSchema), contactController.createMessage);

/**
 * @swagger
 * /api/contact/admin/messages:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/admin/messages', protect, contactController.getMessages);

/**
 * @swagger
 * /api/contact/admin/messages/{id}/read:
 *   patch:
 *     summary: Mark a message as read
 *     tags: [Contact]
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
router.patch('/admin/messages/:id/read', protect, contactController.markMessageAsRead);

export default router;
