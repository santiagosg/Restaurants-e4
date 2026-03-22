import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
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

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva reserva
   */
  async create(dto: CreateReservationDto): Promise<ReservationResponseDto> {
    try {
      // Parsear fecha y hora
      const reservationDate = new Date(dto.reservation_date);
      const reservationTime = this.parseTime(dto.reservation_time);

      const booking = await this.prisma.reservation.create({
        data: {
          restaurant_id: dto.restaurant_id,
          user_id: dto.user_id,
          table_id: dto.table_id,
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          party_size: dto.party_size,
          special_requests: dto.special_requests,
          status: dto.status || ReservationStatus.PENDING,
        },
      });
      return this.mapToResponseDto(booking);
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException('Restaurante, usuario o mesa no existe');
      }
      throw error;
    }
  }

  /**
   * Obtiene todas las reservas con paginación y filtros
   */
  async findAll(query: ReservationsQueryDto, filters: ReservationsFiltersDto): Promise<{
    data: ReservationResponseDto[];
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
      table_id,
      status,
      reservation_date_from,
      reservation_date_to,
      created_from,
      created_to,
      ids,
      sort_by = 'reservation_date',
      sort_order = 'asc',
    } = filters;

    const skip = (page - 1) * per_page;
    const where: any = {};

    // Filtros específicos
    if (restaurant_id) where.restaurant_id = restaurant_id;
    if (user_id) where.user_id = user_id;
    if (table_id) where.table_id = table_id;
    if (status) where.status = status;

    // Filtro por fecha de reserva
    if (reservation_date_from || reservation_date_to) {
      where.reservation_date = {};
      if (reservation_date_from) where.reservation_date.gte = new Date(reservation_date_from);
      if (reservation_date_to) where.reservation_date.lte = new Date(reservation_date_to);
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
    const total = await this.prisma.reservation.count({ where });

    // Obtener resultados
    const bookings = await this.prisma.reservation.findMany({
      where,
      skip,
      take: per_page,
      orderBy,
    });

    const total_pages = Math.ceil(total / per_page);

    return {
      data: bookings.map(b => this.mapToResponseDto(b)),
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
   * Obtiene una reserva por ID
   */
  async findOne(id: string): Promise<ReservationResponseDto> {
    const booking = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return this.mapToResponseDto(booking);
  }

  /**
   * Obtiene una reserva por ID con detalles completos
   */
  async findOneWithDetails(id: string): Promise<ReservationWithDetailsDto> {
    const booking = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        restaurant: true,
        user: true,
        table: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return {
      ...this.mapToResponseDto(booking),
      restaurant: booking.restaurant,
      user: booking.user,
      table: booking.table,
    };
  }

  /**
   * Actualiza una reserva
   */
  async update(id: string, dto: UpdateReservationDto): Promise<ReservationResponseDto> {
    try {
      const data: any = { ...dto };

      // Parsear fecha y hora si se proporcionan
      if (dto.reservation_date) {
        data.reservation_date = new Date(dto.reservation_date);
      }
      if (dto.reservation_time) {
        data.reservation_time = this.parseTime(dto.reservation_time);
      }

      const booking = await this.prisma.reservation.update({
        where: { id },
        data,
      });
      return this.mapToResponseDto(booking);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado de una reserva
   */
  async updateStatus(id: string, status: ReservationStatus): Promise<ReservationResponseDto> {
    try {
      const booking = await this.prisma.reservation.update({
        where: { id },
        data: { status },
      });
      return this.mapToResponseDto(booking);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Cancela una reserva
   */
  async cancel(id: string): Promise<ReservationResponseDto> {
    return this.updateStatus(id, ReservationStatus.CANCELLED);
  }

  /**
   * Confirma una reserva
   */
  async confirm(id: string): Promise<ReservationResponseDto> {
    return this.updateStatus(id, ReservationStatus.CONFIRMED);
  }

  /**
   * Marca una reserva como "sentada"
   */
  async seat(id: string): Promise<ReservationResponseDto> {
    return this.updateStatus(id, ReservationStatus.SEATED);
  }

  /**
   * Marca una reserva como "no show"
   */
  async markNoShow(id: string): Promise<ReservationResponseDto> {
    return this.updateStatus(id, ReservationStatus.NO_SHOW);
  }

  /**
   * Elimina una reserva
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.reservation.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  /**
   * Obtiene las reservas de un restaurante en una fecha específica
   */
  async getRestaurantBookingsByDate(
    restaurantId: string,
    date: string,
  ): Promise<{
    data: ReservationResponseDto[];
  }> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        restaurant_id: restaurantId,
        reservation_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        reservation_time: 'asc',
      },
    });

    return {
      data: reservations.map(r => this.mapToResponseDto(r)),
    };
  }

  /**
   * Obtiene las reservas de un usuario
   */
  async getUserBookings(
    userId: string,
  ): Promise<{
    data: ReservationWithDetailsDto[];
  }> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        user_id: userId,
      },
      include: {
        restaurant: true,
        table: true,
      },
      orderBy: {
        reservation_date: 'desc',
      },
    });

    return {
      data: reservations.map(r => ({
        ...this.mapToResponseDto(r),
        restaurant: r.restaurant,
        table: r.table,
      })),
    };
  }

  /**
   * Parsea una hora en formato HH:MM a Date
   */
  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Mapea una reserva a la respuesta DTO
   */
  private mapToResponseDto(reservation: any): ReservationResponseDto {
    return {
      id: reservation.id,
      restaurant_id: reservation.restaurant_id,
      user_id: reservation.user_id,
      table_id: reservation.table_id,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      party_size: reservation.party_size,
      special_requests: reservation.special_requests,
      status: reservation.status,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at,
    };
  }
}
