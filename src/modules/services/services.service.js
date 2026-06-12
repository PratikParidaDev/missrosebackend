import prisma from '../../config/db.js';

export const getAllServices = async (isAdmin = false, isFeatured = null) => {
  const where = {};
  if (!isAdmin) {
    where.isActive = true;
  }
  if (isFeatured !== null) {
    where.isFeatured = isFeatured;
  }

  return await prisma.service.findMany({
    where,
    orderBy: { sortOrder: 'asc' }
  });
};

export const getServiceById = async (id) => {
  return await prisma.service.findUnique({ where: { id: Number(id) } });
};

export const createService = async (data) => {
  return await prisma.service.create({ data });
};

export const updateService = async (id, data) => {
  return await prisma.service.update({
    where: { id: Number(id) },
    data
  });
};

export const deleteService = async (id) => {
  return await prisma.service.delete({
    where: { id: Number(id) }
  });
};
