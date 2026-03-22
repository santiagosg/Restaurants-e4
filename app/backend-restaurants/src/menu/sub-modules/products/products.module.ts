import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../../../common/services/prisma.service';

@Module({
  imports: [],
  controllers: [ProductsController],
  providers: [PrismaService, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
