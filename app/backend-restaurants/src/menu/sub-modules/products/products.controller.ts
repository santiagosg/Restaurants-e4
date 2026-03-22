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
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from './dto';
import {
  ProductResponseDto,
  ProductWithCategoryDto,
} from './dto/product-response.dto';
import { ProductsFiltersDto, ProductsQueryDto } from './dto/products-query.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../../../common/dto/base-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Producto creado exitosamente',
    type: BaseResponseDto,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<BaseResponseDto<ProductResponseDto>> {
    const data = await this.productsService.create(createProductDto);
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
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de productos',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: ProductsQueryDto,
    @Query() filters: ProductsFiltersDto,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const result = await this.productsService.findAll(query, filters);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Obtener el menú completo de un restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Menú del restaurante',
    type: BaseResponseDto,
  })
  async getRestaurantMenu(
    @Param('restaurantId') restaurantId: string,
  ): Promise<BaseResponseDto<ProductWithCategoryDto[]>> {
    const result = await this.productsService.getRestaurantMenu(restaurantId);
    return {
      success: true,
      data: result.data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado',
    type: BaseResponseDto,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ProductResponseDto>> {
    const data = await this.productsService.findOne(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get(':id/category')
  @ApiOperation({ summary: 'Obtener un producto con su categoría' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto con categoría',
    type: BaseResponseDto,
  })
  async findOneWithCategory(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ProductWithCategoryDto>> {
    const data = await this.productsService.findOneWithCategory(id);
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
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado',
    type: BaseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<BaseResponseDto<ProductResponseDto>> {
    const data = await this.productsService.update(id, updateProductDto);
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
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Producto eliminado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}
