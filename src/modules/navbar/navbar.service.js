import prisma from '../../config/db.js';

export const getNavbar = async () => {
  return await prisma.navbarConfig.findFirst();
};

export const updateNavbar = async (data) => {
  const navbar = await getNavbar();
  if (!navbar) {
    return await prisma.navbarConfig.create({ data });
  }
  return await prisma.navbarConfig.update({
    where: { id: navbar.id },
    data
  });
};
