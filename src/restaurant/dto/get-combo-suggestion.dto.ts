import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class GetComboSuggestionDto {
      @ApiProperty({
    example: 'item_1_1_26076',
    description: 'ID món ăn gốc'
  })
    @IsNotEmpty({ message: 'Mã món ăn gốc (dishId) không được để trống' })
    @IsString({ message: 'dishId must be a string' })
    dishId: string = "1";

     @ApiPropertyOptional({
    example: 3,
    default: 3,
    description: 'Số lượng gợi ý'
  })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Số lượng gợi ý phải là số nguyên' })
    @Min(1, { message: 'Chỉ chấp nhận lấy tối thiểu 1 gợi ý' })
    limit?: number = 3;
}