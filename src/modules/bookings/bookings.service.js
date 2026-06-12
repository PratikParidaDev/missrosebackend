import prisma from '../../config/db.js';

export const createBooking = async (data) => {
  return await prisma.booking.create({ data });
};

export const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      service: { select: { title: true, sessionType: true, price: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getBookingById = async (id) => {
  return await prisma.booking.findUnique({
    where: { id: Number(id) },
    include: {
      service: true
    }
  });
};

export const updateBookingStatus = async (id, data) => {
  return await prisma.booking.update({
    where: { id: Number(id) },
    data
  });
};

export const deleteBooking = async (id) => {
  return await prisma.booking.delete({
    where: { id: Number(id) }
  });
};
