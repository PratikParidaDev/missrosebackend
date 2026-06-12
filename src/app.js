import express from 'express';
import { connectDB } from './config/db.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import fs from 'fs';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import heroRoutes from './modules/hero/hero.routes.js';
import aboutRoutes from './modules/about/about.routes.js';
import servicesRoutes from './modules/services/services.routes.js';
import testimonialsRoutes from './modules/testimonials/testimonials.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';
import navbarRoutes from './modules/navbar/navbar.routes.js';
import footerRoutes from './modules/footer/footer.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import logsRoutes from './modules/logs/logs.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { initCronJobs } from './jobs/logCleanup.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static Media Serving
const mediaPath = path.join(process.cwd(), 'media');
if (!fs.existsSync(mediaPath)) {
  fs.mkdirSync(mediaPath, { recursive: true });
}
app.use('/media', express.static(mediaPath));

// API Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NewHaven Psychic CMS API is live! 🚀',
    docs: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/navbar', navbarRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/site-settings', settingsRoutes);
app.use('/api/admin/upload', uploadRoutes); // Specific admin upload route
app.use('/api/admin/logs', logsRoutes);
app.use('/api/admin/users', usersRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  initCronJobs();
  console.log(`\n🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`\n📚 Swagger API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`\n🔌 Active API Endpoints:`);
  console.log(`   - Auth:         http://localhost:${PORT}/api/auth`);
  console.log(`   - Hero:         http://localhost:${PORT}/api/hero`);
  console.log(`   - About:        http://localhost:${PORT}/api/about`);
  console.log(`   - Services:     http://localhost:${PORT}/api/services`);
  console.log(`   - Testimonials: http://localhost:${PORT}/api/testimonials`);
  console.log(`   - Contact:      http://localhost:${PORT}/api/contact`);
  console.log(`   - Bookings:     http://localhost:${PORT}/api/bookings`);
  console.log(`   - Navbar:       http://localhost:${PORT}/api/navbar`);
  console.log(`   - Footer:       http://localhost:${PORT}/api/footer`);
  console.log(`   - Settings:     http://localhost:${PORT}/api/site-settings`);
  console.log(`   - Uploads:      http://localhost:${PORT}/api/admin/upload`);
  console.log(`   - Logs:         http://localhost:${PORT}/api/admin/logs`);
  console.log(`   - Users:        http://localhost:${PORT}/api/admin/users\n`);
});

export default app;
