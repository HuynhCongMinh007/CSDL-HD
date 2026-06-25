import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
    @ApiProperty({
    example: 'pizza',
    description: 'Từ khóa tìm kiếm'
    })
    @IsString({ message: 'q must be a string' })
    q: string = "";

    @ApiPropertyOptional({
    example: 'cust_1721973133_00006'
    })
    @IsOptional()
    @IsString({ message: 'customerId must be a string' })
    customerId?: string;

    @ApiPropertyOptional({
    example: 20,
    default: 20
  })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'limit phải là số nguyên' })
    limit?: number = 20;
}