import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { AtLeastOne } from 'src/common/decorator/brand.decorator';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

@AtLeastOne(['slogan', 'name'])
export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export class IdDto {
  @IsMongoId()
  @IsNotEmpty()
  id: Types.ObjectId;
}

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
