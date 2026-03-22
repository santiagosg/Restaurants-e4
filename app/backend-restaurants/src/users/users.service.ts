import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
} from './dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { Role } from '../roles/dto/role-response.dto';

/**
 * Servicio de usuarios
 *
 * FALTA IMPLEMENTAR:
 * - Lógica de hashing de contraseñas usando bcrypt
 * - Validación de unicidad de email
 * - Validación de requisitos de contraseña
 * - Actualización de contraseñas (changePassword)
 * - Recuperación de contraseña
 * - Verificación de email
 * - Desactivación de cuentas
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo usuario
   *
   * FALTA IMPLEMENTAR:
   * - Verificar que el email no esté registrado
   * - Hacer hash de la contraseña usando bcrypt
   * - Validar requisitos de contraseña
   * - Enviar email de verificación
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // TODO: Implementar hash de contraseña con bcrypt
    // const salt = await bcrypt.genSalt(10);
    // const password_hash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: 'TODO: hash with bcrypt', // TODO: Implementar hash
        full_name: dto.full_name,
        phone: dto.phone,
        role: dto.role as Role,
      },
    });
    return this.mapToResponseDto(user);
  }

  /**
   * Obtiene todos los usuarios con paginación
   *
   * FALTA IMPLEMENTAR:
   * - Aplicar filtros por rol
   * - Aplicar filtros por estado
   * - Buscar por nombre o email
   */
  async findAll(query: UsersQueryDto): Promise<{
    data: UserResponseDto[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const { page = 1, per_page = 20 } = query;
    const skip = (page - 1) * per_page;

    const total = await this.prisma.user.count();
    const users = await this.prisma.user.findMany({
      skip,
      take: per_page,
    });

    const total_pages = Math.ceil(total / per_page);

    return {
      data: users.map(u => this.mapToResponseDto(u)),
      pagination: {
        page,
        per_page,
        total,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Obtiene un usuario por ID
   *
   * FALTA IMPLEMENTAR:
   * - Verificar permisos del solicitante
   * - Excluir password_hash de la respuesta
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(user);
  }

  /**
   * Obtiene un usuario por email
   *
   * FALTA IMPLEMENTAR:
   * - Usar para autenticación (login)
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.mapToResponseDto(user);
  }

  /**
   * Actualiza un usuario
   *
   * FALTA IMPLEMENTAR:
   * - Si se actualiza email, verificar que no esté en uso
   * - Si se actualiza contraseña, hacer hash de la nueva
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...dto,
          role: dto.role ? (dto.role as Role) : undefined,
          // TODO: Si incluye password, hacer hash
        },
      });
      return this.mapToResponseDto(user);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  /**
   * Elimina un usuario
   *
   * FALTA IMPLEMENTAR:
   * - Verificar que el usuario tenga permiso
   * - Soft delete o hard delete según requerimientos
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   *
   * FALTA IMPLEMENTAR:
   * - Verificar que la contraseña actual sea correcta usando bcrypt.compare()
   * - Hacer hash de la nueva contraseña
   * - Invalidar tokens existentes si es necesario
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    // TODO: Implementar cambio de contraseña
    throw new Error('changePassword no implementado aún');
  }

  /**
   * Mapea un usuario a la respuesta DTO
   *
   * FALTA IMPLEMENTAR:
   * - Excluir password_hash de la respuesta
   */
  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
