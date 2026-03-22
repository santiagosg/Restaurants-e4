import { ApiProperty } from '@nestjs/swagger';

export class ReservationResponseDto {
  @ApiProperty({
    description: 'ID de la reserva',
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
    description: 'ID de la mesa',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  table_id?: string;

  @ApiProperty({
    description: 'Fecha de la reserva',
    example: '2024-12-25T00:00:00Z',
  })
  reservation_date: Date;

  @ApiProperty({
    description: 'Hora de la reserva',
    example: '2024-12-25T19:00:00Z',
  })
  reservation_time: Date;

  @ApiProperty({
    description: 'Número de personas',
    example: 4,
  })
  party_size: number;

  @ApiProperty({
    description: 'Solicitudes especiales',
    example: 'Cumpleaños, preferencia junto a la ventana',
    required: false,
  })
  special_requests?: string;

  @ApiProperty({
    description: 'Estado de la reserva',
    example: 'CONFIRMED',
    enum: ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'],
  })
  status: string;

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

export class ReservationWithDetailsDto extends ReservationResponseDto {
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
    description: 'Mesa',
    required: false,
  })
  table?: any;
}
