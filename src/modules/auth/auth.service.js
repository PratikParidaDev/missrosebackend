import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/db.js';

export const findAdminByEmail = async (email) => {
  return await prisma.admin.findUnique({ where: { email } });
};

export const findAdminById = async (id) => {
  return await prisma.admin.findUnique({ where: { id } });
};

export const verifyPassword = async (enteredPassword, storedPassword) => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const createAdminSession = async (adminId, refreshToken, ipAddress, userAgent) => {
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  return await prisma.adminSession.create({
    data: {
      adminId,
      refreshToken: hashedToken,
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
      expiresAt
    }
  });
};

export const validateAndGetSession = async (refreshToken) => {
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const session = await prisma.adminSession.findUnique({
    where: { refreshToken: hashedToken },
    include: { admin: true }
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }
  return session;
};

export const revokeSession = async (sessionId) => {
  return await prisma.adminSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() }
  });
};

export const revokeAllOtherSessions = async (adminId, keepSessionId = null) => {
  const where = {
    adminId,
    revokedAt: null
  };
  if (keepSessionId) {
    where.id = { not: keepSessionId };
  }
  return await prisma.adminSession.updateMany({
    where,
    data: { revokedAt: new Date() }
  });
};

export const getActiveSessions = async (adminId) => {
  return await prisma.adminSession.findMany({
    where: {
      adminId,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    orderBy: { lastActiveAt: 'desc' }
  });
};

export const incrementFailedLogin = async (email) => {
  const admin = await findAdminByEmail(email);
  if (!admin) return;

  const newCount = admin.failedLoginCount + 1;
  const lockedUntil = newCount >= 5 ? new Date(Date.now() + 15 * 60000) : null; // 15 mins

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      failedLoginCount: newCount,
      lockedUntil
    }
  });
};

export const resetFailedLogin = async (adminId) => {
  await prisma.admin.update({
    where: { id: adminId },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    }
  });
};

export const updateAdminIp = async (adminId, ipAddress) => {
  await prisma.admin.update({
    where: { id: adminId },
    data: { lastLoginIp: String(ipAddress) }
  });
};

export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const createPasswordReset = async (adminId) => {
  const token = generateSecureToken();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      adminId,
      token: hashedToken,
      expiresAt
    }
  });

  return token; // Send raw token via email
};

export const validatePasswordResetToken = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const resetRequest = await prisma.passwordReset.findUnique({
    where: { token: hashedToken },
    include: { admin: true }
  });

  if (!resetRequest || resetRequest.usedAt || resetRequest.expiresAt < new Date()) {
    return null;
  }
  return resetRequest;
};

export const markPasswordResetUsed = async (id) => {
  return await prisma.passwordReset.update({
    where: { id },
    data: { usedAt: new Date() }
  });
};

export const updateAdminProfile = async (adminId, data) => {
  return await prisma.admin.update({
    where: { id: adminId },
    data
  });
};
