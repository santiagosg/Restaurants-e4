import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
} from './dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../common/dto/base-response.dto';

/**
 * Controlador de usuarios
 *
 * FALTA IMPLEMENTAR:
 * - Guards de autenticación para proteger endpoints
 * - Guards de roles para controlar acceso por rol
 * - Decorador @CurrentUser para obtener usuario autenticado
 * - Endpoint GET /me para obtener perfil del usuario actual
 * - Endpoint PATCH /me para actualizar perfil del usuario actual
 * - Endpoint POST /change-password para cambiar contraseña
 * - Validación de permisos para operaciones administrativas
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado exitosamente',
    type: BaseResponseDto,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const data = await this.usersService.create(createUserDto);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuarios',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: UsersQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const result = await this.usersService.findAll(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario encontrado',
    type: BaseResponseDto,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const data = await this.usersService.findOne(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario actualizado',
    type: BaseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const data = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Usuario eliminado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  /**
   * Endpoint para obtener el perfil del usuario autenticado
   *
   * FALTA IMPLEMENTAR:
   * - Guard de autenticación
   * - Decorador @CurrentUser para obtener el usuario del token
   */
  // @Get('me')
  // @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  // async getMe(@CurrentUser() user: any): Promise<BaseResponseDto<UserResponseDto>> {
  //   return {
  //     success: true,
  //     data: this.usersService.mapToResponseDto(user),
  //   };
  // }
}
