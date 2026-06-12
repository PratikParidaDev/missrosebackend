import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import * as bookingsService from './bookings.service.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const createBooking = asyncHandler(async (req, res) => {
  // Pass ISO date string or Date object. Prisma handles Date if valid ISO string.
  const data = {
    ...req.body,
    preferredDate: new Date(req.body.preferredDate)
  };
  
  const booking = await bookingsService.createBooking(data);
  return successResponse(res, 201, 'Booking request submitted successfully', booking);
});

export const getAdminBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingsService.getAllBookings();
  return successResponse(res, 200, 'Bookings fetched successfully', bookings);
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingsService.getBookingById(req.params.id);
  if (!booking) {
    return errorResponse(res, 404, 'Booking not found');
  }
  return successResponse(res, 200, 'Booking fetched successfully', booking);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const existingBooking = await bookingsService.getBookingById(req.params.id);
  const booking = await bookingsService.updateBookingStatus(req.params.id, req.body);

  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'Booking',
    entityId: booking.id,
    oldValue: existingBooking,
    newValue: booking
  });

  return successResponse(res, 200, 'Booking status updated successfully', booking);
});

export const deleteBooking = asyncHandler(async (req, res) => {
  const existingBooking = await bookingsService.getBookingById(req.params.id);
  await bookingsService.deleteBooking(req.params.id);

  await logAdminActivity(req, {
    action: 'DELETE',
    entityType: 'Booking',
    entityId: parseInt(req.params.id, 10),
    oldValue: existingBooking
  });

  return successResponse(res, 200, 'Booking deleted successfully');
});
