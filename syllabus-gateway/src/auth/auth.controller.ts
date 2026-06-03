import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { User } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Вхід в систему та отримання токенів' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Отримати інформацію про поточного користувача' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: { user: User }) {
    return this.authService.getMe(req.user.id);
  }

  // НОВИЙ ЕНДПОІНТ
  @ApiOperation({ summary: 'Оновити інформацію профілю поточного користувача' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Request() req: { user: User },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Вихід із системи (скасування refresh токена)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: { user: User }) {
    return this.authService.logout(req.user.id);
  }

  @ApiOperation({ summary: 'Отримання нової пари токенів за допомогою refresh токена' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Request() req: ExpressRequest & { user: User }) {
    const userId = req.user.id;
    const refreshToken = req.get('authorization')!.replace('Bearer', '').trim();
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
