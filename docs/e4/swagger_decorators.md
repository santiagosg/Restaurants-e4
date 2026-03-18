# Decoradores Swagger - Sistema de Restaurantes

## 1. Configuración Global de Swagger

**Archivo:** `src/main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Restaurants API')
    .setDescription('API para la gestión de restaurantes, reservas, pedidos y pagos')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa el token JWT (Bearer {token})',
        in: 'header',
      },
      'JWT', // Nombre del esquema de autenticación
    )
    .addTag('Authentication', 'Gestión de autenticación y usuarios')
    .addTag('Users', 'Gestión de perfiles de usuario')
    .addTag('Restaurants', 'Gestión de restaurantes')
    .addTag('Tables', 'Gestión de mesas')
    .addTag('Availability', 'Consulta de disponibilidad')
    .addTag('Menu Categories', 'Gestión de categorías de menú')
    .addTag('Products', 'Gestión de productos')
    .addTag('Reservations', 'Gestión de reservas')
    .addTag('Orders', 'Gestión de pedidos')
    .addTag('Payments', 'Gestión de pagos')
    .addTag('Reviews', 'Gestión de reseñas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Restaurants API Docs',
  });

  await app.listen(3000);
}
bootstrap();
```

---

## 2. DTOs de Respuesta Comunes

**Archivo:** `src/common/dto/swagger-response.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class BaseApiResponseDto<T> {
  @ApiProperty({ example: true, description: 'Indica si la operación fue exitosa' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ description: 'Datos de respuesta', nullable: true })
  data: T | null;

  @ApiPropertyOptional({
    description: 'Información de error si la operación falló',
    nullable: true,
  })
  error?: {
    code: string;
    message: string;
    details?: any;
  } | null;

  @ApiProperty({
    description: 'Metadatos de la solicitud',
    example: { timestamp: '2024-01-15T10:30:00Z', request_id: 'req_abc123' },
  })
  meta: {
    timestamp: string;
    request_id: string;
  };
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Número de página actual' })
  @IsNumber()
  page: number;

  @ApiProperty({ example: 20, description: 'Items por página' })
  @IsNumber()
  per_page: number;

  @ApiProperty({ example: 100, description: 'Total de items' })
  @IsNumber()
  total: number;

  @ApiProperty({ example: 5, description: 'Total de páginas' })
  @IsNumber()
  total_pages: number;

  @ApiProperty({ example: true, description: '¿Existe página siguiente?' })
  @IsBoolean()
  has_next: boolean;

  @ApiProperty({ example: false, description: '¿Existe página anterior?' })
  @IsBoolean()
  has_prev: boolean;
}

export class PaginatedApiResponseDto<T> {
  @ApiProperty({ description: 'Lista de datos paginada', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Metadatos de paginación', type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false, description: 'Indica si la operación fue exitosa' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ description: 'Datos de respuesta', nullable: true })
  data: null;

  @ApiProperty({
    description: 'Información del error',
    example: {
      code: 'VALIDATION_ERROR',
      message: 'Datos de solicitud inválidos',
      details: { email: 'Formato de email inválido' },
    },
  })
  error: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Metadatos de la solicitud',
    example: { timestamp: '2024-01-15T10:30:00Z', request_id: 'req_abc123' },
  })
  meta: {
    timestamp: string;
    request_id: string;
  };
}
```

---

## 3. Decoradores AuthController

**Archivo:** `src/auth/auth.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y retorna un token de acceso JWT',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        summary: 'Ejemplo de login',
        value: {
          email: 'user@example.com',
          password: 'secure_password123',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login exitoso',
    type: BaseApiResponseDto,
    example: {
      success: true,
      data: {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          full_name: 'John Doe',
          role: 'CUSTOMER',
        },
        tokens: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_in: 3600,
          token_type: 'Bearer',
        },
      },
      error: null,
      meta: { timestamp: '2024-01-15T10:30:00Z', request_id: 'req_abc123' },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales incorrectas',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Datos inválidos',
    type: ErrorResponseDto,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar usuario',
    description: 'Registra un nuevo usuario en el sistema',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        summary: 'Ejemplo de registro',
        value: {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          full_name: 'Jane Doe',
          phone: '+1234567890',
          role: 'CUSTOMER',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email ya registrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Datos inválidos',
    type: ErrorResponseDto,
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refrescar token',
    description: 'Renueva el token de acceso usando el refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      example1: {
        summary: 'Ejemplo de refresh',
        value: {
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token renovado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token inválido o expirado',
    type: ErrorResponseDto,
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida el token de acceso actual',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sesión cerrada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
```

---

## 4. Decoradores UsersController

**Archivo:** `src/users/users.controller.ts`

```typescript
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description: 'Retorna la información del usuario autenticado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil obtenido exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
    type: ErrorResponseDto,
  })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario',
    description: 'Actualiza la información del perfil del usuario autenticado',
  })
  @ApiBody({
    type: UpdateUserDto,
    required: false,
    examples: {
      example1: {
        summary: 'Actualizar nombre y teléfono',
        value: {
          full_name: 'John Updated Doe',
          phone: '+1987654321',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil actualizado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Post('me/change-password')
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Cambia la contraseña del usuario autenticado',
  })
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      example1: {
        summary: 'Cambiar contraseña',
        value: {
          current_password: 'SecurePass123!',
          new_password: 'NewSecurePass456!',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contraseña cambiada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Contraseña actual incorrecta',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }
}
```

---

## 5. Decoradores RestaurantsController

**Archivo:** `src/restaurants/restaurants.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  UpdateHoursDto,
  RestaurantsQueryDto,
} from './dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar restaurantes',
    description: 'Obtiene una lista paginada de restaurantes activos con filtros opcionales',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Items por página (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Búsqueda por nombre o descripción',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filtrar por ciudad',
  })
  @ApiQuery({
    name: 'cuisine_type',
    required: false,
    type: String,
    description: 'Tipo de cocina',
  })
  @ApiQuery({
    name: 'min_rating',
    required: false,
    type: Number,
    description: 'Calificación mínima (1-5)',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    type: String,
    description: 'Campo de ordenamiento',
    enum: ['created_at', 'name', 'average_rating'],
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    type: String,
    description: 'Orden: asc o desc',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de restaurantes obtenida exitosamente',
    type: PaginatedApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
    type: ErrorResponseDto,
  })
  findAll(@Query() query: RestaurantsQueryDto) {
    return this.restaurantsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener restaurante por ID',
    description: 'Retorna los detalles completos de un restaurante específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del restaurante',
    type: String,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restaurante obtenido exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Crear restaurante',
    description: 'Crea un nuevo restaurante (solo propietarios)',
  })
  @ApiBody({
    type: CreateRestaurantDto,
    examples: {
      example1: {
        summary: 'Crear restaurante',
        value: {
          name: 'Nuevo Restaurante',
          description: 'Descripción del restaurante',
          cuisine_type: 'Mexican',
          address: '456 Avenida Nueva',
          city: 'Barcelona',
          country: 'España',
          zip_code: '08001',
          phone: '+34987654321',
          email: 'contacto@nuevo.com',
          website: 'https://www.nuevo.com',
          logo_url: 'https://cdn.example.com/logos/nuevo.png',
          cover_image_url: 'https://cdn.example.com/covers/nuevo.jpg',
          hours: [
            {
              day_of_week: 0,
              open_time: '12:00',
              close_time: '23:00',
              is_closed: false,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Restaurante creado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuario sin permisos de propietario',
    type: ErrorResponseDto,
  })
  create(@Request() req, @Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(req.user.id, createRestaurantDto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Actualizar restaurante',
    description: 'Actualiza información de un restaurante existente (solo propietario)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiBody({
    type: UpdateRestaurantDto,
    required: false,
    examples: {
      example1: {
        summary: 'Actualizar restaurante',
        value: {
          name: 'Restaurante Actualizado',
          description: 'Nueva descripción',
          phone: '+34999999999',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restaurante actualizado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No eres propietario del restaurante',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, req.user.id, updateRestaurantDto);
  }

  @Put(':id/hours')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Actualizar horarios del restaurante',
    description: 'Actualiza los horarios de apertura y cierre',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiBody({
    type: UpdateHoursDto,
    examples: {
      example1: {
        summary: 'Actualizar horarios',
        value: {
          hours: [
            { day_of_week: 0, open_time: '12:00', close_time: '23:00', is_closed: false },
            { day_of_week: 6, open_time: null, close_time: null, is_closed: true },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Horarios actualizados exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No eres propietario del restaurante',
    type: ErrorResponseDto,
  })
  updateHours(
    @Param('id') id: string,
    @Request() req,
    @Body() updateHoursDto: UpdateHoursDto,
  ) {
    return this.restaurantsService.updateHours(id, req.user.id, updateHoursDto);
  }
}
```

---

## 6. Decoradores TablesController

**Archivo:** `src/restaurants/sub-modules/tables/tables.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, TablesQueryDto } from './dto';

@ApiTags('Tables')
@Controller('restaurants/:restaurantId/tables')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar mesas de un restaurante',
    description: 'Obtiene todas las mesas activas de un restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'min_capacity',
    required: false,
    type: Number,
    description: 'Capacidad mínima',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Ubicación de la mesa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mesas obtenida exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  findAll(@Param('restaurantId') restaurantId: string, @Query() query: TablesQueryDto) {
    return this.tablesService.findAll(restaurantId, request.user, query);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear mesa',
    description: 'Crea una nueva mesa en el restaurante (solo propietario)',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiBody({
    type: CreateTableDto,
    examples: {
      example1: {
        summary: 'Crear mesa',
        value: {
          table_number: 3,
          capacity: 6,
          location: 'VIP',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mesa creada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Número de mesa ya existe',
    type: ErrorResponseDto,
  })
  create(@Param('restaurantId') restaurantId: string, @Request() req, @Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(restaurantId, req.user.id, createTableDto);
  }

  @Patch(':tableId')
  @ApiOperation({
    summary: 'Actualizar mesa',
    description: 'Actualiza información de una mesa existente',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'tableId',
    description: 'ID de la mesa',
    type: String,
  })
  @ApiBody({
    type: UpdateTableDto,
    required: false,
    examples: {
      example1: {
        summary: 'Actualizar mesa',
        value: {
          capacity: 8,
          location: 'Interior VIP',
          is_active: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mesa actualizada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mesa no encontrada',
    type: ErrorResponseDto,
  })
  update(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Request() req,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.update(restaurantId, tableId, req.user.id, updateTableDto);
  }

  @Delete(':tableId')
  @ApiOperation({
    summary: 'Eliminar mesa',
    description: 'Elimina una mesa del restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'tableId',
    description: 'ID de la mesa',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Mesa eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Mesa no encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'La mesa tiene reservas activas',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Request() req,
  ) {
    return this.tablesService.delete(restaurantId, tableId, req.user.id);
  }
}
```

---

## 7. Decoradores AvailabilityController

**Archivo:** `src/restaurants/sub-modules/availability/availability.controller.ts`

```typescript
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { AvailabilityService } from './availability.service';
import { CheckAvailabilityDto } from './dto';

@ApiTags('Availability')
@Controller('restaurants/:restaurantId/availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar disponibilidad de mesas',
    description: 'Consulta la disponibilidad de mesas para una fecha y hora específicas',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Fecha de la consulta (YYYY-MM-DD)',
    example: '2024-02-20',
  })
  @ApiQuery({
    name: 'time',
    required: true,
    type: String,
    description: 'Hora de la consulta (HH:mm)',
    example: '19:30',
  })
  @ApiQuery({
    name: 'party_size',
    required: true,
    type: Number,
    description: 'Número de personas',
    example: 4,
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Ubicación de la mesa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Disponibilidad consultada exitosamente',
    type: BaseApiResponseDto,
    example: {
      success: true,
      data: {
        restaurant_id: '770e8400-e29b-41d4-a716-446655440002',
        date: '2024-02-20',
        time: '19:30',
        party_size: 4,
        is_available: true,
        available_tables: [
          {
            id: '990e8400-e29b-41d4-a716-446655440001',
            table_number: 1,
            capacity: 4,
            location: 'Interior',
          },
        ],
        suggested_times: ['19:00', '19:15', '19:30', '19:45', '20:00'],
      },
      error: null,
      meta: { timestamp: '2024-01-15T21:30:00Z', request_id: 'req_abc123' },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  checkAvailability(@Param('restaurantId') restaurantId: string, @Query() dto: CheckAvailabilityDto) {
    return this.availabilityService.check(restaurantId, dto);
  }
}
```

---

## 8. Decoradores CategoriesController

**Archivo:** `src/menu/sub-modules/categories/categories.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoriesQueryDto } from './dto';

@ApiTags('Menu Categories')
@Controller('restaurants/:restaurantId/menu/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar categorías',
    description: 'Obtiene todas las categorías del menú de un restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de categorías obtenida exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  findAll(@Param('restaurantId') restaurantId: string, @Query() query: CategoriesQueryDto) {
    return this.categoriesService.findAll(restaurantId, request.user, query);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear categoría',
    description: 'Crea una nueva categoría de menú (solo propietario)',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      example1: {
        summary: 'Crear categoría',
        value: {
          name: 'Postres',
          description: 'Dulces finales',
          display_order: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categoría creada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No eres propietario del restaurante',
    type: ErrorResponseDto,
  })
  create(@Param('restaurantId') restaurantId: string, @Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(restaurantId, req.user.id, createCategoryDto);
  }

  @Patch(':categoryId')
  @ApiOperation({
    summary: 'Actualizar categoría',
    description: 'Actualiza una categoría de menú existente',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID de la categoría',
    type: String,
  })
  @ApiBody({
    type: UpdateCategoryDto,
    required: false,
    examples: {
      example1: {
        summary: 'Actualizar categoría',
        value: {
          name: 'Postres Especiales',
          display_order: 4,
          is_active: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría actualizada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoría no encontrada',
    type: ErrorResponseDto,
  })
  update(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
    @Request() req,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(restaurantId, categoryId, req.user.id, updateCategoryDto);
  }

  @Delete(':categoryId')
  @ApiOperation({
    summary: 'Eliminar categoría',
    description: 'Elimina una categoría de menú',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'ID de la categoría',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Categoría eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoría no encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'La categoría tiene productos asociados',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
    @Request() req,
  ) {
    return this.categoriesService.delete(restaurantId, categoryId, req.user.id);
  }
}
```

---

## 9. Decoradores ProductsController

**Archivo:** `src/menu/sub-modules/products/products.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductsQueryDto } from './dto';

@ApiTags('Products')
@Controller('restaurants/:restaurantId/menu/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar productos',
    description: 'Obtiene todos los productos del menú de un restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: String,
    description: 'Filtrar por categoría',
  })
  @ApiQuery({
    name: 'is_available',
    required: false,
    type: Boolean,
    description: 'Filtrar por disponibilidad',
  })
  @ApiQuery({
    name: 'is_vegetarian',
    required: false,
    type: Boolean,
    description: 'Productos vegetarianos',
  })
  @ApiQuery({
    name: 'is_vegan',
    required: false,
    type: Boolean,
    description: 'Productos veganos',
  })
  @ApiQuery({
    name: 'is_gluten_free',
    required: false,
    type: Boolean,
    description: 'Productos sin gluten',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Búsqueda por nombre/descripción',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Items por página',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de productos obtenida exitosamente',
    type: PaginatedApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  findAll(@Param('restaurantId') restaurantId: string, @Query() query: ProductsQueryDto) {
    return this.productsService.findAll(restaurantId, request.user, query);
  }

  @Get(':productId')
  @ApiOperation({
    summary: 'Obtener producto por ID',
    description: 'Retorna los detalles de un producto específico',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto obtenido exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
    type: ErrorResponseDto,
  })
  findOne(@Param('restaurantId') restaurantId: string, @Param('productId') productId: string) {
    return this.productsService.findById(restaurantId, productId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear producto',
    description: 'Crea un nuevo producto en el menú (solo propietario)',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      example1: {
        summary: 'Crear producto',
        value: {
          category_id: 'aa0e8400-e29b-41d4-a716-446655440001',
          name: 'Caprese',
          description: 'Queso mozzarella con tomate y albahaca',
          price: 9.50,
          currency: 'USD',
          image_url: 'https://cdn.example.com/products/caprese.jpg',
          is_available: true,
          preparation_time: 10,
          calories: 200,
          is_vegetarian: true,
          is_vegan: false,
          is_gluten_free: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Producto creado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoría no encontrada',
    type: ErrorResponseDto,
  })
  create(@Param('restaurantId') restaurantId: string, @Request() req, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(restaurantId, req.user.id, createProductDto);
  }

  @Patch(':productId')
  @ApiOperation({
    summary: 'Actualizar producto',
    description: 'Actualiza información de un producto existente',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    type: String,
  })
  @ApiBody({
    type: UpdateProductDto,
    required: false,
    examples: {
      example1: {
        summary: 'Actualizar producto',
        value: {
          name: 'Caprese Especial',
          price: 10.50,
          is_available: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
    type: ErrorResponseDto,
  })
  update(
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
    @Request() req,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(restaurantId, productId, req.user.id, updateProductDto);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Eliminar producto',
    description: 'Elimina un producto del menú',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El producto tiene pedidos asociados',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
    @Request() req,
  ) {
    return this.productsService.delete(restaurantId, productId, req.user.id);
  }
}
```

---

## 10. Decoradores ReservationsController

**Archivo:** `src/reservations/reservations.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto, ReservationsQueryDto } from './dto';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar reservas',
    description: 'Obtiene una lista paginada de reservas del usuario',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Items por página',
  })
  @ApiQuery({
    name: 'restaurant_id',
    required: false,
    type: String,
    description: 'Filtrar por restaurante',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Estado de la reserva',
    enum: ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'],
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Fecha fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reservas obtenida exitosamente',
    type: PaginatedApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  findAll(@Request() req, @Query() query: ReservationsQueryDto) {
    return this.reservationsService.findAll(req.user, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener reserva por ID',
    description: 'Retorna los detalles de una reserva específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la reserva',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva obtenida exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reserva no encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para ver esta reserva',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.reservationsService.findById(id, req.user);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear reserva',
    description: 'Crea una nueva reserva para el usuario autenticado',
  })
  @ApiBody({
    type: CreateReservationDto,
    examples: {
      example1: {
        summary: 'Crear reserva',
        value: {
          restaurant_id: '770e8400-e29b-41d4-a716-446655440002',
          party_size: 4,
          reservation_date: '2024-02-20',
          reservation_time: '19:30',
          special_requests: 'Cumpleaños - ventana favor',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reserva creada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mesas no disponibles para la fecha/hora',
    type: ErrorResponseDto,
  })
  create(@Request() req, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(req.user.id, createReservationDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar reserva',
    description: 'Actualiza información de una reserva existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la reserva',
    type: String,
  })
  @ApiBody({
    type: UpdateReservationDto,
    required: false,
    examples: {
      example1: {
        summary: 'Actualizar reserva',
        value: {
          party_size: 6,
          special_requests: 'Cumpleaños - ventana favor',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva actualizada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reserva no encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'No hay disponibilidad para la nueva fecha/hora',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Estado de reserva no permite modificaciones',
    type: ErrorResponseDto,
  })
  update(@Param('id') id: string, @Request() req, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(id, req.user, updateReservationDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar reserva',
    description: 'Cancela una reserva existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la reserva',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva cancelada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reserva no encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'La reserva ya está cancelada o completada',
    type: ErrorResponseDto,
  })
  cancel(@Param('id') id: string, @Request() req) {
    return this.reservationsService.cancel(id, req.user);
  }
}
```

---

## 11. Decoradores OrdersController

**Archivo:** `src/orders/orders.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrdersQueryDto } from './dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar pedidos',
    description: 'Obtiene una lista paginada de pedidos del usuario',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Items por página',
  })
  @ApiQuery({
    name: 'restaurant_id',
    required: false,
    type: String,
    description: 'Filtrar por restaurante',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Estado del pedido',
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'],
  })
  @ApiQuery({
    name: 'order_type',
    required: false,
    type: String,
    description: 'Tipo de pedido',
    enum: ['DINE_IN', 'TAKEOUT', 'DELIVERY'],
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Fecha de inicio',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Fecha fin',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pedidos obtenida exitosamente',
    type: PaginatedApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  findAll(@Request() req, @Query() query: OrdersQueryDto) {
    return this.ordersService.findAll(req.user, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener pedido por ID',
    description: 'Retorna los detalles de un pedido específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pedido',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pedido obtenido exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para ver este pedido',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findById(id, req.user);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear pedido',
    description: 'Crea un nuevo pedido para el usuario autenticado',
  })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      example1: {
        summary: 'Crear pedido',
        value: {
          restaurant_id: '770e8400-e29b-41d4-a716-446655440002',
          order_type: 'DINE_IN',
          items: [
            {
              product_id: 'bb0e8400-e29b-41d4-a716-446655440001',
              quantity: 2,
            },
            {
              product_id: 'bb0e8400-e29b-41d4-a716-446655440003',
              quantity: 1,
              special_instructions: 'Bien cocido',
            },
          ],
          notes: 'Sin cebolla en todo el pedido',
          reservation_id: 'cc0e8400-e29b-41d4-a716-446655440002',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pedido creado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos o productos no disponibles',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante o producto no encontrado',
    type: ErrorResponseDto,
  })
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Actualizar estado del pedido',
    description: 'Actualiza el estado de un pedido (solo propietario/staff)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pedido',
    type: String,
  })
  @ApiBody({
    type: UpdateOrderStatusDto,
    examples: {
      example1: {
        summary: 'Actualizar estado',
        value: { status: 'PREPARING' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del pedido actualizado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para modificar pedidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Transición de estado inválida',
    type: ErrorResponseDto,
  })
  updateStatus(@Param('id') id: string, @Request() req, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, req.user, updateStatusDto.status);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar pedido',
    description: 'Cancela un pedido existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pedido',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pedido cancelado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El pedido ya está cancelado o completado',
    type: ErrorResponseDto,
  })
  cancel(@Param('id') id: string, @Request() req) {
    return this.ordersService.cancel(id, req.user);
  }
}
```

---

## 12. Decoradores PaymentsController

**Archivo:** `src/payments/payments.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto, RefundPaymentDto } from './dto';

@ApiTags('Payments')
@Controller('orders/:orderId/payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener pagos de un pedido',
    description: 'Retorna todos los pagos asociados a un pedido',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID del pedido',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pagos obtenidos exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para ver estos pagos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido no encontrado',
    type: ErrorResponseDto,
  })
  findAll(@Param('orderId') orderId: string, @Request() req) {
    return this.paymentsService.findByOrderId(orderId, req.user);
  }

  @Post()
  @ApiOperation({
    summary: 'Procesar pago',
    description: 'Procesa un pago para un pedido existente',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID del pedido',
    type: String,
  })
  @ApiBody({
    type: CreatePaymentDto,
    examples: {
      example1: {
        summary: 'Pagar con tarjeta de crédito',
        value: {
          amount: 46.20,
          payment_method: 'CREDIT_CARD',
          payment_data: {
            card_number: '4111111111111111',
            card_expiry: '12/25',
            card_cvv: '123',
            card_holder: 'John Doe',
          },
        },
      },
      example2: {
        summary: 'Pagar en efectivo',
        value: {
          amount: 46.20,
          payment_method: 'CASH',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pago procesado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.PAYMENT_REQUIRED,
    description: 'Pago rechazado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Monto excede total del pedido',
    type: ErrorResponseDto,
  })
  create(@Param('orderId') orderId: string, @Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.process(orderId, req.user.id, createPaymentDto);
  }

  @Post(':paymentId/refund')
  @ApiOperation({
    summary: 'Reembolsar pago',
    description: 'Procesa un reembolso para un pago existente (solo propietario)',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID del pedido',
    type: String,
  })
  @ApiParam({
    name: 'paymentId',
    description: 'ID del pago',
    type: String,
  })
  @ApiBody({
    type: RefundPaymentDto,
    required: false,
    examples: {
      example1: {
        summary: 'Reembolso parcial',
        value: {
          amount: 23.10,
          reason: 'Parcial - cliente insatisfecho',
        },
      },
      example2: {
        summary: 'Reembolso completo',
        value: {
          amount: null,
          reason: 'Reembolso total por servicio incorrecto',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reembolso procesado exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permisos para reembolsar',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pago no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Monto a reembolsar excede disponible',
    type: ErrorResponseDto,
  })
  refund(@Param('paymentId') paymentId: string, @Request() req, @Body() refundPaymentDto: RefundPaymentDto) {
    return this.paymentsService.refund(paymentId, req.user.id, refundPaymentDto);
  }
}
```

---

## 13. Decoradores ReviewsController

**Archivo:** `src/reviews/reviews.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, ReviewsQueryDto } from './dto';

@ApiTags('Reviews')
@Controller('restaurants/:restaurantId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar reseñas',
    description: 'Obtiene todas las reseñas de un restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiQuery({
    name: 'min_rating',
    required: false,
    type: Number,
    description: 'Calificación mínima (1-5)',
  })
  @ApiQuery({
    name: 'max_rating',
    required: false,
    type: Number,
    description: 'Calificación máxima (1-5)',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    type: String,
    description: 'Campo de ordenamiento',
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    type: String,
    description: 'Orden: asc o desc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    description: 'Items por página',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reseñas obtenida exitosamente',
    type: PaginatedApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parámetros de consulta inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  findAll(@Param('restaurantId') restaurantId: string, @Query() query: ReviewsQueryDto) {
    return this.reviewsService.findByRestaurantId(restaurantId, query);
  }

  @Get(':reviewId')
  @ApiOperation({
    summary: 'Obtener reseña por ID',
    description: 'Retorna los detalles de una reseña específica',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'reviewId',
    description: 'ID de la reseña',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña obtenida exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reseña no encontrada',
    type: ErrorResponseDto,
  })
  findOne(@Param('reviewId') reviewId: string) {
    return this.reviewsService.findById(reviewId);
  }

  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Crear reseña',
    description: 'Crea una nueva reseña para el usuario autenticado',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiBody({
    type: CreateReviewDto,
    examples: {
      example1: {
        summary: 'Crear reseña',
        value: {
          order_id: 'dd0e8400-e29b-41d4-a716-446655440001',
          rating: 4,
          comment: 'Buena experiencia en general. La comida estuvo deliciosa aunque el servicio fue un poco lento.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reseña creada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una reseña para este pedido',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Rating debe estar entre 1 y 5',
    type: ErrorResponseDto,
  })
  create(@Param('restaurantId') restaurantId: string, @Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(restaurantId, req.user.id, createReviewDto);
  }

  @Patch(':reviewId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Actualizar reseña',
    description: 'Actualiza una reseña existente',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'reviewId',
    description: 'ID de la reseña',
    type: String,
  })
  @ApiBody({
    type: UpdateReviewDto,
    required: false,
    examples: {
      example1: {
        summary: 'Actualizar reseña',
        value: {
          rating: 5,
          comment: 'Excelente experiencia! La comida estuvo deliciosa y el servicio mejoró desde mi última visita.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña actualizada exitosamente',
    type: BaseApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de solicitud inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No eres el autor de esta reseña',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reseña no encontrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Rating debe estar entre 1 y 5',
    type: ErrorResponseDto,
  })
  update(@Param('reviewId') reviewId: string, @Request() req, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(reviewId, req.user.id, updateReviewDto);
  }

  @Delete(':reviewId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Eliminar reseña',
    description: 'Elimina una reseña existente',
  })
  @ApiParam({
    name: 'restaurantId',
    description: 'ID del restaurante',
    type: String,
  })
  @ApiParam({
    name: 'reviewId',
    description: 'ID de la reseña',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reseña eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No eres el autor de esta reseña',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reseña no encontrada',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('reviewId') reviewId: string, @Request() req) {
    return this.reviewsService.delete(reviewId, req.user.id);
  }
}
```

---

## 14. Resumen de Decoradores

### Decoradores Principales

| Decorador | Descripción | Ejemplo |
|-----------|-------------|---------|
| `@ApiTags('tag')` | Agrupa endpoints en Swagger UI | `@ApiTags('Restaurants')` |
| `@ApiOperation({})` | Documenta la operación del endpoint | `@ApiOperation({ summary: 'Crear' })` |
| `@ApiResponse({})` | Define respuesta HTTP | `@ApiResponse({ status: 200, type: BaseApiResponseDto })` |
| `@ApiBody({})` | Define el cuerpo de la solicitud | `@ApiBody({ type: CreateDto })` |
| `@ApiBearerAuth('name')` | Requiere autenticación Bearer | `@ApiBearerAuth('JWT')` |
| `@ApiParam({})` | Define parámetro de ruta | `@ApiParam({ name: 'id', type: String })` |
| `@ApiQuery({})` | Define parámetro de query | `@ApiQuery({ name: 'page', type: Number })` |
| `@ApiProperty({})` | Documenta propiedad en DTO | `@ApiProperty({ description: 'Nombre', example: 'Juan' })` |

### Configuración Global

```typescript
DocumentBuilder()
  .setTitle('Restaurants API')
  .setDescription('API para la gestión de restaurantes')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'JWT')
  .build();
```

---

*Documento versión 1.0 - Última actualización: 2026-03-18*
