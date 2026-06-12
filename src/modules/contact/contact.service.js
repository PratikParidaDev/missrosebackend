import prisma from '../../config/db.js';

// Contact Info
export const getContactInfo = async () => {
  return await prisma.contactInfo.findFirst();
};

export const updateContactInfo = async (data) => {
  const info = await getContactInfo();
  if (!info) {
    return await prisma.contactInfo.create({ data });
  }
  return await prisma.contactInfo.update({
    where: { id: info.id },
    data
  });
};

// Contact Messages
export const createMessage = async (data) => {
  return await prisma.contactMessage.create({ data });
};

export const getAllMessages = async () => {
  return await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const markMessageAsRead = async (id) => {
  return await prisma.contactMessage.update({
    where: { id: Number(id) },
    data: { isRead: true }
  });
};
