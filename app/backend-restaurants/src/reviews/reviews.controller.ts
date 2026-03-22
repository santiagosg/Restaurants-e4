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
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
} from './dto';
import {
  ReviewResponseDto,
  ReviewWithDetailsDto,
} from './dto/review-response.dto';
import { ReviewsFiltersDto, ReviewsQueryDto } from './dto/reviews-query.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../common/dto/base-response.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reseña' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reseña creada exitosamente',
    type: BaseResponseDto,
  })
  async create(
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<BaseResponseDto<ReviewResponseDto>> {
    const data = await this.reviewsService.create(createReviewDto);
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
  @ApiOperation({ summary: 'Obtener todas las reseñas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reseñas',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: ReviewsQueryDto,
    @Query() filters: ReviewsFiltersDto,
  ): Promise<PaginatedResponseDto<ReviewResponseDto>> {
    const result = await this.reviewsService.findAll(query, filters);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Obtener reseñas de un restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseñas del restaurante',
    type: PaginatedResponseDto,
  })
  async getRestaurantReviews(
    @Param('restaurantId') restaurantId: string,
    @Query() query: ReviewsQueryDto,
  ): Promise<PaginatedResponseDto<ReviewResponseDto>> {
    const result = await this.reviewsService.getRestaurantReviews(restaurantId, query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('restaurant/:restaurantId/average')
  @ApiOperation({ summary: 'Obtener estadísticas de ratings de un restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'ID del restaurante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas de ratings',
    type: BaseResponseDto,
  })
  async getRestaurantAverageRating(
    @Param('restaurantId') restaurantId: string,
  ): Promise<BaseResponseDto<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      rating: number;
      count: number;
      percentage: number;
    }[];
  }>> {
    const data = await this.reviewsService.getRestaurantAverageRating(restaurantId);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener reseñas de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseñas del usuario',
    type: BaseResponseDto,
  })
  async getUserReviews(
    @Param('userId') userId: string,
    @Query() query: ReviewsQueryDto,
  ): Promise<BaseResponseDto<ReviewWithDetailsDto[]>> {
    const result = await this.reviewsService.getUserReviews(userId, query);
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
  @ApiOperation({ summary: 'Obtener una reseña por ID' })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña encontrada',
    type: BaseResponseDto,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReviewResponseDto>> {
    const data = await this.reviewsService.findOne(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Obtener una reseña con detalles completos' })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña con detalles',
    type: BaseResponseDto,
  })
  async findOneWithDetails(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReviewWithDetailsDto>> {
    const data = await this.reviewsService.findOneWithDetails(id);
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
  @ApiOperation({ summary: 'Actualizar una reseña' })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reseña actualizada',
    type: BaseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<BaseResponseDto<ReviewResponseDto>> {
    const data = await this.reviewsService.update(id, updateReviewDto);
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
  @ApiOperation({ summary: 'Eliminar una reseña' })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reseña eliminada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.reviewsService.remove(id);
  }
}
