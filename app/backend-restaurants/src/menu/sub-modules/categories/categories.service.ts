import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';
import {
  CategoryResponseDto,
  CategoryWithProductsDto,
} from './dto/category-response.dto';
import { CategoryFiltersDto, CategoriesQueryDto } from './dto/categories-query.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva categoría
   */
  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.prisma.menuCategory.create({
      data: {
        restaurant_id: dto.restaurant_id,
        name: dto.name,
        description: dto.description,
        display_order: dto.display_order,
        is_active: dto.is_active !== undefined ? dto.is_active : true,
      },
    });
    return this.mapToResponseDto(category);
  }

  /**
   * Obtiene todas las categorías con paginación y filtros
   */
  async findAll(query: CategoriesQueryDto, filters: CategoryFiltersDto): Promise<{
    data: CategoryResponseDto[];
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
    const { restaurant_id, is_active, ids, sort_by = 'display_order', sort_order = 'asc' } = filters;

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
    if (is_active !== undefined) where.is_active = is_active;

    // Filtro por IDs
    if (ids) {
      where.id = { in: ids };
    }

    // Ordenamiento
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // Contar total
    const total = await this.prisma.menuCategory.count({ where });

    // Obtener resultados
    const categories = await this.prisma.menuCategory.findMany({
      where,
      skip,
      take: per_page,
      orderBy,
    });

    const total_pages = Math.ceil(total / per_page);

    return {
      data: categories.map(c => this.mapToResponseDto(c)),
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
   * Obtiene una categoría por ID
   */
  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(category);
  }

  /**
   * Obtiene una categoría por ID con sus productos
   */
  async findOneWithProducts(id: string): Promise<CategoryWithProductsDto> {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
      include: {
        products: {
          where: { is_available: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return {
      ...this.mapToResponseDto(category),
      products: category.products,
    };
  }

  /**
   * Actualiza una categoría
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    try {
      const category = await this.prisma.menuCategory.update({
        where: { id },
        data: dto,
      });
      return this.mapToResponseDto(category);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Elimina una categoría
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.menuCategory.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Mapea una categoría a la respuesta DTO
   */
  private mapToResponseDto(category: any): CategoryResponseDto {
    return {
      id: category.id,
      restaurant_id: category.restaurant_id,
      name: category.name,
      description: category.description,
      display_order: category.display_order,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }
}
