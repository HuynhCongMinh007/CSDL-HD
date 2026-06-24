import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDto {
    @IsString({ message: 'dishId must be a string' })
    q: string = "";

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'limit phải là số nguyên' })
    limit?: number = 20;
}