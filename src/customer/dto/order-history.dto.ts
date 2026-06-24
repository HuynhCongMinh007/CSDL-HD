import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class OrderHistoryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string = 'desc';

  @IsOptional()
  @IsString()
  lastOrderedAt?: string;  // Token dạng ISO string

  @IsOptional()
  @IsString()
  lastOrderId?: string;    // Token cho order_id
}
// Dto không có customer_id vì thuộc tính này sẽ có đường đi khác xuống backend.