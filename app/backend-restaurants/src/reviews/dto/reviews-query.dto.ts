import { IsOptional, IsString, IsNumber, Min, Max, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryDto } from '../../common/dto/query.dto';
import { DateFilterDto } from '../../common/dto/date-filter.dto';

export class ReviewsQueryDto extends QueryDto {}

export class ReviewsFiltersDto extends DateFilterDto {
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
    description: 'Filtrar por ID de la orden',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  order_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por calificación mínima',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  min_rating?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por calificación máxima',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  max_rating?: number;

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
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'Ordenamiento: asc o desc',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}
