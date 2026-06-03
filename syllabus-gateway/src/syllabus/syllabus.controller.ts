import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Request, Body, Get, Param, ParseUUIDPipe, Query, Delete, Res, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SyllabusService } from './syllabus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyzeQueryDto, AnalyzeTextDto } from './dto/analyze.dto';
import type { Response } from 'express';
import * as path from 'path';
import * as mime from 'mime-types'; // Можливо, доведеться додати npm install mime-types

@ApiTags('Syllabus')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('syllabus')
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @Post('analyze/file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Аналіз силабусу з файлу (PDF, DOCX, HTML)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        topK: { type: 'number', default: 5 },
        threshold: { type: 'number', example: 0.55 },
      },
    },
  })
  async analyzeFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: User },
    @Body() body: AnalyzeQueryDto,
  ) {
    return this.syllabusService.analyzeFile(file, req.user, body);
  }

  @Post('analyze/text')
  @ApiOperation({ summary: 'Аналіз силабусу з текстового рядка' })
  async analyzeText(
    @Body() dto: AnalyzeTextDto,
    @Request() req: { user: User },
  ) {
    const { text, ...query } = dto;
    return this.syllabusService.analyzeText(text, req.user, query);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати список всіх силабусів користувача' })
  async findAllForUser(
    @Request() req: { user: User },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.syllabusService.findAllForUser(req.user, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати базову інформацію про силабус' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
  ) {
    return this.syllabusService.findById(id, req.user);
  }

  @Get(':id/analysis')
  @ApiOperation({ summary: 'Отримати детальні результати аналізу для силабусу' })
  async getAnalysis(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
  ) {
    return this.syllabusService.getAnalysisForSyllabus(id, req.user);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Завантажити оригінальний файл силабусу' })
  async downloadSyllabus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, title, originalFilename } = await this.syllabusService.getSyllabusFileStream(id, req.user);
    
    // ОНОВЛЕНО: Правильне встановлення типу файлу
    let contentType = 'application/octet-stream';
    let finalFilename = title;

    if (originalFilename) {
      // Визначаємо розширення файлу з його оригінальної назви (яка тепер зберігається в БД)
      const ext = path.extname(originalFilename);
      const lookupType = mime.lookup(ext);
      if (lookupType) {
        contentType = lookupType;
      }
      
      // Формуємо ім'я файлу: Title + розширення
      finalFilename = `${title.replace(/[^a-zA-Zа-яА-Я0-9_ -]/g, '').substring(0, 50)}${ext}`;
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(finalFilename)}"`,
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити силабус та всі пов\'язані дані' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: User },
  ) {
    return this.syllabusService.delete(id, req.user);
  }
}
