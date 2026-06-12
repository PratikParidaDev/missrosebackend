import prisma from '../../config/db.js';

export const getLogs = async ({ 
  page = 1, 
  limit = 20, 
  adminId, 
  action, 
  entityType, 
  entityId, 
  ipAddress, 
  dateFrom, 
  dateTo, 
  status 
}) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (adminId) where.adminId = parseInt(adminId, 10);
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = parseInt(entityId, 10);
  if (ipAddress) where.ipAddress = { contains: ipAddress, mode: 'insensitive' };
  if (status) where.status = status;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [logs, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      skip,
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        adminId: true,
        adminEmail: true,
        action: true,
        entityType: true,
        entityId: true,
        ipAddress: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.adminActivityLog.count({ where })
  ]);

  return {
    logs,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getLogById = async (id) => {
  return await prisma.adminActivityLog.findUnique({
    where: { id: parseInt(id, 10) }
  });
};

export const getAllFilteredLogsForExport = async ({ 
  adminId, action, entityType, dateFrom, dateTo, status 
}) => {
  const where = {};

  if (adminId) where.adminId = parseInt(adminId, 10);
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (status) where.status = status;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  return await prisma.adminActivityLog.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

export const deleteLog = async (id) => {
  return await prisma.adminActivityLog.delete({
    where: { id: parseInt(id, 10) }
  });
};

export const purgeOldLogs = async (daysToKeep = 60) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.adminActivityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      }
    }
  });

  return result.count;
};

export const getLogStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalLogs, loginFailures, topAdmins] = await Promise.all([
    prisma.adminActivityLog.count(),
    
    prisma.adminActivityLog.count({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: { gte: thirtyDaysAgo }
      }
    }),

    prisma.adminActivityLog.groupBy({
      by: ['adminEmail'],
      _count: { adminEmail: true },
      orderBy: { _count: { adminEmail: 'desc' } },
      take: 5
    })
  ]);

  return {
    totalLogs,
    recentLoginFailures: loginFailures,
    topActiveAdmins: topAdmins.map(a => ({ email: a.adminEmail, count: a._count.adminEmail }))
  };
};
