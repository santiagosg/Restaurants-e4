import {
  Controller,
  Get,
  Query,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { RoleResponseDto } from './dto/role-response.dto';
import { RolesQueryDto } from './dto/roles-query.dto';
import { BaseResponseDto } from '../common/dto/base-response.dto';

/**
 * Controlador de roles
 *
 * FALTA IMPLEMENTAR:
 * - Guards de autenticación para proteger endpoints
 * - Guards de roles para restringir acceso administrativo
 * - Endpoint para crear roles personalizados (solo ADMIN)
 * - Endpoint para asignar permisos a roles (solo ADMIN)
 * - Endpoint para actualizar roles (solo ADMIN)
 * - Endpoint para eliminar roles (solo ADMIN)
 */
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de roles',
    type: BaseResponseDto,
  })
  async findAll(
    @Query() query: RolesQueryDto,
  ): Promise<BaseResponseDto<RoleResponseDto[]>> {
    const result = await this.rolesService.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get(':role')
  @ApiOperation({ summary: 'Obtener un rol por nombre' })
  @ApiParam({ name: 'role', description: 'Nombre del rol', enum: ['ADMIN', 'RESTAURANT_OWNER', 'STAFF', 'CUSTOMER'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rol encontrado',
    type: BaseResponseDto,
  })
  async findOne(
    @Param('role') role: string,
  ): Promise<BaseResponseDto<RoleResponseDto>> {
    const data = await this.rolesService.findOne(role as any);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  /**
   * Endpoint para obtener permisos de un rol
   *
   * FALTA IMPLEMENTAR:
   * - Guard de autenticación
   * - Filtros por usuario para incluir permisos personalizados
   */
  // @Get(':role/permissions')
  // @ApiOperation({ summary: 'Obtener permisos de un rol' })
  // async getPermissions(@Param('role') role: string): Promise<BaseResponseDto<string[]>> {
  //   const data = await this.rolesService.getPermissions(role as any);
  //   return {
  //     success: true,
  //     data,
  //   };
  // }
}
