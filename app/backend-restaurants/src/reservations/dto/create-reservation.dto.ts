import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SEATED = 'SEATED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  restaurant_id: string;

  @ApiProperty({
    description: 'ID del usuario que hace la reserva',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  user_id: string;

  @ApiPropertyOptional({
    description: 'ID de la mesa (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  table_id?: string;

  @ApiProperty({
    description: 'Fecha de la reserva (YYYY-MM-DD)',
    example: '2024-12-25',
  })
  @IsDateString()
  reservation_date: string;

  @ApiProperty({
    description: 'Hora de la reserva (HH:MM)',
    example: '19:00',
  })
  @IsString()
  reservation_time: string;

  @ApiProperty({
    description: 'Número de personas',
    example: 4,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  party_size: number;

  @ApiPropertyOptional({
    description: 'Solicitudes especiales',
    example: 'Cumpleaños, preferencia junto a la ventana',
  })
  @IsOptional()
  @IsString()
  special_requests?: string;

  @ApiPropertyOptional({
    description: 'Estado de la reserva',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
