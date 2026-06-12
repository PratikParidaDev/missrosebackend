# NewHaven Psychic CMS Backend

This is the production-ready Node.js backend for the NewHaven Psychic website and CMS. It provides APIs for the public frontend and a secure admin CMS area.

## Tech Stack
- Node.js (ES Modules)
- Express.js
- PostgreSQL
- Prisma ORM
- Joi Validation
- JWT Authentication
- Multer & Cloudinary (Image Uploads)
- Swagger (API Documentation)

## Setup Instructions

1. **Install Dependencies**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   *Make sure to fill in your `DATABASE_URL` and Cloudinary credentials.*

3. **Database Setup**
   Run Prisma migrations to create the tables, and seed the database with initial data:
   ```bash
   npx prisma generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Run the Server**
   Start the development server:
   ```bash
   npm run dev
   ```

## API Overview

The API is fully documented using Swagger. Once the server is running, visit:
**[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Core Modules:
- **Auth**: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`, `/api/auth/logout`
- **Hero**: `/api/hero`
- **About**: `/api/about`
- **Services**: `/api/services`
- **Testimonials**: `/api/testimonials`
- **Contact**: `/api/contact/info`, `/api/contact/messages`
- **Bookings**: `/api/bookings`
- **Navbar Config**: `/api/navbar`
- **Footer Config**: `/api/footer`
- **Site Settings**: `/api/site-settings`
- **Upload**: `/api/admin/upload`

All admin routes are protected and require a Bearer token.
