import { IsString, IsOptional, IsInt, Min, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'isEven', async: false })
export class IsEvenConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    return value % 2 === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'limit phải là số chẵn';
  }
}

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
    @Min(1, { message: 'limit phải lớn hơn 0' })
    @Validate(IsEvenConstraint)
    limit?: number = 20;

    @ApiPropertyOptional({
      example: 1,
      default: 1,
      description: 'Trang kết quả (bắt đầu từ 1)'
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'page phải là số nguyên' })
    @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
    page?: number = 1;
}