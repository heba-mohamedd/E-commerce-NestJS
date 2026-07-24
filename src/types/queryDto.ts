import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class QueryDTO {
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
