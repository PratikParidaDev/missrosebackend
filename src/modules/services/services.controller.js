import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import * as servicesService from './services.service.js';
import { formatFileUrl, deleteLocalFile } from '../../utils/fileHelper.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getPublicServices = asyncHandler(async (req, res) => {
  const isFeatured = req.query.featured === 'true' ? true : null;
  const services = await servicesService.getAllServices(false, isFeatured);
  return successResponse(res, 200, 'Services fetched successfully', services);
});

export const getAdminServices = asyncHandler(async (req, res) => {
  const services = await servicesService.getAllServices(true);
  return successResponse(res, 200, 'Services fetched successfully', services);
});

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await servicesService.getServiceById(req.params.id);
  if (!service) {
    return errorResponse(res, 404, 'Service not found');
  }
  return successResponse(res, 200, 'Service fetched successfully', service);
});

export const createService = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.imageUrl = formatFileUrl(req.file.path);
  }
  const service = await servicesService.createService(req.body);

  await logAdminActivity(req, {
    action: 'CREATE',
    entityType: 'Service',
    entityId: service.id,
    newValue: service
  });

  return successResponse(res, 201, 'Service created successfully', service);
});

export const updateService = asyncHandler(async (req, res) => {
  const existingService = await servicesService.getServiceById(req.params.id);

  if (req.file) {
    req.body.imageUrl = formatFileUrl(req.file.path);
    
    // Delete old image
    if (existingService && existingService.imageUrl && existingService.imageUrl !== req.body.imageUrl) {
      deleteLocalFile(existingService.imageUrl);
    }
  }

  const service = await servicesService.updateService(req.params.id, req.body);
  
  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'Service',
    entityId: service.id,
    oldValue: existingService,
    newValue: service
  });

  return successResponse(res, 200, 'Service updated successfully', service);
});

export const deleteService = asyncHandler(async (req, res) => {
  const existingService = await servicesService.getServiceById(req.params.id);
  if (existingService && existingService.imageUrl) {
    deleteLocalFile(existingService.imageUrl);
  }
  
  await servicesService.deleteService(req.params.id);

  await logAdminActivity(req, {
    action: 'DELETE',
    entityType: 'Service',
    entityId: parseInt(req.params.id, 10),
    oldValue: existingService
  });

  return successResponse(res, 200, 'Service deleted successfully');
});
