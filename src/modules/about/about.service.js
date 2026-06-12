import prisma from '../../config/db.js';

export const getAbout = async () => {
  return await prisma.aboutSection.findFirst();
};

export const updateAbout = async (data) => {
  const about = await getAbout();
  
  if (!about) {
    return await prisma.aboutSection.create({ data });
  }

  return await prisma.aboutSection.update({
    where: { id: about.id },
    data
  });
};
