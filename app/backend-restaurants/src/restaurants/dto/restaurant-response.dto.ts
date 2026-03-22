import { ApiProperty } from '@nestjs/swagger';

export class RestaurantResponseDto {
  @ApiProperty({
    description: 'ID del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del propietario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  owner_id: string;

  @ApiProperty({
    description: 'Nombre del restaurante',
    example: 'La Bella Italia',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción del restaurante',
    example: 'Auténtica comida italiana en el corazón de la ciudad',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Tipo de cocina',
    example: 'Italiana',
    required: false,
  })
  cuisine_type?: string;

  @ApiProperty({
    description: 'Dirección física',
    example: 'Av. Principal 123',
  })
  address: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Madrid',
  })
  city: string;

  @ApiProperty({
    description: 'País',
    example: 'España',
  })
  country: string;

  @ApiProperty({
    description: 'Código postal',
    example: '28001',
    required: false,
  })
  zip_code?: string;

  @ApiProperty({
    description: 'Teléfono del restaurante',
    example: '+34912345678',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'contacto@labellaitalia.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Sitio web',
    example: 'https://labellaitalia.com',
    required: false,
  })
  website?: string;

  @ApiProperty({
    description: 'URL del logo',
    example: 'https://example.com/logo.png',
    required: false,
  })
  logo_url?: string;

  @ApiProperty({
    description: 'URL de imagen de portada',
    example: 'https://example.com/cover.jpg',
    required: false,
  })
  cover_image_url?: string;

  @ApiProperty({
    description: 'Calificación promedio',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  average_rating: number;

  @ApiProperty({
    description: 'Total de reseñas',
    example: 150,
  })
  total_reviews: number;

  @ApiProperty({
    description: 'Estado del restaurante',
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

export class RestaurantWithHoursDto extends RestaurantResponseDto {
  @ApiProperty({
    description: 'Horarios del restaurante',
    type: 'array',
    isArray: true,
  })
  hours?: any[];
}
