import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsNumber, IsNotEmpty } from 'class-validator'; // Додано IsNotEmpty
import { Type } from 'class-transformer';

export class AnalyzeQueryDto {
  @ApiProperty({
    description: 'Кількість найкращих результатів для повернення.',
    required: false,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  topK?: number;

  @ApiProperty({
    description: 'Поріг схожості (від 0.0 до 1.0). Якщо вказано, ігнорує topK.',
    required: false,
    example: 0.55,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number;
}

export class AnalyzeTextDto extends AnalyzeQueryDto {
    @ApiProperty({
        description: 'Текст для аналізу.',
        example: 'Студент повинен вміти розробляти веб-додатки на React.'
    })
    @IsNotEmpty({ message: 'Текст не може бути порожнім' })
    text: string;
}
