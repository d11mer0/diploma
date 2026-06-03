import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Електронна пошта користувача',
  })
  @IsNotEmpty({ message: 'Email не може бути порожнім' })
  @IsEmail({}, { message: 'Невірний формат email' })
  email!: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль користувача (мінімум 6 символів)',
  })
  @IsNotEmpty({ message: 'Пароль не може бути порожнім' })
  @MinLength(6, { message: 'Пароль повинен містити щонайменше 6 символів' })
  password!: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Електронна пошта',
  })
  @IsNotEmpty({ message: 'Email не може бути порожнім' })
  @IsEmail({}, { message: 'Невірний формат email' })
  email!: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль',
  })
  @IsNotEmpty({ message: 'Пароль не може бути порожнім' })
  password!: string;
}

// НОВИЙ DTO
export class UpdateProfileDto {
  @ApiProperty({
    example: 'new.user@example.com',
    description: 'Нова електронна пошта користувача',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Невірний формат email' })
  email?: string;
}
