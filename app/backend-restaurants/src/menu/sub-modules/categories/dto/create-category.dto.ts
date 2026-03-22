import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  restaurant_id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Entradas',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Platos para compartir como aperitivo',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  display_order?: number;

  @ApiPropertyOptional({
    description: 'Estado de la categoría',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
