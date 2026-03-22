import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [],
  controllers: [RestaurantsController],
  providers: [PrismaService, RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
