import { IsOptional, IsString, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryDto } from '../../../../common/dto/query.dto';
import { DateFilterDto } from '../../../../common/dto/date-filter.dto';

export class ProductsQueryDto extends QueryDto {}

export class ProductsFiltersDto extends DateFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  restaurant_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la categoría',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por disponibilidad',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por productos vegetarianos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_vegetarian?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por productos veganos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_vegan?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por productos sin gluten',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_gluten_free?: boolean;

  @ApiPropertyOptional({
    description: 'Rango de precio mínimo',
    example: 10,
  })
  @IsOptional()
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Rango de precio máximo',
    example: 50,
  })
  @IsOptional()
  max_price?: number;

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
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';
}
