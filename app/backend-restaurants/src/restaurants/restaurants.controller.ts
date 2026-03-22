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
  ApiQuery,
} from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from './dto';
import {
  RestaurantResponseDto,
  RestaurantWithHoursDto,
} from './dto/restaurant-response.dto';
import { RestaurantFiltersDto, RestaurantsQueryDto } from './dto/restaurants-query.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../common/dto/base-response.dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo restaurante' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Restaurante creado exitosamente',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El propietario ya tiene un restaurante con ese nombre',
  })
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
  ): Promise<BaseResponseDto<RestaurantResponseDto>> {
    const data = await this.restaurantsService.create(createRestaurantDto);
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
  @ApiOperation({ summary: 'Obtener todos los restaurantes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de restaurantes',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: RestaurantsQueryDto,
    @Query() filters: RestaurantFiltersDto,
  ): Promise<PaginatedResponseDto<RestaurantResponseDto>> {
    const result = await this.restaurantsService.findAll(query, filters);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un restaurante por ID' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restaurante encontrado',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<RestaurantResponseDto>> {
    const data = await this.restaurantsService.findOne(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get(':id/hours')
  @ApiOperation({ summary: 'Obtener un restaurante con sus horarios' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restaurante con horarios',
    type: BaseResponseDto,
  })
  async findOneWithHours(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<RestaurantWithHoursDto>> {
    const data = await this.restaurantsService.findOneWithHours(id);
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
  @ApiOperation({ summary: 'Actualizar un restaurante' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restaurante actualizado',
    type: BaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<BaseResponseDto<RestaurantResponseDto>> {
    const data = await this.restaurantsService.update(id, updateRestaurantDto);
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
  @ApiOperation({ summary: 'Eliminar un restaurante' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Restaurante eliminado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurante no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.restaurantsService.remove(id);
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Actualizar el rating promedio de un restaurante' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rating actualizado',
    type: BaseResponseDto,
  })
  async updateRating(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<RestaurantResponseDto>> {
    const data = await this.restaurantsService.updateRating(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }
}
