import prisma from '../config/db.js';

/**
 * Redacts sensitive fields from an object recursively.
 */
const redactSensitiveFields = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken'];
  const redacted = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.includes(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveFields(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
};

/**
 * Logs an admin activity to the database.
 * Never blocks the main request.
 * 
 * @param {Object} req - The Express request object (used to extract IP, user-agent, method, endpoint)
 * @param {Object} params - The log details
 * @param {number|null} params.adminId - ID of the admin performing the action (null if unknown/failed)
 * @param {string} params.adminEmail - Email of the admin (submitted email if failed login)
 * @param {string} params.action - Action performed (e.g., LOGIN, UPDATE, CREATE, DELETE)
 * @param {string|null} params.entityType - Type of entity modified (e.g., 'Service', 'HeroSection')
 * @param {number|null} params.entityId - ID of the entity modified
 * @param {Object|null} params.oldValue - Previous state of the entity
 * @param {Object|null} params.newValue - New state of the entity
 * @param {string} [params.status='SUCCESS'] - Status of the action
 */
export const logAdminActivity = async (req, {
  adminId = null,
  adminEmail,
  action,
  entityType = null,
  entityId = null,
  oldValue = null,
  newValue = null,
  status = 'SUCCESS'
}) => {
  try {
    // Extract req info
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const method = req.method;
    const endpoint = req.originalUrl;

    // Fallback if admin info is missing but we have req.admin
    if (!adminId && req.admin?.id) adminId = req.admin.id;
    if (!adminEmail && req.admin?.email) adminEmail = req.admin.email;

    // Must have at least an email to log anything meaningful
    if (!adminEmail && action !== 'LOGIN_FAILED') {
      console.warn('Activity Logger: Missing adminEmail, cannot log activity reliably.');
      return;
    }

    const redactedOldValue = redactSensitiveFields(oldValue);
    const redactedNewValue = redactSensitiveFields(newValue);

    await prisma.adminActivityLog.create({
      data: {
        adminId,
        adminEmail: adminEmail || 'unknown',
        action,
        entityType,
        entityId: entityId ? parseInt(entityId, 10) : null,
        oldValue: redactedOldValue ? JSON.parse(JSON.stringify(redactedOldValue)) : null,
        newValue: redactedNewValue ? JSON.parse(JSON.stringify(redactedNewValue)) : null,
        ipAddress: String(ipAddress),
        userAgent,
        method,
        endpoint,
        status
      }
    });
  } catch (error) {
    // We log the error but don't throw it so we don't break the main request
    console.error('Failed to log admin activity:', error);
  }
};
