import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un nuevo usuario
 *
 * FALTA IMPLEMENTAR:
 * - Validar formato de email único
 * - Validar requisitos de contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número, 1 especial)
 * - Validar formato de teléfono
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario (debe ser único)',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  /**
   * Contraseña del usuario
   *
   * FALTA IMPLEMENTAR:
   * - Hash de contraseña usando bcrypt
   * - Validar requisitos de fortaleza de contraseña
   */
  @ApiProperty({
    description: 'Contraseña (mínimo 8 caracteres)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
  })
  @IsString()
  full_name: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+34912345678',
    required: false,
  })
  @IsString()
  phone?: string;

  /**
   * Rol del usuario
   *
   * FALTA IMPLEMENTAR:
   * - Validar que el rol sea uno de los roles permitidos
   * - Implementar permisos basados en roles
   */
  @ApiProperty({
    description: 'Rol del usuario',
    example: 'CUSTOMER',
    enum: ['ADMIN', 'RESTAURANT_OWNER', 'STAFF', 'CUSTOMER'],
  })
  @IsEnum(['ADMIN', 'RESTAURANT_OWNER', 'STAFF', 'CUSTOMER'])
  role: string;
}
