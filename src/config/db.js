import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    // Run a real query to verify the connection is working
    await prisma.$queryRaw`SELECT 1`;
    
    // Parse DB host from connection string for logging
    const dbUrl = process.env.DATABASE_URL || '';
    let dbInfo = '';
    try {
      const url = new URL(dbUrl);
      dbInfo = ` (host: ${url.hostname}, db: ${url.pathname.slice(1)})`;
    } catch {
      // If URL parsing fails, just skip the extra info
    }

    console.log(`✅ PostgreSQL Database connected successfully${dbInfo}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Please check your DATABASE_URL in .env file');
    process.exit(1);
  }
};

export default prisma;

