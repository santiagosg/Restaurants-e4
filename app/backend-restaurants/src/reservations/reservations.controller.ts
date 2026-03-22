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
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ReservationStatus,
} from './dto';
import {
  ReservationResponseDto,
  ReservationWithDetailsDto,
} from './dto/reservation-response.dto';
import { ReservationsFiltersDto, ReservationsQueryDto } from './dto/reservations-query.dto';
import { BaseResponseDto, PaginatedResponseDto } from '../common/dto/base-response.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reserva creada exitosamente',
    type: BaseResponseDto,
  })
  async create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.create(createReservationDto);
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
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reservas',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: ReservationsQueryDto,
    @Query() filters: ReservationsFiltersDto,
  ): Promise<PaginatedResponseDto<ReservationResponseDto>> {
    const result = await this.reservationsService.findAll(query, filters);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('restaurant/:restaurantId/date/:date')
  @ApiOperation({ summary: 'Obtener reservas de un restaurante por fecha' })
  @ApiParam({ name: 'restaurantId', description: 'ID del restaurante' })
  @ApiParam({ name: 'date', description: 'Fecha (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservas del restaurante en la fecha',
    type: BaseResponseDto,
  })
  async getRestaurantBookingsByDate(
    @Param('restaurantId') restaurantId: string,
    @Param('date') date: string,
  ): Promise<BaseResponseDto<ReservationResponseDto[]>> {
    const result = await this.reservationsService.getRestaurantBookingsByDate(restaurantId, date);
    return {
      success: true,
      data: result.data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener reservas de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservas del usuario',
    type: BaseResponseDto,
  })
  async getUserBookings(
    @Param('userId') userId: string,
  ): Promise<BaseResponseDto<ReservationWithDetailsDto[]>> {
    const result = await this.reservationsService.getUserBookings(userId);
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
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva encontrada',
    type: BaseResponseDto,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.findOne(id);
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
  @ApiOperation({ summary: 'Obtener una reserva con detalles completos' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva con detalles',
    type: BaseResponseDto,
  })
  async findOneWithDetails(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReservationWithDetailsDto>> {
    const data = await this.reservationsService.findOneWithDetails(id);
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
  @ApiOperation({ summary: 'Actualizar una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva actualizada',
    type: BaseResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.update(id, updateReservationDto);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado actualizado',
    type: BaseResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReservationStatus,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.updateStatus(id, status);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva confirmada',
    type: BaseResponseDto,
  })
  async confirm(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.confirm(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva cancelada',
    type: BaseResponseDto,
  })
  async cancel(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.cancel(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Patch(':id/seat')
  @ApiOperation({ summary: 'Marcar reserva como sentada' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva marcada como sentada',
    type: BaseResponseDto,
  })
  async seat(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.seat(id);
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  @Patch(':id/no-show')
  @ApiOperation({ summary: 'Marcar reserva como no show' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reserva marcada como no show',
    type: BaseResponseDto,
  })
  async markNoShow(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<ReservationResponseDto>> {
    const data = await this.reservationsService.markNoShow(id);
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
  @ApiOperation({ summary: 'Eliminar una reserva' })
  @ApiParam({ name: 'id', description: 'ID de la reserva' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reserva eliminada',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.reservationsService.remove(id);
  }
}
