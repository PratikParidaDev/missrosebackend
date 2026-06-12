import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse.js';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    if (!admin) {
      return errorResponse(res, 401, 'Not authorized, user not found');
    }

    if (!admin.isActive) {
      return errorResponse(res, 401, 'Not authorized, account is suspended');
    }

    // Check if the session is still valid (not revoked)
    if (decoded.sessionId) {
      const session = await prisma.adminSession.findUnique({
        where: { id: decoded.sessionId }
      });
      if (!session || session.revokedAt) {
        return errorResponse(res, 401, 'Not authorized, session expired or revoked');
      }

      // Update lastActiveAt
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() }
      });
      
      req.sessionId = session.id;
    }

    req.admin = admin;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized, token failed');
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.admin) {
      return errorResponse(res, 401, 'Not authorized');
    }
    
    if (req.admin.role !== role && req.admin.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, `Forbidden: Requires ${role} role`);
    }

    next();
  };
};
