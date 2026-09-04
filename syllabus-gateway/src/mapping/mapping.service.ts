import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MlClientService } from '../syllabus/services/ml-client/ml-client.service';

@Injectable()
export class MappingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mlClientService: MlClientService,
  ) {}

  async validateMapping(mappingId: string): Promise<{ message: string }> {
    const mapping = await this.prisma.mappingResult.findUnique({
      where: { id: mappingId },
    });

    if (!mapping) {
      throw new NotFoundException('Результат мапінгу не знайдено.');
    }

    await this.prisma.mappingResult.update({
      where: { id: mappingId },
      data: { expertValidated: true },
    });

    return { message: 'Результат мапінгу успішно валідовано.' };
  }

  async getTrainingStats(): Promise<any> {
    try {
      // ОНОВЛЕНО: Рахуємо лише "свіжі" (невикористані) зразки
      const newValidatedCount = await this.prisma.mappingResult.count({
        where: { 
          expertValidated: true,
          usedForTraining: false, // Тільки нові
        },
      });

      // Додатково можемо порахувати загальну кількість для інтересу
      const totalHistoricallyValidated = await this.prisma.mappingResult.count({
        where: { expertValidated: true }
      });

      const modelInfo = await this.mlClientService.getModelInfo();

      return {
        totalValidatedSamples: newValidatedCount, // Кількість для поточного навчання
        totalHistoricallyValidated: totalHistoricallyValidated, // Загальна кількість за весь час
        lastTrainedAt: modelInfo.last_trained_at,
        currentModelPath: modelInfo.current_model_path,
      };
    } catch (error) {
      console.error('[MappingService] Помилка отримання статистики:', error);
      throw new InternalServerErrorException('Помилка при отриманні статистики навчання.');
    }
  }

  async exportTrainingData(): Promise<{ message: string; samplesCount: number; mlResult: any }> {
    // ОНОВЛЕНО: Витягуємо лише невикористані зразки
    const validatedMappings = await this.prisma.mappingResult.findMany({
      where: { 
        expertValidated: true,
        usedForTraining: false,
      },
      include: {
        outcome: true,
        competence: true,
      },
    });

    if (validatedMappings.length === 0) {
      return { message: 'Немає нових валідованих даних для експорту.', samplesCount: 0, mlResult: null };
    }

    const trainingSamples = validatedMappings.map(m => {
      const positiveText = `${m.competence.name}. ${m.competence.description}`;
      
      const negativeCompetences = validatedMappings
        .filter(other => other.outcomeId === m.outcomeId && other.competenceId !== m.competenceId)
        .map(other => `${other.competence.name}. ${other.competence.description}`);

      return {
        query: m.outcome.originalText,
        positive: positiveText,
        negative: negativeCompetences.length > 0 ? negativeCompetences[0] : 'Other IT competence description',
      };
    });

    try {
      // Запускаємо навчання
      const mlResult = await this.mlClientService.trainModel(trainingSamples);
      
      // ОНОВЛЕНО: Якщо навчання пройшло успішно (не впало з помилкою),
      // позначаємо ці зразки як використані.
      const mappingIds = validatedMappings.map(m => m.id);
      
      await this.prisma.mappingResult.updateMany({
        where: { id: { in: mappingIds } },
        data: { usedForTraining: true }, // Змінюємо прапорець
      });

      return {
        message: 'Дані успішно відправлені на донавчання, а зразки позначені як використані.',
        samplesCount: trainingSamples.length,
        mlResult,
      };
    } catch (error) {
      console.error('[MappingService] Помилка при відправці даних на донавчання:', error);
      throw new InternalServerErrorException('Помилка при запуску донавчання в ML-сервісі.');
    }
  }

  async demoSeedValidations(): Promise<{ message: string; count: number }> {
    // 1. Спочатку шукаємо наявні невалідовані результати мапінгу
    const unvalidated = await this.prisma.mappingResult.findMany({
      where: { expertValidated: false },
      take: 5,
    });

    if (unvalidated.length > 0) {
      const ids = unvalidated.map((m) => m.id);
      await this.prisma.mappingResult.updateMany({
        where: { id: { in: ids } },
        data: { expertValidated: true, usedForTraining: false },
      });
      return {
        message: `Успішно підготовлено та валідовано ${ids.length} зразків для демонстрації Active Learning.`,
        count: ids.length,
      };
    }

    // 2. Якщо всі вже валідовані, скидаємо стан 'usedForTraining' для перших 5 записів
    const anyMappings = await this.prisma.mappingResult.findMany({
      take: 5,
    });

    if (anyMappings.length > 0) {
      const ids = anyMappings.map((m) => m.id);
      await this.prisma.mappingResult.updateMany({
        where: { id: { in: ids } },
        data: { expertValidated: true, usedForTraining: false },
      });
      return {
        message: `Скинуто стан та підготовлено ${ids.length} зразків для нового циклу донавчання.`,
        count: ids.length,
      };
    }

    return {
      message: 'У базі даних ще немає результатів мапінгу. Спочатку завантажте силабус.',
      count: 0,
    };
  }
}
