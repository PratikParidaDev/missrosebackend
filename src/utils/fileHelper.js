import fs from 'fs';
import path from 'path';

/**
 * Deletes a file from the local file system
 * @param {string} fileUrl - The relative path stored in the DB (e.g. /media/hero/image.jpg)
 */
export const deleteLocalFile = (fileUrl) => {
  if (!fileUrl) return;

  // Assuming fileUrl starts with /media/
  if (fileUrl.startsWith('/media/')) {
    const relativePath = fileUrl.replace('/media/', '');
    const absolutePath = path.join(process.cwd(), 'media', relativePath);
    
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log(`Successfully deleted file: ${absolutePath}`);
      } catch (error) {
        console.error(`Failed to delete file: ${absolutePath}`, error);
      }
    }
  }
};

/**
 * Formats a local file path into a relative URL for the DB
 * @param {string} absoluteFilePath - The absolute path from multer (req.file.path)
 * @returns {string} The relative URL (e.g. /media/folder/file.jpg)
 */
export const formatFileUrl = (absoluteFilePath) => {
  if (!absoluteFilePath) return null;
  
  // Convert absolute path to relative /media/... path
  // Since we save in process.cwd()/media, we just need to get the part after /media/
  const mediaIndex = absoluteFilePath.indexOf('media');
  if (mediaIndex !== -1) {
    // Replace backslashes with forward slashes for URLs
    return '/' + absoluteFilePath.substring(mediaIndex).replace(/\\/g, '/');
  }
  return null;
};
