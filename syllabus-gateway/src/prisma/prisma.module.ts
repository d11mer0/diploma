import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Експортуємо сервіс, щоб він був доступний в інших модулях
})
export class PrismaModule {}
