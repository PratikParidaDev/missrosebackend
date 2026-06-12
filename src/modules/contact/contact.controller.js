import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as contactService from './contact.service.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

// Contact Info
export const getContactInfo = asyncHandler(async (req, res) => {
  const info = await contactService.getContactInfo();
  return successResponse(res, 200, 'Contact info fetched successfully', info);
});

export const updateContactInfo = asyncHandler(async (req, res) => {
  const existingInfo = await contactService.getContactInfo();
  const info = await contactService.updateContactInfo(req.body);

  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'ContactInfo',
    entityId: info.id,
    oldValue: existingInfo,
    newValue: info
  });

  return successResponse(res, 200, 'Contact info updated successfully', info);
});

// Contact Messages
export const createMessage = asyncHandler(async (req, res) => {
  const message = await contactService.createMessage(req.body);
  return successResponse(res, 201, 'Message sent successfully', message);
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await contactService.getAllMessages();
  return successResponse(res, 200, 'Messages fetched successfully', messages);
});

export const markMessageAsRead = asyncHandler(async (req, res) => {
  const message = await contactService.markMessageAsRead(req.params.id);

  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'ContactMessage',
    entityId: message.id,
    newValue: message
  });

  return successResponse(res, 200, 'Message marked as read', message);
});
