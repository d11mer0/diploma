import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SyllabusController } from './syllabus.controller';
import { SyllabusService } from './syllabus.service';
import { MlClientService } from './services/ml-client/ml-client.service';
import { FileParserService } from './services/file-parser/file-parser.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    HttpModule,
    PrismaModule
  ],
  controllers: [SyllabusController],
  providers: [
    SyllabusService, 
    MlClientService, 
    FileParserService,
  ],
  exports: [MlClientService]
})
export class SyllabusModule {}
