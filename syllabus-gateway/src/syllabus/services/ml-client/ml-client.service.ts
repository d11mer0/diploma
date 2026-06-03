import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface MlPredictionResponse {
  text: string;
  extracted_features: {
    technologies: string[];
    detected_bloom_levels: number[];
  };
  search_mode?: string;
  top_k?: number;
  results: any[];
}

export interface ModelInfoResponse {
  current_model_path: string;
  last_trained_at: string | null;
}

@Injectable()
export class MlClientService {
  // ОНОВЛЕНО: Читаємо URL з середовища, якщо немає - використовуємо localhost
  private readonly ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  constructor(private readonly httpService: HttpService) {}

  async predictCompetencies(text: string, topK: number = 5, threshold?: number): Promise<MlPredictionResponse> {
    try {
      const payload: any = {
        text: text,
        top_k: topK,
      };

      if (threshold) {
        payload.threshold = threshold;
      }

      const response$ = this.httpService.post<MlPredictionResponse>(
        `${this.ML_BASE_URL}/predict`,
        payload,
      );
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error('[MlClientService] Помилка зв\'язку з ML-ядром:', error);
      throw new InternalServerErrorException('Помилка при аналізі тексту в ML-сервісі');
    }
  }

  async trainModel(samples: any[]): Promise<any> {
    try {
      const response$ = this.httpService.post(
        `${this.ML_BASE_URL}/finetune/train`,
        { samples }
      );
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error('[MlClientService] Помилка при запуску донавчання:', error);
      throw new InternalServerErrorException('Помилка при донавчанні моделі в ML-сервісі');
    }
  }

  async getModelInfo(): Promise<ModelInfoResponse> {
    try {
      const response$ = this.httpService.get<ModelInfoResponse>(`${this.ML_BASE_URL}/model-info`);
      const response = await firstValueFrom(response$);
      return response.data;
    } catch (error) {
      console.error('[MlClientService] Помилка при отриманні інформації про модель:', error);
      throw new InternalServerErrorException('Не вдалося отримати інформацію про модель з ML-сервісу.');
    }
  }
}
