import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Número de página (comienza en 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  per_page?: number;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto',
    example: 'Bife de Chorizo',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
