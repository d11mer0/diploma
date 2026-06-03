import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FileParserService } from './services/file-parser/file-parser.service';
import { MlClientService, MlPredictionResponse } from './services/ml-client/ml-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { User, Syllabus } from '@prisma/client';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AnalyzeQueryDto } from './dto/analyze.dto';
import translate from 'translate';

export type AnalysisResponse = MlPredictionResponse & { syllabusId: string };

const createTitleFromText = (text: string): string => {
  const lines = text.split('\n');
  let firstMeaningfulLine = '';
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 5) {
      firstMeaningfulLine = trimmedLine;
      break;
    }
  }
  if (firstMeaningfulLine) {
    if (firstMeaningfulLine.length > 100) {
      return firstMeaningfulLine.substring(0, 100) + '...';
    }
    return firstMeaningfulLine;
  }
  return text.substring(0, 100) + '...';
};

@Injectable()
export class SyllabusService {
  constructor(
    private readonly fileParserService: FileParserService,
    private readonly mlClientService: MlClientService,
    private readonly prisma: PrismaService,
  ) {
    // Налаштування для бібліотеки translate
    translate.engine = 'google';
  }

  async analyzeFile(file: Express.Multer.File, user: User, query: AnalyzeQueryDto): Promise<AnalysisResponse> {
    if (!file) {
      throw new BadRequestException('Файл не було надано для аналізу.');
    }

    const rootDir = process.cwd();
    const uploadsDir = path.resolve(rootDir, 'uploads');
    
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    await fs.writeFile(filePath, file.buffer);

    const syllabusText = await this.fileParserService.parse(file);
    const title = createTitleFromText(syllabusText); 

    const relativePath = path.join('uploads', uniqueFilename);
    // Передаємо оригінальну назву файлу
    return this.processAndSave(syllabusText, title, user, query, relativePath, file.originalname);
  }

  async analyzeText(text: string, user: User, query: AnalyzeQueryDto): Promise<AnalysisResponse> {
    const title = createTitleFromText(text);
    return this.processAndSave(text, title, user, query, null, null);
  }

  async findAllForUser(user: User, page: number = 1, limit: number = 10) {
    const totalCount = await this.prisma.syllabus.count({ where: { userId: user.id } });
    const syllabi = await this.prisma.syllabus.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: syllabi,
      meta: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
    };
  }

  async findById(syllabusId: string, user: User): Promise<Syllabus> {
    const syllabus = await this.prisma.syllabus.findUnique({ where: { id: syllabusId } });
    if (!syllabus) throw new NotFoundException('Силабус не знайдено.');
    if (syllabus.userId !== user.id) throw new ForbiddenException('У вас немає доступу до цього ресурсу.');
    return syllabus;
  }

  async getAnalysisForSyllabus(syllabusId: string, user: User) {
    const syllabus = await this.findById(syllabusId, user);
    const outcomes = await this.prisma.learningOutcome.findMany({
      where: { syllabusId: syllabusId },
      include: {
        mappingResults: {
          include: { competence: true },
          orderBy: { finalScore: 'desc' },
        },
      },
    });
    return { syllabus, outcomes };
  }

  // ОНОВЛЕНО: Повертаємо originalFilename у сигнатурі методу
  async getSyllabusFileStream(syllabusId: string, user: User): Promise<{ stream: fsSync.ReadStream; title: string; originalFilename: string | null }> {
    const syllabus = await this.findById(syllabusId, user);
    if (!syllabus.filePath) throw new NotFoundException('Для цього силабусу немає збереженого файлу.');
    const rootDir = process.cwd();
    const absolutePath = path.resolve(rootDir, syllabus.filePath);
    if (!fsSync.existsSync(absolutePath)) {
      console.error(`Файл не знайдено за шляхом: ${absolutePath}`);
      throw new InternalServerErrorException('Файл не знайдено на диску.');
    }
    const stream = fsSync.createReadStream(absolutePath);
    return { stream, title: syllabus.title, originalFilename: syllabus.originalFilename };
  }

  async delete(id: string, user: User): Promise<{ message: string }> {
    const syllabus = await this.findById(id, user);
    if (syllabus.filePath) {
      try {
        const rootDir = process.cwd();
        const absolutePath = path.resolve(rootDir, syllabus.filePath);
        if (fsSync.existsSync(absolutePath)) await fs.unlink(absolutePath);
      } catch (error) {
        console.error(`Не вдалося видалити файл з диска: ${syllabus.filePath}`, error);
      }
    }
    await this.prisma.$transaction(async (tx) => {
      const outcomes = await tx.learningOutcome.findMany({ where: { syllabusId: syllabus.id }, select: { id: true } });
      const outcomeIds = outcomes.map(o => o.id);
      if (outcomeIds.length > 0) {
        await tx.mappingResult.deleteMany({ where: { outcomeId: { in: outcomeIds } } });
      }
      await tx.learningOutcome.deleteMany({ where: { syllabusId: syllabus.id } });
      await tx.syllabus.delete({ where: { id: syllabus.id } });
    });
    return { message: 'Силабус та всі пов\'язані дані успішно видалено.' };
  }

  private async processAndSave(
    syllabusText: string,
    title: string,
    user: User,
    query: AnalyzeQueryDto,
    filePath: string | null,
    originalFilename: string | null,
  ): Promise<AnalysisResponse> {
    const truncatedText = syllabusText.substring(0, 10000);
    
    let textToAnalyze = truncatedText;
    try {
      console.log('Починаємо переклад тексту...');
      textToAnalyze = await translate(truncatedText, 'en');
      console.log('Переклад успішно завершено.');
    } catch (error) {
      console.error('Помилка при перекладі тексту. Використовуємо оригінальний текст.', error);
      textToAnalyze = truncatedText;
    }
    
    const analysisResult = await this.mlClientService.predictCompetencies(textToAnalyze, query.topK, query.threshold);
    
    let createdSyllabus: Syllabus;

    try {
      createdSyllabus = await this.prisma.$transaction(async (tx) => {
        const mockEducationLevel = "Bachelor";

        const syllabus = await tx.syllabus.create({
          data: {
            title: title,
            educationLevel: mockEducationLevel,
            userId: user.id,
            filePath: filePath,
            originalFilename: originalFilename, // ЗБЕРІГАЄМО ОРИГІНАЛЬНУ НАЗВУ
            threshold: query.threshold,
          },
        });

        const learningOutcome = await tx.learningOutcome.create({
          data: {
            originalText: syllabusText,
            syllabusId: syllabus.id,
            technologies: analysisResult.extracted_features?.technologies || [],
            bloomLevels: analysisResult.extracted_features?.detected_bloom_levels || [],
          },
        });

        const mappingData = analysisResult.results.map(result => ({
          outcomeId: learningOutcome.id,
          competenceId: result.competency_id,
          semanticSimilarity: result.details.raw_cross_score,
          finalScore: result.similarity,
        }));

        if (mappingData.length > 0) {
          await tx.mappingResult.createMany({
            data: mappingData,
          });
        }
        
        return syllabus;
      });
    } catch (error) {
      console.error("Помилка при збереженні до бази даних:", error);
      throw new InternalServerErrorException('Не вдалося зберегти результат аналізу.');
    }

    return { ...analysisResult, syllabusId: createdSyllabus.id };
  }
}
