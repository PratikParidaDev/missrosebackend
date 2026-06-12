import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken.js';
import * as authService from './auth.service.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

const getClientIp = (req) => req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
const getUserAgent = (req) => req.get('user-agent') || 'unknown';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await authService.findAdminByEmail(email);

  if (!admin) {
    await logAdminActivity(req, { adminId: null, adminEmail: email, action: 'LOGIN_FAILED', status: 'FAILED' });
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    await logAdminActivity(req, { adminId: admin.id, adminEmail: admin.email, action: 'LOGIN_LOCKED', status: 'FAILED' });
    return errorResponse(res, 401, 'Account is temporarily locked. Please try again later.');
  }

  if (!admin.isActive) {
    await logAdminActivity(req, { adminId: admin.id, adminEmail: admin.email, action: 'LOGIN_FAILED', status: 'FAILED', newValue: { reason: 'account suspended' } });
    return errorResponse(res, 401, 'Account is suspended');
  }

  if (await authService.verifyPassword(password, admin.password)) {
    await authService.resetFailedLogin(admin.id);
    await authService.updateAdminIp(admin.id, getClientIp(req));

    const refreshTokenRaw = generateRefreshToken(admin.id);
    const session = await authService.createAdminSession(admin.id, refreshTokenRaw, getClientIp(req), getUserAgent(req));
    const accessToken = generateAccessToken(admin.id, session.id);

    await logAdminActivity(req, { adminId: admin.id, adminEmail: admin.email, action: 'LOGIN' });

    return successResponse(res, 200, 'Login successful', {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        mustChangePassword: admin.mustChangePassword,
        emailVerified: admin.emailVerified
      },
      accessToken,
      refreshToken: refreshTokenRaw
    });
  } else {
    await authService.incrementFailedLogin(email);
    await logAdminActivity(req, { adminId: admin.id, adminEmail: email, action: 'LOGIN_FAILED', status: 'FAILED' });
    return errorResponse(res, 401, 'Invalid email or password');
  }
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  const session = await authService.validateAndGetSession(refreshToken);
  if (!session || !session.admin.isActive) {
    return errorResponse(res, 403, 'Invalid or expired refresh token');
  }

  const newRefreshTokenRaw = generateRefreshToken(session.adminId);
  // Revoke old session and create new to rotate token, or just update existing session's token?
  // Let's revoke old and create new to keep session history cleaner or just create new.
  await authService.revokeSession(session.id);
  const newSession = await authService.createAdminSession(session.adminId, newRefreshTokenRaw, getClientIp(req), getUserAgent(req));
  
  const newAccessToken = generateAccessToken(session.adminId, newSession.id);

  await logAdminActivity(req, { adminId: session.adminId, adminEmail: session.admin.email, action: 'TOKEN_REFRESH' });

  return successResponse(res, 200, 'Token refreshed successfully', {
    accessToken: newAccessToken,
    refreshToken: newRefreshTokenRaw
  });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.sessionId) {
    await authService.revokeSession(req.sessionId);
    await logAdminActivity(req, { adminId: req.admin.id, adminEmail: req.admin.email, action: 'LOGOUT' });
  }
  return successResponse(res, 200, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Admin profile fetched', req.admin);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const adminId = req.admin.id;
  const updateData = {};

  if (name) updateData.name = name;
  if (email && email !== req.admin.email) {
    const existing = await authService.findAdminByEmail(email);
    if (existing) {
      return errorResponse(res, 400, 'Email already in use');
    }
    updateData.pendingEmail = email;
    const verifyToken = authService.generateSecureToken();
    updateData.emailVerifyToken = verifyToken;
    updateData.emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60000); // 24 hours
    
    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify your new email address',
      html: `<p>Please verify your new email by clicking this link: <a href="${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}">Verify Email</a></p>`
    });
  }

  const updatedAdmin = await authService.updateAdminProfile(adminId, updateData);

  await logAdminActivity(req, {
    adminId,
    adminEmail: req.admin.email,
    action: 'PROFILE_UPDATE',
    oldValue: { name: req.admin.name, email: req.admin.email },
    newValue: { name: updatedAdmin.name, pendingEmail: updatedAdmin.pendingEmail }
  });

  return successResponse(res, 200, 'Profile updated successfully', updatedAdmin);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await authService.findAdminById(req.admin.id);

  if (!(await authService.verifyPassword(currentPassword, admin.password))) {
    return errorResponse(res, 400, 'Incorrect current password');
  }

  const hashedPassword = await authService.hashPassword(newPassword);
  await authService.updateAdminProfile(admin.id, {
    password: hashedPassword,
    isTempPassword: false,
    mustChangePassword: false
  });

  await authService.revokeAllOtherSessions(admin.id, req.sessionId);

  await logAdminActivity(req, { adminId: admin.id, adminEmail: admin.email, action: 'PASSWORD_CHANGE' });

  return successResponse(res, 200, 'Password changed successfully. All other sessions revoked.');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await authService.findAdminByEmail(email);

  // Always return success to prevent email enumeration
  if (!admin || !admin.isActive) {
    return successResponse(res, 200, 'If that email exists, a reset link has been sent.');
  }

  const resetTokenRaw = await authService.createPasswordReset(admin.id);
  
  await sendEmail({
    to: admin.email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click here: <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetTokenRaw}">Reset Password</a></p>`
  });

  await logAdminActivity(req, { adminId: admin.id, adminEmail: admin.email, action: 'PASSWORD_RESET_REQUEST' });

  return successResponse(res, 200, 'If that email exists, a reset link has been sent.');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  const resetRequest = await authService.validatePasswordResetToken(token);
  if (!resetRequest) {
    return errorResponse(res, 400, 'Invalid or expired reset token');
  }

  const hashedPassword = await authService.hashPassword(newPassword);
  await authService.updateAdminProfile(resetRequest.adminId, {
    password: hashedPassword,
    isTempPassword: false,
    mustChangePassword: false,
    failedLoginCount: 0,
    lockedUntil: null
  });

  await authService.markPasswordResetUsed(resetRequest.id);
  await authService.revokeAllOtherSessions(resetRequest.adminId);

  await logAdminActivity(req, { adminId: resetRequest.adminId, adminEmail: resetRequest.admin.email, action: 'PASSWORD_RESET_COMPLETE' });

  return successResponse(res, 200, 'Password has been reset successfully');
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.getActiveSessions(req.admin.id);
  const mappedSessions = sessions.map(s => ({
    id: s.id,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    lastActiveAt: s.lastActiveAt,
    expiresAt: s.expiresAt,
    isCurrent: s.id === req.sessionId
  }));
  return successResponse(res, 200, 'Sessions fetched successfully', mappedSessions);
});

export const revokeSession = asyncHandler(async (req, res) => {
  const sessionId = parseInt(req.params.id, 10);
  
  // Verify ownership
  const sessions = await authService.getActiveSessions(req.admin.id);
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    return errorResponse(res, 404, 'Session not found');
  }

  await authService.revokeSession(sessionId);

  await logAdminActivity(req, { adminId: req.admin.id, adminEmail: req.admin.email, action: 'SESSION_REVOKED', entityId: sessionId });

  return successResponse(res, 200, 'Session revoked successfully');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const admin = await prisma.admin.findUnique({ where: { emailVerifyToken: token } });

  if (!admin || !admin.emailVerifyExpiry || admin.emailVerifyExpiry < new Date()) {
    return errorResponse(res, 400, 'Invalid or expired verification token');
  }

  const updateData = {
    emailVerified: true,
    emailVerifyToken: null,
    emailVerifyExpiry: null
  };

  if (admin.pendingEmail) {
    updateData.email = admin.pendingEmail;
    updateData.pendingEmail = null;
  }

  await authService.updateAdminProfile(admin.id, updateData);
  await logAdminActivity(req, { adminId: admin.id, adminEmail: admin.email, action: 'EMAIL_VERIFIED' });

  return successResponse(res, 200, 'Email verified successfully');
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await authService.findAdminByEmail(email);

  if (!admin || admin.emailVerified && !admin.pendingEmail) {
    return successResponse(res, 200, 'Verification email sent if applicable');
  }

  const verifyToken = authService.generateSecureToken();
  await authService.updateAdminProfile(admin.id, {
    emailVerifyToken: verifyToken,
    emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60000)
  });

  const targetEmail = admin.pendingEmail || admin.email;
  await sendEmail({
    to: targetEmail,
    subject: 'Verify your email address',
    html: `<p>Please verify your email by clicking this link: <a href="${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}">Verify Email</a></p>`
  });

  await logAdminActivity(req, { adminId: admin.id, adminEmail: admin.email, action: 'VERIFICATION_EMAIL_RESENT' });

  return successResponse(res, 200, 'Verification email sent if applicable');
});
