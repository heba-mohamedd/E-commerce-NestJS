// import { PartialType } from '@nestjs/mapped-types';
// import { AtLeastOne } from 'src/common/decorator/brand.decorator';
// import { IsMongoId, IsNotEmpty } from 'class-validator';
// import { Types } from 'mongoose';
// import { CreateProductDto } from './create-product.dto';

import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

// @AtLeastOne(['brands', 'name'])
// export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class IdDto {
  @IsMongoId()
  @IsNotEmpty()
  id: Types.ObjectId;
}
