import prisma from '../../config/db.js';

export const getAllTestimonials = async (isAdmin = false) => {
  const where = {};
  if (!isAdmin) {
    where.isApproved = true;
  }

  return await prisma.testimonial.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

export const getTestimonialById = async (id) => {
  return await prisma.testimonial.findUnique({ where: { id: Number(id) } });
};

export const createTestimonial = async (data) => {
  return await prisma.testimonial.create({ data });
};

export const updateTestimonial = async (id, data) => {
  return await prisma.testimonial.update({
    where: { id: Number(id) },
    data
  });
};

export const approveTestimonial = async (id) => {
  return await prisma.testimonial.update({
    where: { id: Number(id) },
    data: { isApproved: true }
  });
};

export const deleteTestimonial = async (id) => {
  return await prisma.testimonial.delete({
    where: { id: Number(id) }
  });
};
