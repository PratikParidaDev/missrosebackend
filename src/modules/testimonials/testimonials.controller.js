import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import * as testimonialsService from './testimonials.service.js';
import { formatFileUrl, deleteLocalFile } from '../../utils/fileHelper.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getPublicTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialsService.getAllTestimonials(false);
  return successResponse(res, 200, 'Testimonials fetched successfully', testimonials);
});

export const getAdminTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialsService.getAllTestimonials(true);
  return successResponse(res, 200, 'Testimonials fetched successfully', testimonials);
});

export const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await testimonialsService.getTestimonialById(req.params.id);
  if (!testimonial) {
    return errorResponse(res, 404, 'Testimonial not found');
  }
  return successResponse(res, 200, 'Testimonial fetched successfully', testimonial);
});

export const createTestimonial = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.clientAvatarUrl = formatFileUrl(req.file.path);
  }
  const testimonial = await testimonialsService.createTestimonial(req.body);

  await logAdminActivity(req, {
    action: 'CREATE',
    entityType: 'Testimonial',
    entityId: testimonial.id,
    newValue: testimonial
  });

  return successResponse(res, 201, 'Testimonial created successfully', testimonial);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const existingTestimonial = await testimonialsService.getTestimonialById(req.params.id);

  if (req.file) {
    req.body.clientAvatarUrl = formatFileUrl(req.file.path);
    
    // Delete old image
    if (existingTestimonial && existingTestimonial.clientAvatarUrl && existingTestimonial.clientAvatarUrl !== req.body.clientAvatarUrl) {
      deleteLocalFile(existingTestimonial.clientAvatarUrl);
    }
  }

  const testimonial = await testimonialsService.updateTestimonial(req.params.id, req.body);
  
  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'Testimonial',
    entityId: testimonial.id,
    oldValue: existingTestimonial,
    newValue: testimonial
  });

  return successResponse(res, 200, 'Testimonial updated successfully', testimonial);
});

export const approveTestimonial = asyncHandler(async (req, res) => {
  const existingTestimonial = await testimonialsService.getTestimonialById(req.params.id);
  const testimonial = await testimonialsService.approveTestimonial(req.params.id);

  await logAdminActivity(req, {
    action: 'UPDATE', // Specifically 'APPROVE' action if preferred, but UPDATE handles the state diff
    entityType: 'Testimonial',
    entityId: testimonial.id,
    oldValue: existingTestimonial,
    newValue: testimonial
  });

  return successResponse(res, 200, 'Testimonial approved successfully', testimonial);
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const existingTestimonial = await testimonialsService.getTestimonialById(req.params.id);
  if (existingTestimonial && existingTestimonial.clientAvatarUrl) {
    deleteLocalFile(existingTestimonial.clientAvatarUrl);
  }
  
  await testimonialsService.deleteTestimonial(req.params.id);

  await logAdminActivity(req, {
    action: 'DELETE',
    entityType: 'Testimonial',
    entityId: parseInt(req.params.id, 10),
    oldValue: existingTestimonial
  });

  return successResponse(res, 200, 'Testimonial deleted successfully');
});
