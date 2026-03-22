import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para cambiar la contraseña de un usuario
 *
 * FALTA IMPLEMENTAR:
 * - Validar que la contraseña actual sea correcta
 * - Hash de la nueva contraseña usando bcrypt
 * - Guardar hash de la nueva contraseña en la base de datos
 * - Invalidar tokens existentes si es necesario
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'OldPass123!',
  })
  @IsString()
  @MinLength(8)
  current_password: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'NewSecurePass456!',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
  new_password: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña',
    example: 'NewSecurePass456!',
  })
  @IsString()
  confirm_password: string;
}
