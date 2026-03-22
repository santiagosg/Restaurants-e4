import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../common/services/prisma.service';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [RestaurantsModule],
  controllers: [ReviewsController],
  providers: [PrismaService, ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
