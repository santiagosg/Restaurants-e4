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
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';
import {
  CategoryResponseDto,
  CategoryWithProductsDto,
} from './dto/category-response.dto';
import { CategoryFiltersDto, CategoriesQueryDto } from './dto/categories-query.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../../../common/dto/base-response.dto';

@ApiTags('Menu Categories')
@Controller('menu-categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categoría creada exitosamente',
    type: BaseResponseDto,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<BaseResponseDto<CategoryResponseDto>> {
    const data = await this.categoriesService.create(createCategoryDto);
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
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de categorías',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: CategoriesQueryDto,
    @Query() filters: CategoryFiltersDto,
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const result = await this.categoriesService.findAll(query, filters);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría encontrada',
    type: BaseResponseDto,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<CategoryResponseDto>> {
    const data = await this.categoriesService.findOne(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Obtener una categoría con sus productos' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría con productos',
    type: BaseResponseDto,
  })
  async findOneWithProducts(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<CategoryWithProductsDto>> {
    const data = await this.categoriesService.findOneWithProducts(id);
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
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría actualizada',
    type: BaseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<BaseResponseDto<CategoryResponseDto>> {
    const data = await this.categoriesService.update(id, updateCategoryDto);
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
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Categoría eliminada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoriesService.remove(id);
  }
}
