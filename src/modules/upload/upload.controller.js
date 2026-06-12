import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { deleteLocalFile, formatFileUrl } from '../../utils/fileHelper.js';

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'No file uploaded');
  }

  const fileUrl = formatFileUrl(req.file.path);
  
  return successResponse(res, 201, 'File uploaded successfully', {
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

export const deleteFile = asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  
  if (!fileUrl) {
    return errorResponse(res, 400, 'File URL is required in request body');
  }

  deleteLocalFile(fileUrl);

  return successResponse(res, 200, 'File deleted successfully');
});
