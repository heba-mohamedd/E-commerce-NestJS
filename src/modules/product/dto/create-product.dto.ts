import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  IsMongoId,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  name: string;

  @IsNotEmpty()
  @IsMongoId()
  brandId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3000)
  description: string;

  @IsNotEmpty()
  @IsMongoId()
  categoryId: Types.ObjectId;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stock: number;
}
