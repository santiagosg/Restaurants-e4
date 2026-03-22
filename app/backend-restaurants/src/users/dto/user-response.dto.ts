import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de usuario
 *
 * FALTA IMPLEMENTAR:
 * - Excluir campos sensibles (password_hash) de la respuesta
 * - Incluir solo campos permitidos según el rol del solicitante
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
  })
  full_name: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+34912345678',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'CUSTOMER',
    enum: ['ADMIN', 'RESTAURANT_OWNER', 'STAFF', 'CUSTOMER'],
  })
  role: string;

  @ApiProperty({
    description: 'Estado de la cuenta',
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
