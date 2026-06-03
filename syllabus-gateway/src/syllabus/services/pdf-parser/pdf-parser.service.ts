import { Injectable, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';
import * as cheerio from 'cheerio';

const pdfParse = require('pdf-parse');

@Injectable()
export class DocumentParserService {
  
  /**
   * Головний метод, який визначає тип файлу і викликає потрібний парсер
   */
  async parseFile(buffer: Buffer, mimetype: string): Promise<string> {
    try {
      if (mimetype === 'application/pdf') {
        return await this.parsePdf(buffer);
      } 
      
      if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
        return await this.parseWord(buffer);
      }

      if (mimetype === 'text/html') {
        return this.parseHtml(buffer);
      }

      if (mimetype === 'text/plain') {
        return buffer.toString('utf-8');
      }

      // Якщо формат не підтримується
      throw new BadRequestException(`Формат файлу ${mimetype} не підтримується. Завантажте PDF, DOCX, HTML або TXT.`);
      
    } catch (error) {
      console.error('[DocumentParserService] Помилка парсингу:', error);
      throw new BadRequestException('Не вдалося прочитати файл. Перевірте, чи він не пошкоджений.');
    }
  }

  // --- Внутрішні методи для кожного формату ---

  private async parsePdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return this.cleanText(data.text);
  }

  private async parseWord(buffer: Buffer): Promise<string> {
    // mammoth витягує сирий текст з docx
    const result = await mammoth.extractRawText({ buffer });
    return this.cleanText(result.value);
  }

  private parseHtml(buffer: Buffer): string {
    const htmlString = buffer.toString('utf-8');
    const $ = cheerio.load(htmlString);
    
    // Видаляємо скрипти та стилі, щоб вони не потрапили в текст
    $('script, style').remove();
    
    // Витягуємо чистий текст
    const text = $('body').text();
    return this.cleanText(text);
  }

  /**
   * Утиліта для очищення тексту від зайвих пробілів та переносів рядків,
   * щоб ML-моделі було легше його читати.
   */
  private cleanText(rawText: string): string {
    return rawText
      .replace(/\n+/g, ' ') // Замінюємо переноси на пробіли
      .replace(/\s+/g, ' ') // Прибираємо множинні пробіли
      .trim();              // Обрізаємо краї
  }
}