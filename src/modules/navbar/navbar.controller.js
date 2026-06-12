import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as navbarService from './navbar.service.js';
import { formatFileUrl, deleteLocalFile } from '../../utils/fileHelper.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getNavbar = asyncHandler(async (req, res) => {
  const navbar = await navbarService.getNavbar();
  return successResponse(res, 200, 'Navbar fetched successfully', navbar);
});

export const updateNavbar = asyncHandler(async (req, res) => {
  const existingNavbar = await navbarService.getNavbar();

  if (req.file) {
    req.body.logoUrl = formatFileUrl(req.file.path);
    
    // Delete old logo
    if (existingNavbar && existingNavbar.logoUrl && existingNavbar.logoUrl !== req.body.logoUrl) {
      deleteLocalFile(existingNavbar.logoUrl);
    }
  }

  // Parse navLinks if sent as a stringified JSON array from FormData
  if (typeof req.body.navLinks === 'string') {
    try {
      req.body.navLinks = JSON.parse(req.body.navLinks);
    } catch (e) {
      // ignore
    }
  }

  const navbar = await navbarService.updateNavbar(req.body);
  
  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'NavbarConfig',
    entityId: navbar.id,
    oldValue: existingNavbar,
    newValue: navbar
  });

  return successResponse(res, 200, 'Navbar updated successfully', navbar);
});
