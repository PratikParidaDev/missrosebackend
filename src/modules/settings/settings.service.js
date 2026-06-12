import prisma from '../../config/db.js';

export const getSettings = async () => {
  return await prisma.siteSettings.findFirst();
};

export const updateSettings = async (data) => {
  const settings = await getSettings();
  if (!settings) {
    return await prisma.siteSettings.create({ data });
  }
  return await prisma.siteSettings.update({
    where: { id: settings.id },
    data
  });
};
