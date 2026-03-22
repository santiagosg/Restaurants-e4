import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from './dto';
import {
  ProductResponseDto,
  ProductWithCategoryDto,
} from './dto/product-response.dto';
import { ProductsFiltersDto, ProductsQueryDto } from './dto/products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo producto
   */
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.prisma.product.create({
      data: {
        restaurant_id: dto.restaurant_id,
        category_id: dto.category_id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'USD',
        image_url: dto.image_url,
        is_available: dto.is_available !== undefined ? dto.is_available : true,
        preparation_time: dto.preparation_time,
        calories: dto.calories,
        is_vegetarian: dto.is_vegetarian || false,
        is_vegan: dto.is_vegan || false,
        is_gluten_free: dto.is_gluten_free || false,
      },
    });
    return this.mapToResponseDto(product);
  }

  /**
   * Obtiene todos los productos con paginación y filtros
   */
  async findAll(query: ProductsQueryDto, filters: ProductsFiltersDto): Promise<{
    data: ProductResponseDto[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const { page = 1, per_page = 20, q } = query;
    const {
      restaurant_id,
      category_id,
      is_available,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
      min_price,
      max_price,
      created_from,
      created_to,
      ids,
      sort_by = 'created_at',
      sort_order = 'asc',
    } = filters;

    const skip = (page - 1) * per_page;
    const where: any = {};

    // Filtro por búsqueda general
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (category_id) where.category_id = category_id;
    if (is_available !== undefined) where.is_available = is_available;
    if (is_vegetarian !== undefined) where.is_vegetarian = is_vegetarian;
    if (is_vegan !== undefined) where.is_vegan = is_vegan;
    if (is_gluten_free !== undefined) where.is_gluten_free = is_gluten_free;

    // Filtro por rango de precio
    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) where.price.gte = min_price;
      if (max_price !== undefined) where.price.lte = max_price;
    }

    // Filtro por fecha
    if (created_from || created_to) {
      where.created_at = {};
      if (created_from) where.created_at.gte = created_from;
      if (created_to) where.created_at.lte = created_to;
    }

    // Filtro por IDs
    if (ids) {
      where.id = { in: ids };
    }

    // Ordenamiento
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // Contar total
    const total = await this.prisma.product.count({ where });

    // Obtener resultados
    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: per_page,
      orderBy,
    });

    const total_pages = Math.ceil(total / per_page);

    return {
      data: products.map(p => this.mapToResponseDto(p)),
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
   * Obtiene un producto por ID
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(product);
  }

  /**
   * Obtiene un producto por ID con su categoría
   */
  async findOneWithCategory(id: string): Promise<ProductWithCategoryDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return {
      ...this.mapToResponseDto(product),
      category: product.category,
    };
  }

  /**
   * Actualiza un producto
   */
  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: dto,
      });
      return this.mapToResponseDto(product);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  /**
   * Elimina un producto
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  /**
   * Obtiene el menú completo de un restaurante
   */
  async getRestaurantMenu(restaurantId: string): Promise<{
    data: ProductWithCategoryDto[];
  }> {
    const products = await this.prisma.product.findMany({
      where: {
        restaurant_id: restaurantId,
        is_available: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        category: {
          display_order: 'asc',
        },
      },
    });

    return {
      data: products.map(p => ({
        ...this.mapToResponseDto(p),
        category: p.category,
      })),
    };
  }

  /**
   * Mapea un producto a la respuesta DTO
   */
  private mapToResponseDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      restaurant_id: product.restaurant_id,
      category_id: product.category_id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      currency: product.currency,
      image_url: product.image_url,
      is_available: product.is_available,
      preparation_time: product.preparation_time,
      calories: product.calories,
      is_vegetarian: product.is_vegetarian,
      is_vegan: product.is_vegan,
      is_gluten_free: product.is_gluten_free,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }
}
