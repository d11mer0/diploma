import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Підключаємося до бази даних при ініціалізації модуля
    await this.$connect();
  }

  async onModuleDestroy() {
    // Відключаємося від бази даних при знищенні модуля
    await this.$disconnect();
  }
}
