import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Інтерфейс для вхідного JSON
interface InputCompetence {
  competency_id: number;
  code: string;
  name: string;
  description: string;
  levels: Array<{
    level_id: number;
    level: number;
    description: string;
  }>;
}

async function main() {
  console.log('Start seeding with new ECF structure...');

  // Спочатку намагаємося знайти файл у папці ML-сервісу (для локальної розробки)
  let filePath = path.join(__dirname, '..', '..', 'ml-bert-service', 'data', 'ecf_competences.json');
  
  // Якщо не знайдено (наприклад, у Docker контейнері), шукаємо в локальній папці gateway
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '..', 'ecf_data.json');
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Помилка: Еталонний файл не знайдено за жодним зі шляхів.`);
    return;
  }

  console.log(`Використовуємо файл даних: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const competences: InputCompetence[] = JSON.parse(fileContent);

  let processedCount = 0;

  for (const comp of competences) {
    for (const levelInfo of comp.levels) {
      // Пропускаємо рівні без опису
      if (levelInfo.description === '-') {
        continue;
      }

      // Створюємо унікальний ID, як і в ML-сервісі
      const uniqueId = `${comp.code}-${levelInfo.level}`;

      await prisma.competenceECF.upsert({
        where: { id: uniqueId },
        update: {
          code: comp.code,
          name: comp.name,
          // Опис беремо з основного об'єкту компетенції
          description: comp.description,
          level: levelInfo.level,
          levelId: levelInfo.level_id,
        },
        create: {
          id: uniqueId,
          code: comp.code,
          name: comp.name,
          description: comp.description,
          level: levelInfo.level,
          levelId: levelInfo.level_id,
        },
      });
      processedCount++;
    }
  }

  console.log(`Seeding finished. Processed ${processedCount} competence levels.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });