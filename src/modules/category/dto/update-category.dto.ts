import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { AtLeastOne } from 'src/common/decorator/brand.decorator';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

@AtLeastOne(['brands', 'name'])
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class IdDto {
  @IsMongoId()
  @IsNotEmpty()
  id: Types.ObjectId;
}
