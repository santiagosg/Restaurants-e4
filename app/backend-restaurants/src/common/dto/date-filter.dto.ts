import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por fecha de creación (desde)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de creación (hasta)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  created_to?: string;
}
