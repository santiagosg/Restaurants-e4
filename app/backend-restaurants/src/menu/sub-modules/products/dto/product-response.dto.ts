import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'ID de la categoría',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  category_id?: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Pizza Margherita',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Tomate, mozzarella fresca y albahaca',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 12.50,
  })
  price: number;

  @ApiProperty({
    description: 'Moneda',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'URL de imagen del producto',
    example: 'https://example.com/pizza.jpg',
    required: false,
  })
  image_url?: string;

  @ApiProperty({
    description: 'Disponibilidad',
    example: true,
  })
  is_available: boolean;

  @ApiProperty({
    description: 'Tiempo de preparación en minutos',
    example: 20,
    required: false,
  })
  preparation_time?: number;

  @ApiProperty({
    description: 'Calorías',
    example: 350,
    required: false,
  })
  calories?: number;

  @ApiProperty({
    description: 'Es vegetariano',
    example: true,
  })
  is_vegetarian: boolean;

  @ApiProperty({
    description: 'Es vegano',
    example: false,
  })
  is_vegan: boolean;

  @ApiProperty({
    description: 'Sin gluten',
    example: false,
  })
  is_gluten_free: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00Z',
  })
  updated_at: Date;
}

export class ProductWithCategoryDto extends ProductResponseDto {
  @ApiProperty({
    description: 'Categoría del producto',
    required: false,
  })
  category?: any;
}
