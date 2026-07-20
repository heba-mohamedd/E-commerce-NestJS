import { IsNotEmpty, IsString, Length, Validate } from 'class-validator';
import { Types } from 'mongoose';
import { ValidateIds } from 'src/common/decorator/category.decorator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  name: string;

  @Validate(ValidateIds)
  brands: Types.ObjectId[];
}
