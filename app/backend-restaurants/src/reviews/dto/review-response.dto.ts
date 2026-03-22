import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'ID de la reseña',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  user_id: string;

  @ApiProperty({
    description: 'ID de la orden',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  order_id?: string;

  @ApiProperty({
    description: 'Calificación (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Comentario de la reseña',
    example: 'Excelente comida y servicio atento',
    required: false,
  })
  comment?: string;

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

export class ReviewWithDetailsDto extends ReviewResponseDto {
  @ApiProperty({
    description: 'Restaurante',
    required: false,
  })
  restaurant?: any;

  @ApiProperty({
    description: 'Usuario',
    required: false,
  })
  user?: any;

  @ApiProperty({
    description: 'Orden',
    required: false,
  })
  order?: any;
}
