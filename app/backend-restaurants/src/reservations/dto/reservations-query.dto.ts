import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryDto } from '../../common/dto/query.dto';
import { DateFilterDto } from '../../common/dto/date-filter.dto';
import { ReservationStatus } from './create-reservation.dto';

export class ReservationsQueryDto extends QueryDto {}

export class ReservationsFiltersDto extends DateFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  restaurant_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la mesa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  table_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ReservationStatus,
  })
  @IsOptional()
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de reserva (desde)',
    example: '2024-12-01',
  })
  @IsOptional()
  @IsDateString()
  reservation_date_from?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de reserva (hasta)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  reservation_date_to?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por IDs específicos',
    example: ['1', '2', '3'],
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @ApiPropertyOptional({
    description: 'Campo para ordenar',
    example: 'reservation_date',
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'Ordenamiento: asc o desc',
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}
