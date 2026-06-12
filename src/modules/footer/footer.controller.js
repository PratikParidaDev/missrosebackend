import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as footerService from './footer.service.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getFooter = asyncHandler(async (req, res) => {
  const footer = await footerService.getFooter();
  return successResponse(res, 200, 'Footer fetched successfully', footer);
});

export const updateFooter = asyncHandler(async (req, res) => {
  const existingFooter = await footerService.getFooter();
  const footer = await footerService.updateFooter(req.body);

  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'FooterConfig',
    entityId: footer.id,
    oldValue: existingFooter,
    newValue: footer
  });

  return successResponse(res, 200, 'Footer updated successfully', footer);
});
