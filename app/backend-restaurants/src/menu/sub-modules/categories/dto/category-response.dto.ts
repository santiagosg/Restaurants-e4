import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'ID de la categoría',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Entradas',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Platos para compartir como aperitivo',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 1,
  })
  display_order: number;

  @ApiProperty({
    description: 'Estado de la categoría',
    example: true,
  })
  is_active: boolean;

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

export class CategoryWithProductsDto extends CategoryResponseDto {
  @ApiProperty({
    description: 'Productos de la categoría',
    type: 'array',
    isArray: true,
  })
  products?: any[];
}
