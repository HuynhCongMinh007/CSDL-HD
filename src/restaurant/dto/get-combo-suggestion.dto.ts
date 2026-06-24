import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetComboSuggestionDto {
    @IsNotEmpty({ message: 'Mã món ăn gốc (dishId) không được để trống' })
    @IsString({ message: 'dishId must be a string' })
    dishId: string = "1";

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Số lượng gợi ý phải là số nguyên' })
    @Min(1, { message: 'Chỉ chấp nhận lấy tối thiểu 1 gợi ý' })
    limit?: number = 3;
}