import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
} from './dto';
import { RestaurantResponseDto, RestaurantWithHoursDto } from './dto/restaurant-response.dto';
import { RestaurantFiltersDto, RestaurantsQueryDto } from './dto/restaurants-query.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo restaurante
   */
  async create(dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.prisma.restaurant.create({
        data: {
          owner_id: dto.owner_id,
          name: dto.name,
          description: dto.description,
          cuisine_type: dto.cuisine_type,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          zip_code: dto.zip_code,
          phone: dto.phone,
          email: dto.email,
          website: dto.website,
          logo_url: dto.logo_url,
          cover_image_url: dto.cover_image_url,
        },
      });

      return this.mapToResponseDto(restaurant);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un restaurante con ese nombre para este dueño');
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los restaurantes con paginación y filtros
   */
  async findAll(query: RestaurantsQueryDto, filters: RestaurantFiltersDto): Promise<{
    data: RestaurantResponseDto[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const { page = 1, per_page = 20, q, sort_by, sort_order } = query;
    const { owner_id, city, cuisine_type, is_active, created_from, created_to, ids } = filters;

    const skip = (page - 1) * per_page;

    const where: any = {};

    if (owner_id) {
      where.owner_id = owner_id;
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (cuisine_type) {
      where.cuisine_type = cuisine_type;
    }
    if (is_active !== undefined) {
      where.is_active = is_active;
    }
    if (ids) {
      where.id = { in: ids };
    }
    if (created_from || created_to) {
      where.created_at = {};
      if (created_from) {
        where.created_at.gte = new Date(created_from);
      }
      if (created_to) {
        where.created_at.lte = new Date(created_to);
      }
    }

    const [restaurants, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take: per_page,
        orderBy: sort_by ? { [sort_by]: sort_order } : undefined,
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    const totalPages = Math.ceil(total / per_page);

    return {
      data: restaurants.map(r => this.mapToResponseDto(r)),
      pagination: {
        page,
        per_page,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Obtiene un restaurante por ID
   */
  async findOne(id: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurante con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(restaurant);
  }

  /**
   * Obtiene un restaurante con sus horarios
   */
  async findOneWithHours(id: string): Promise<RestaurantWithHoursDto> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        restaurant_hours: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurante con ID ${id} no encontrado`);
    }

    const totalReviews = restaurant._count?.reviews || 0;

    return this.mapToResponseDtoWithHours(restaurant, restaurant.restaurant_hours || []);
  }

  /**
   * Actualiza un restaurante existente
   */
  async update(id: string, dto: UpdateRestaurantDto): Promise<RestaurantResponseDto> {
    try {
      const restaurant = await this.prisma.restaurant.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          cuisine_type: dto.cuisine_type,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          zip_code: dto.zip_code,
          phone: dto.phone,
          email: dto.email,
          website: dto.website,
          logo_url: dto.logo_url,
          cover_image_url: dto.cover_image_url,
        },
      });

      return this.mapToResponseDto(restaurant);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un restaurante con ese nombre para este dueño');
      }
      throw error;
    }
  }

  /**
   * Elimina un restaurante
   */
  async remove(id: string): Promise<void> {
    await this.prisma.restaurant.delete({
      where: { id },
    });
  }

  /**
   * Actualiza el rating promedio de un restaurante
   */
  async updateRating(id: string): Promise<RestaurantResponseDto> {
    const reviews = await this.prisma.review.findMany({
      where: { restaurant_id: id },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const sumRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const average = totalReviews > 0 ? sumRating / totalReviews : 0;

    await this.prisma.restaurant.update({
      where: { id },
      data: {
        average_rating: average,
        total_reviews: totalReviews,
      },
    });

    return this.findOne(id);
  }

  /**
   * Mapea entidad de Restaurant a DTO
   */
  private mapToResponseDto(restaurant: any): RestaurantResponseDto {
    return {
      id: restaurant.id,
      owner_id: restaurant.owner_id,
      name: restaurant.name,
      description: restaurant.description,
      cuisine_type: restaurant.cuisine_type,
      address: restaurant.address,
      city: restaurant.city,
      country: restaurant.country,
      zip_code: restaurant.zip_code,
      phone: restaurant.phone,
      email: restaurant.email,
      website: restaurant.website,
      logo_url: restaurant.logo_url,
      cover_image_url: restaurant.cover_image_url,
      average_rating: restaurant.average_rating,
      total_reviews: restaurant.total_reviews,
      is_active: restaurant.is_active,
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at,
    };
  }

  /**
   * Mapea entidad de Restaurant a DTO con horas
   */
  private mapToResponseDtoWithHours(restaurant: any, hours: any[]): RestaurantWithHoursDto {
    return {
      ...this.mapToResponseDto(restaurant),
      hours,
    };
  }
}
