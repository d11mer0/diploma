import { Module } from '@nestjs/common';
import { SyllabusModule } from './syllabus/syllabus.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MappingModule } from './mapping/mapping.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SyllabusModule,
    PrismaModule,
    AuthModule,
    MappingModule, // Додаємо новий модуль
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
