import cron from 'node-cron';
import { purgeOldLogs } from '../modules/logs/logs.service.js';

export const initCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron] Running daily log cleanup job...');
      const deletedCount = await purgeOldLogs(60); // 60 days retention
      console.log(`[Cron] Log cleanup finished. Deleted ${deletedCount} old entries.`);
    } catch (error) {
      console.error('[Cron] Error during log cleanup:', error);
    }
  });

  console.log('📅 Cron jobs initialized.');
};
