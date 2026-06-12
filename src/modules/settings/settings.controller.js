import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as settingsService from './settings.service.js';
import { formatFileUrl, deleteLocalFile } from '../../utils/fileHelper.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  return successResponse(res, 200, 'Settings fetched successfully', settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const existingSettings = await settingsService.getSettings();

  if (req.file) {
    req.body.faviconUrl = formatFileUrl(req.file.path);
    
    // Delete old favicon
    if (existingSettings && existingSettings.faviconUrl && existingSettings.faviconUrl !== req.body.faviconUrl) {
      deleteLocalFile(existingSettings.faviconUrl);
    }
  }

  const settings = await settingsService.updateSettings(req.body);

  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'SiteSettings',
    entityId: settings.id,
    oldValue: existingSettings,
    newValue: settings
  });

  return successResponse(res, 200, 'Settings updated successfully', settings);
});
