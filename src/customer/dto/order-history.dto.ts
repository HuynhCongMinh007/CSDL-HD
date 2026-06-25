import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderHistoryDto {

    @ApiPropertyOptional({
    example: 20,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

    @ApiPropertyOptional({
    example: 'asc',
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  sort?: string = 'desc';

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  lastOrderedAt?: string;  // Token dạng ISO string


  @ApiPropertyOptional({
    example: 'order_123',
  })
  @IsOptional()
  @IsString()
  lastOrderId?: string;    // Token cho order_id
}
// Dto không có customer_id vì thuộc tính này sẽ có đường đi khác xuống backend.