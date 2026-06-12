import prisma from '../../config/db.js';

export const getHero = async () => {
  return await prisma.heroSection.findFirst();
};

export const updateHero = async (data) => {
  const hero = await getHero();
  
  if (!hero) {
    return await prisma.heroSection.create({ data });
  }

  return await prisma.heroSection.update({
    where: { id: hero.id },
    data
  });
};
