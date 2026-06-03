import { PrismaClient } from '@prisma/client';

async function getSyllabusIds() {
  const prisma = new PrismaClient();
  try {
    const syllabi = await prisma.syllabus.findMany({
      select: {
        id: true,
        title: true,
        uploadedAt: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
    console.log(JSON.stringify(syllabi, null, 2));
  } catch (error) {
    console.error('Помилка отримання даних:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getSyllabusIds();
