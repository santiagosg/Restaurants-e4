import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './base-response.dto';

export class PaginationMeta implements PaginationMetaDto {
  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Items por página' })
  per_page: number;

  @ApiProperty({ description: 'Total de items' })
  total: number;

  @ApiProperty({ description: 'Total de páginas' })
  total_pages: number;

  @ApiProperty({ description: 'Hay siguiente página' })
  has_next: boolean;

  @ApiProperty({ description: 'Hay página anterior' })
  has_prev: boolean;

  constructor(page: number, perPage: number, total: number) {
    this.page = page;
    this.per_page = perPage;
    this.total = total;
    this.total_pages = Math.ceil(total / perPage);
    this.has_next = page < this.total_pages;
    this.has_prev = page > 1;
  }
}

export class SuccessResponse<T = any> {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean = true;

  @ApiProperty({ description: 'Datos de respuesta' })
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class ErrorResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean = false;

  @ApiProperty({ description: 'Información de error' })
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };

  @ApiProperty({ description: 'Metadatos de la respuesta' })
  meta: {
    timestamp: string;
    request_id: string;
  };

  constructor(code: string, message: string, details?: Record<string, any>) {
    this.error = { code, message, details };
    this.meta = {
      timestamp: new Date().toISOString(),
      request_id: generateRequestId(),
    };
  }
}

export class PaginatedResponse<T = any> {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean = true;

  @ApiProperty({ description: 'Datos de respuesta' })
  data: T[];

  @ApiProperty({ description: 'Metadatos de paginación', type: PaginationMeta })
  pagination: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.pagination = meta;
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
