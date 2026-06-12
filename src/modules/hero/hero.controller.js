import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import * as heroService from './hero.service.js';
import { formatFileUrl, deleteLocalFile } from '../../utils/fileHelper.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getHero = asyncHandler(async (req, res) => {
  const hero = await heroService.getHero();
  return successResponse(res, 200, 'Hero section fetched successfully', hero);
});

export const updateHero = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.backgroundImageUrl = formatFileUrl(req.file.path);
    
    // Get existing hero to delete old image
    const existingHero = await heroService.getHero();
    if (existingHero && existingHero.backgroundImageUrl && existingHero.backgroundImageUrl !== req.body.backgroundImageUrl) {
      deleteLocalFile(existingHero.backgroundImageUrl);
    }
  }

  const hero = await heroService.updateHero(req.body);
  
  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'HeroSection',
    entityId: hero.id,
    oldValue: existingHero,
    newValue: hero
  });

  return successResponse(res, 200, 'Hero section updated successfully', hero);
});
