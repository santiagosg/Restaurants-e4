import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryDto } from '../../common/dto/query.dto';
import { DateFilterDto } from '../../common/dto/date-filter.dto';

export class RestaurantsQueryDto extends QueryDto {
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

export class RestaurantFiltersDto extends DateFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del propietario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  owner_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ciudad',
    example: 'Madrid',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de cocina',
    example: 'Italiana',
  })
  @IsOptional()
  @IsString()
  cuisine_type?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    example: true,
  })
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por IDs específicos',
    example: ['1', '2', '3'],
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}
