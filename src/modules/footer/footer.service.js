import prisma from '../../config/db.js';

export const getFooter = async () => {
  return await prisma.footerConfig.findFirst();
};

export const updateFooter = async (data) => {
  const footer = await getFooter();
  if (!footer) {
    return await prisma.footerConfig.create({ data });
  }
  return await prisma.footerConfig.update({
    where: { id: footer.id },
    data
  });
};
