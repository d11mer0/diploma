import { Module } from '@nestjs/common';
import { MappingService } from './mapping.service';
import { MappingController } from './mapping.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SyllabusModule } from '../syllabus/syllabus.module';

@Module({
  imports: [PrismaModule, SyllabusModule],
  providers: [MappingService],
  controllers: [MappingController],
})
export class MappingModule {}
