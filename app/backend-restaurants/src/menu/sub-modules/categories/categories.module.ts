import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../../common/services/prisma.service';

@Module({
  imports: [],
  controllers: [CategoriesController],
  providers: [PrismaService, CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
