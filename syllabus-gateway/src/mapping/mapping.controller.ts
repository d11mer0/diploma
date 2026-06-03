import { Controller, Patch, Param, Post, Get, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { MappingService } from './mapping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Mapping')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mappings')
export class MappingController {
  constructor(private readonly mappingService: MappingService) {}

  @ApiOperation({ summary: 'Валідація результату мапінгу експертом' })
  @Roles('EXPERT', 'ADMIN')
  @Patch(':id/validate')
  async validateMapping(@Param('id', ParseUUIDPipe) id: string) {
    return this.mappingService.validateMapping(id);
  }

  // НОВИЙ ЕНДПОІНТ
  @ApiOperation({ summary: 'Отримати статистику для донавчання моделі' })
  @ApiResponse({ status: 200, description: 'Повертає кількість зразків та інформацію про останнє навчання' })
  @Roles('ADMIN')
  @Get('training-stats')
  async getTrainingStats() {
    return this.mappingService.getTrainingStats();
  }

  @ApiOperation({ 
    summary: 'Експорт валідованих даних та запуск донавчання моделі (Active Learning)',
    description: 'Збирає всі результати з expertValidated=true і відправляє їх в ML-сервіс для fine-tuning.'
  })
  @ApiResponse({ status: 201, description: 'Дані успішно відправлені на донавчання' })
  @Roles('ADMIN')
  @Post('export-training-data')
  async exportTrainingData() {
    return this.mappingService.exportTrainingData();
  }
}
