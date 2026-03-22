import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  restaurant_id: string;

  @ApiProperty({
    description: 'ID del usuario que escribe la reseña',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  user_id: string;

  @ApiPropertyOptional({
    description: 'ID de la orden (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  order_id?: string;

  @ApiProperty({
    description: 'Calificación (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Comentario de la reseña',
    example: 'Excelente comida y servicio atento',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
