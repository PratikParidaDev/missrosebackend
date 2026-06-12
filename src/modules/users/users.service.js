import prisma from '../../config/db.js';
import crypto from 'crypto';
import { hashPassword, generateSecureToken } from '../auth/auth.service.js';

export const getUsers = async ({ page = 1, limit = 20, role, isActive }) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      skip,
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true
      }
    }),
    prisma.admin.count({ where })
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getUserById = async (id) => {
  return await prisma.admin.findUnique({
    where: { id: parseInt(id, 10) },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      emailVerified: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true
    }
  });
};

export const createUser = async (data) => {
  const tempPassword = crypto.randomBytes(8).toString('hex');
  const hashedPassword = await hashPassword(tempPassword);
  
  const user = await prisma.admin.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role || 'EDITOR',
      password: hashedPassword,
      isTempPassword: true,
      mustChangePassword: true,
      emailVerified: false,
      emailVerifyToken: generateSecureToken(),
      emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60000)
    }
  });

  return { user, tempPassword };
};

export const updateUser = async (id, data) => {
  return await prisma.admin.update({
    where: { id: parseInt(id, 10) },
    data,
    select: {
      id: true, email: true, name: true, role: true, isActive: true
    }
  });
};

export const deleteUser = async (id) => {
  return await prisma.admin.delete({
    where: { id: parseInt(id, 10) }
  });
};

export const countSuperAdmins = async () => {
  return await prisma.admin.count({
    where: { role: 'SUPER_ADMIN' }
  });
};
