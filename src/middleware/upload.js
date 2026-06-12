import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subfolder based on the route path
    let folder = 'uploads';
    if (req.originalUrl.includes('/api/hero')) folder = 'hero';
    else if (req.originalUrl.includes('/api/about')) folder = 'about';
    else if (req.originalUrl.includes('/api/services')) folder = 'services';
    else if (req.originalUrl.includes('/api/testimonials')) folder = 'testimonials';
    else if (req.originalUrl.includes('/api/navbar')) folder = 'navbar';
    else if (req.originalUrl.includes('/api/site-settings')) folder = 'settings';
    
    const dest = path.join(process.cwd(), 'media', folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const baseName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});
