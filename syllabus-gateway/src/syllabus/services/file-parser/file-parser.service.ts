import { Injectable, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';
import * as cheerio from 'cheerio';
// ВИПРАВЛЕНО: Правильний імпорт для бібліотеки pdf-parse у середовищі TypeScript
import * as pdfParse from 'pdf-parse';

@Injectable()
export class FileParserService {
  async parse(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Файл не було надано.');
    }

    const lowerName = file.originalname ? file.originalname.toLowerCase() : '';
    const mimetype = file.mimetype ? file.mimetype.toLowerCase() : '';

    if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
      return this.parsePdf(file.buffer);
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword' ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc')
    ) {
      return this.parseDocx(file.buffer);
    }

    if (mimetype === 'text/html' || lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
      return this.parseHtml(file.buffer);
    }

    if (mimetype.startsWith('text/plain') || mimetype === 'text/plain' || lowerName.endsWith('.txt')) {
      return file.buffer.toString('utf-8');
    }

    throw new BadRequestException(`Непідтримуваний тип файлу: ${file.mimetype || file.originalname}. Підтримуються формати PDF, DOCX, TXT.`);
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    // ВИПРАВЛЕНО: Бібліотека pdf-parse експортує функцію, а не клас
    try {
      // TypeScript може скаржитися на default import, тому використовуємо безпечний спосіб виклику
      const parseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default;
      const result = await parseFunc(buffer);
      return result.text;
    } catch (error) {
      console.error('Помилка при парсингу PDF:', error);
      throw new BadRequestException('Не вдалося прочитати PDF файл. Переконайтеся, що він містить текст, а не лише зображення.');
    }
  }

  private async parseDocx(buffer: Buffer): Promise<string> {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  private parseHtml(buffer: Buffer): string {
    const $ = cheerio.load(buffer.toString('utf-8'));
    $('script, style').remove();
    return $('body').text();
  }
}
