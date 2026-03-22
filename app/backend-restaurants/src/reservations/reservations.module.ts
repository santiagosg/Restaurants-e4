import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [],
  controllers: [ReservationsController],
  providers: [PrismaService, ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
