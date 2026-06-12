import express from 'express';
import * as bookingsController from './bookings.controller.js';
import validate from '../../middleware/validate.js';
import { createBookingSchema, updateBookingStatusSchema } from './bookings.schema.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking request (Public)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - clientEmail
 *               - clientPhone
 *               - serviceId
 *               - preferredDate
 *               - preferredTime
 *             properties:
 *               clientName:
 *                 type: string
 *               clientEmail:
 *                 type: string
 *               clientPhone:
 *                 type: string
 *               serviceId:
 *                 type: integer
 *               preferredDate:
 *                 type: string
 *                 format: date
 *               preferredTime:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', validate(createBookingSchema), bookingsController.createBooking);

/**
 * @swagger
 * /api/bookings/admin:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/admin', protect, bookingsController.getAdminBookings);

/**
 * @swagger
 * /api/bookings/admin/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
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
router.get('/admin/:id', protect, bookingsController.getBookingById);

/**
 * @swagger
 * /api/bookings/admin/{id}:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/admin/:id', protect, validate(updateBookingStatusSchema), bookingsController.updateBookingStatus);

/**
 * @swagger
 * /api/bookings/admin/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
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
router.delete('/admin/:id', protect, bookingsController.deleteBooking);

export default router;
