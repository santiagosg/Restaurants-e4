import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsUrl,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'ID del propietario del restaurante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  owner_id: string;

  @ApiProperty({
    description: 'Nombre del restaurante',
    example: 'La Bella Italia',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del restaurante',
    example: 'Auténtica comida italiana en el corazón de la ciudad',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tipo de cocina',
    example: 'Italiana',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  cuisine_type?: string;

  @ApiProperty({
    description: 'Dirección física',
    example: 'Av. Principal 123',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Madrid',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'País',
    example: 'España',
  })
  @IsString()
  country: string;

  @ApiPropertyOptional({
    description: 'Código postal',
    example: '28001',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  zip_code?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del restaurante',
    example: '+34912345678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto',
    example: 'contacto@labellaitalia.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Sitio web',
    example: 'https://labellaitalia.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'URL del logo',
    example: 'https://example.com/logo.png',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({
    description: 'URL de imagen de portada',
    example: 'https://example.com/cover.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  cover_image_url?: string;
}
