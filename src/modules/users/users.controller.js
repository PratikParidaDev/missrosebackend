import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import * as usersService from './users.service.js';
import * as authService from '../auth/auth.service.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { logAdminActivity } from '../../utils/activityLogger.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await usersService.getUsers(req.query);
  return successResponse(res, 200, 'Users fetched successfully', result);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }
  return successResponse(res, 200, 'User fetched successfully', user);
});

export const createUser = asyncHandler(async (req, res) => {
  const existing = await authService.findAdminByEmail(req.body.email);
  if (existing) {
    return errorResponse(res, 400, 'Email already in use');
  }

  const { user, tempPassword } = await usersService.createUser(req.body);

  // Send welcome email with temp password and verification link
  await sendEmail({
    to: user.email,
    subject: 'Welcome to NewHaven Psychic CMS',
    html: `
      <p>Hello ${user.name || 'Admin'},</p>
      <p>An account has been created for you. Your temporary password is: <strong>${tempPassword}</strong></p>
      <p>Please log in and change your password immediately.</p>
      <p>Also, verify your email by clicking <a href="${process.env.FRONTEND_URL}/verify-email?token=${user.emailVerifyToken}">here</a>.</p>
    `
  });

  await logAdminActivity(req, {
    adminId: req.admin.id,
    adminEmail: req.admin.email,
    action: 'USER_CREATED',
    entityType: 'Admin',
    entityId: user.id,
    newValue: user
  });

  return successResponse(res, 201, 'User created successfully', user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const targetId = parseInt(req.params.id, 10);
  
  const existingUser = await usersService.getUserById(targetId);
  if (!existingUser) {
    return errorResponse(res, 404, 'User not found');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email && email !== existingUser.email) {
    const emailCheck = await authService.findAdminByEmail(email);
    if (emailCheck) {
      return errorResponse(res, 400, 'Email already in use');
    }
    updateData.pendingEmail = email;
    updateData.emailVerifyToken = authService.generateSecureToken();
    updateData.emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60000);
    
    // Notify about email change
    await sendEmail({
      to: email,
      subject: 'Verify your new email address',
      html: `<p>An admin has updated your email. Please verify by clicking this link: <a href="${process.env.FRONTEND_URL}/verify-email?token=${updateData.emailVerifyToken}">Verify Email</a></p>`
    });
  }

  const updatedUser = await usersService.updateUser(targetId, updateData);

  await logAdminActivity(req, {
    adminId: req.admin.id,
    adminEmail: req.admin.email,
    action: 'USER_UPDATED',
    entityType: 'Admin',
    entityId: targetId,
    oldValue: existingUser,
    newValue: updatedUser
  });

  return successResponse(res, 200, 'User updated successfully', updatedUser);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const targetId = parseInt(req.params.id, 10);

  const existingUser = await usersService.getUserById(targetId);
  if (!existingUser) {
    return errorResponse(res, 404, 'User not found');
  }

  // Prevent last SUPER_ADMIN from demoting themselves
  if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN' && req.admin.id === targetId) {
    const superAdminCount = await usersService.countSuperAdmins();
    if (superAdminCount <= 1) {
      return errorResponse(res, 403, 'Cannot demote the last SUPER_ADMIN');
    }
  }

  const updatedUser = await usersService.updateUser(targetId, { role });

  await logAdminActivity(req, {
    adminId: req.admin.id,
    adminEmail: req.admin.email,
    action: 'USER_ROLE_CHANGED',
    entityType: 'Admin',
    entityId: targetId,
    oldValue: { role: existingUser.role },
    newValue: { role }
  });

  return successResponse(res, 200, 'User role updated successfully', updatedUser);
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const targetId = parseInt(req.params.id, 10);

  const existingUser = await usersService.getUserById(targetId);
  if (!existingUser) {
    return errorResponse(res, 404, 'User not found');
  }

  if (targetId === req.admin.id) {
    return errorResponse(res, 403, 'You cannot suspend your own account');
  }

  const updatedUser = await usersService.updateUser(targetId, { isActive });

  if (!isActive) {
    // Revoke all sessions for suspended user
    await authService.revokeAllOtherSessions(targetId);
  }

  await logAdminActivity(req, {
    adminId: req.admin.id,
    adminEmail: req.admin.email,
    action: 'USER_STATUS_CHANGED',
    entityType: 'Admin',
    entityId: targetId,
    oldValue: { isActive: existingUser.isActive },
    newValue: { isActive }
  });

  return successResponse(res, 200, `User account ${isActive ? 'activated' : 'suspended'} successfully`, updatedUser);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  if (targetId === req.admin.id) {
    return errorResponse(res, 403, 'You cannot delete your own account');
  }

  const existingUser = await usersService.getUserById(targetId);
  if (!existingUser) {
    return errorResponse(res, 404, 'User not found');
  }

  if (existingUser.role === 'SUPER_ADMIN') {
    const superAdminCount = await usersService.countSuperAdmins();
    if (superAdminCount <= 1) {
      return errorResponse(res, 403, 'Cannot delete the last SUPER_ADMIN');
    }
  }

  await usersService.deleteUser(targetId);

  await logAdminActivity(req, {
    adminId: req.admin.id,
    adminEmail: req.admin.email,
    action: 'USER_DELETED',
    entityType: 'Admin',
    entityId: targetId,
    oldValue: existingUser
  });

  return successResponse(res, 200, 'User deleted successfully');
});

export const triggerPasswordReset = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const existingUser = await usersService.getUserById(targetId);
  
  if (!existingUser) {
    return errorResponse(res, 404, 'User not found');
  }

  const resetTokenRaw = await authService.createPasswordReset(targetId);
  
  await authService.updateAdminProfile(targetId, {
    isTempPassword: true,
    mustChangePassword: true
  });
  
  await sendEmail({
    to: existingUser.email,
    subject: 'Admin Password Reset',
    html: `<p>An administrator has triggered a password reset for your account. Click here: <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetTokenRaw}">Reset Password</a></p>`
  });

  await logAdminActivity(req, {
    adminId: req.admin.id,
    adminEmail: req.admin.email,
    action: 'PASSWORD_RESET_TRIGGERED',
    entityType: 'Admin',
    entityId: targetId
  });

  return successResponse(res, 200, 'Password reset email sent to user');
});
