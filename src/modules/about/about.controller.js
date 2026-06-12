import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as aboutService from './about.service.js';
import { formatFileUrl, deleteLocalFile } from '../../utils/fileHelper.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getAbout = asyncHandler(async (req, res) => {
  const about = await aboutService.getAbout();
  return successResponse(res, 200, 'About section fetched successfully', about);
});

export const updateAbout = asyncHandler(async (req, res) => {
  const existingAbout = await aboutService.getAbout();

  if (req.file) {
    req.body.profileImageUrl = formatFileUrl(req.file.path);
    
    // Delete old image
    if (existingAbout && existingAbout.profileImageUrl && existingAbout.profileImageUrl !== req.body.profileImageUrl) {
      deleteLocalFile(existingAbout.profileImageUrl);
    }
  }

  // Parse specialties if sent as a stringified array from FormData
  if (typeof req.body.specialties === 'string') {
    try {
      req.body.specialties = JSON.parse(req.body.specialties);
    } catch (e) {
      // if not valid JSON, we can assume it's just a comma separated string maybe
      req.body.specialties = req.body.specialties.split(',').map(s => s.trim());
    }
  }

  const about = await aboutService.updateAbout(req.body);
  
  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'AboutSection',
    entityId: about.id,
    oldValue: existingAbout,
    newValue: about
  });

  return successResponse(res, 200, 'About section updated successfully', about);
});
