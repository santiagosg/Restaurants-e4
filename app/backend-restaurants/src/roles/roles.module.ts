import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [],
  controllers: [RolesController],
  providers: [PrismaService, RolesService],
  exports: [RolesService],
})
export class RolesModule {}
