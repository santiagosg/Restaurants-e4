import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Datos de respuesta',
    required: false,
    nullable: true,
  })
  data?: T;

  @ApiProperty({
    description: 'Información de error si la operación falló',
    required: false,
    nullable: true,
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Código del error' },
      message: { type: 'string', description: 'Mensaje legible del error' },
      details: { type: 'object', description: 'Detalles adicionales del error', nullable: true },
    },
  })
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };

  @ApiProperty({
    description: 'Metadatos de la respuesta',
    required: false,
    nullable: true,
    type: 'object',
    properties: {
      timestamp: { type: 'string', description: 'Timestamp de la respuesta' },
      request_id: { type: 'string', description: 'ID único de la solicitud' },
    },
  })
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items por página', example: 20 })
  per_page: number;

  @ApiProperty({ description: 'Total de items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total de páginas', example: 5 })
  total_pages: number;

  @ApiProperty({ description: 'Hay siguiente página', example: true })
  has_next: boolean;

  @ApiProperty({ description: 'Hay página anterior', example: false })
  has_prev: boolean;
}

export class PaginatedResponseDto<T = any> extends BaseResponseDto<T[]> {
  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}
