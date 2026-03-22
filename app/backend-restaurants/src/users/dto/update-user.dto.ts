import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO para actualizar un usuario
 *
 * FALTA IMPLEMENTAR:
 * - Validar que al menos un campo sea proporcionado
 * - Si se actualiza email, verificar que no esté en uso
 * - Si se actualiza contraseña, hacer hash de la nueva contraseña
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
