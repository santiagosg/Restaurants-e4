import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUrl,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DietaryType {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  restaurant_id: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Pizza Margherita',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Tomate, mozzarella fresca y albahaca',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 12.50,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Moneda',
    example: 'USD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(1, 3)
  currency?: string;

  @ApiPropertyOptional({
    description: 'URL de imagen del producto',
    example: 'https://example.com/pizza.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Disponibilidad',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @ApiPropertyOptional({
    description: 'Tiempo de preparación en minutos',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  preparation_time?: number;

  @ApiPropertyOptional({
    description: 'Calorías',
    example: 350,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiPropertyOptional({
    description: 'Es vegetariano',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_vegetarian?: boolean;

  @ApiPropertyOptional({
    description: 'Es vegano',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_vegan?: boolean;

  @ApiPropertyOptional({
    description: 'Sin gluten',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_gluten_free?: boolean;
}
