import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de rol
 *
 * FALTA IMPLEMENTAR:
 * - Sistema de permisos granulares basado en roles
 * - Definición de permisos por cada rol
 * - Jerarquía de roles si es necesaria
 */
export enum Role {
  ADMIN = 'ADMIN',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMIN',
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Administrador del sistema con acceso total',
  })
  description: string;

  @ApiProperty({
    description: 'Permisos asociados al rol',
    type: 'array',
    isArray: true,
    example: ['users:read', 'users:write', 'restaurants:read', 'restaurants:write'],
  })
  permissions: string[];

  @ApiProperty({
    description: 'Jerarquía del rol (mayor valor = más privilegios)',
    example: 100,
  })
  level: number;
}

/**
 * Constantes de permisos
 *
 * FALTA IMPLEMENTAR:
 * - Definir todos los permisos necesarios para cada recurso
 * - Agrupar permisos por recurso (users, restaurants, menu, bookings, reviews)
 * - Documentar qué rol tiene qué permisos
 */
export const PERMISSIONS = {
  // Users
  USER_READ: 'users:read',
  USER_WRITE: 'users:write',
  USER_DELETE: 'users:delete',

  // Restaurants
  RESTAURANT_READ: 'restaurants:read',
  RESTAURANT_WRITE: 'restaurants:write',
  RESTAURANT_DELETE: 'restaurants:delete',

  // Menu
  MENU_READ: 'menu:read',
  MENU_WRITE: 'menu:write',
  MENU_DELETE: 'menu:delete',

  // Bookings
  BOOKING_READ: 'bookings:read',
  BOOKING_WRITE: 'bookings:write',
  BOOKING_DELETE: 'bookings:delete',

  // Reviews
  REVIEW_READ: 'reviews:read',
  REVIEW_WRITE: 'reviews:write',
  REVIEW_DELETE: 'reviews:delete',
} as const;
