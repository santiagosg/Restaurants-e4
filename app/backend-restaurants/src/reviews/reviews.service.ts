import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
} from './dto';
import {
  ReviewResponseDto,
  ReviewWithDetailsDto,
} from './dto/review-response.dto';
import { ReviewsFiltersDto, ReviewsQueryDto } from './dto/reviews-query.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private restaurantsService: RestaurantsService,
  ) {}

  /**
   * Crea una nueva reseña
   */
  async create(dto: CreateReviewDto): Promise<ReviewResponseDto> {
    try {
      const review = await this.prisma.review.create({
        data: {
          restaurant_id: dto.restaurant_id,
          user_id: dto.user_id,
          order_id: dto.order_id,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // Actualizar el rating del restaurante
      await this.restaurantsService.updateRating(dto.restaurant_id);

      return this.mapToResponseDto(review);
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException('Restaurante o usuario no existe');
      }
      throw error;
    }
  }

  /**
   * Obtiene todas las reseñas con paginación y filtros
   */
  async findAll(query: ReviewsQueryDto, filters: ReviewsFiltersDto): Promise<{
    data: ReviewResponseDto[];
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
    const {
      restaurant_id,
      user_id,
      order_id,
      min_rating,
      max_rating,
      created_from,
      created_to,
      ids,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = filters;

    const skip = (page - 1) * per_page;
    const where: any = {};

    // Filtros específicos
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (user_id) where.user_id = user_id;
    if (order_id) where.order_id = order_id;

    // Filtro por rango de rating
    if (min_rating !== undefined || max_rating !== undefined) {
      where.rating = {};
      if (min_rating !== undefined) where.rating.gte = min_rating;
      if (max_rating !== undefined) where.rating.lte = max_rating;
    }

    // Filtro por fecha de creación
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
    const total = await this.prisma.review.count({ where });

    // Obtener resultados
    const reviews = await this.prisma.review.findMany({
      where,
      skip,
      take: per_page,
      orderBy,
    });

    const total_pages = Math.ceil(total / per_page);

    return {
      data: reviews.map(r => this.mapToResponseDto(r)),
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
   * Obtiene una reseña por ID
   */
  async findOne(id: string): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(review);
  }

  /**
   * Obtiene una reseña por ID con detalles completos
   */
  async findOneWithDetails(id: string): Promise<ReviewWithDetailsDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        restaurant: true,
        user: true,
        order: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return {
      ...this.mapToResponseDto(review),
      restaurant: review.restaurant,
      user: review.user,
      order: review.order,
    };
  }

  /**
   * Actualiza una reseña
   */
  async update(id: string, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
    try {
      // Obtener la reseña actual para saber el restaurant_id
      const currentReview = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!currentReview) {
        throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
      }

      const review = await this.prisma.review.update({
        where: { id },
        data: dto,
      });

      // Actualizar el rating del restaurante si cambió el rating
      if (dto.rating !== undefined) {
        await this.restaurantsService.updateRating(currentReview.restaurant_id);
      }

      return this.mapToResponseDto(review);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Elimina una reseña
   */
  async remove(id: string): Promise<void> {
    try {
      // Obtener la reseña actual para saber el restaurant_id
      const currentReview = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!currentReview) {
        throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
      }

      await this.prisma.review.delete({
        where: { id },
      });

      // Actualizar el rating del restaurante
      await this.restaurantsService.updateRating(currentReview.restaurant_id);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Obtiene las reseñas de un restaurante
   */
  async getRestaurantReviews(
    restaurantId: string,
    query: ReviewsQueryDto,
  ): Promise<{
    data: ReviewResponseDto[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const filters = { ...query, restaurant_id: restaurantId };
    return this.findAll(query, filters);
  }

  /**
   * Obtiene las reseñas de un usuario
   */
  async getUserReviews(
    userId: string,
    query: ReviewsQueryDto,
  ): Promise<{
    data: ReviewWithDetailsDto[];
  }> {
    const reviews = await this.prisma.review.findMany({
      where: {
        user_id: userId,
      },
      include: {
        restaurant: true,
        order: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      data: reviews.map(r => ({
        ...this.mapToResponseDto(r),
        restaurant: r.restaurant,
        order: r.order,
      })),
    };
  }

  /**
   * Obtiene el promedio de ratings de un restaurante
   */
  async getRestaurantAverageRating(restaurantId: string): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      rating: number;
      count: number;
      percentage: number;
    }[];
  }> {
    const result = await this.prisma.review.aggregate({
      where: { restaurant_id: restaurantId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Obtener distribución de ratings
    const reviewsByRating = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { restaurant_id: restaurantId },
      _count: { rating: true },
      orderBy: { rating: 'asc' },
    });

    const ratingDistribution = [];
    for (let i = 1; i <= 5; i++) {
      const ratingData = reviewsByRating.find(r => r.rating === i);
      const count = ratingData?._count.rating || 0;
      const percentage = result._count.rating > 0 ? (count / result._count.rating) * 100 : 0;
      ratingDistribution.push({
        rating: i,
        count,
        percentage: Math.round(percentage * 100) / 100,
      });
    }

    return {
      average_rating: Number(result._avg.rating || 0),
      total_reviews: result._count.rating || 0,
      rating_distribution: ratingDistribution,
    };
  }

  /**
   * Mapea una reseña a la respuesta DTO
   */
  private mapToResponseDto(review: any): ReviewResponseDto {
    return {
      id: review.id,
      restaurant_id: review.restaurant_id,
      user_id: review.user_id,
      order_id: review.order_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      updated_at: review.updated_at,
    };
  }
}
