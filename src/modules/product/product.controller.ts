import {
  Controller,
  // Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Delete,
  Param,
  Get,
  Query,
  // Delete,
} from '@nestjs/common';
import { Auth } from 'src/common/decorator/auth.decorator';
import { RoleEnum } from 'src/common/enum/user.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multerCloud from 'src/common/utils/multer.utils';
import type { HUserDocument } from 'src/DB/models/user.model';
import { User } from 'src/common/decorator/user.decorator';
import { ProcustService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { IdDto } from './dto/update-product.dto';
import { QueryDTO } from 'src/types/queryDto';

@Controller('product')
export class ProductController {
  constructor(private readonly _productService: ProcustService) {}

  @Post()
  @Auth({ access_roles: [RoleEnum.admin] })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
      ],
      multerCloud(),
    ),
  )
  createProduct(
    @Body() body: CreateProductDto,
    @UploadedFiles()
    files: {
      mainImage: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
    @User() user: HUserDocument,
  ) {
    return this._productService.createProduct(body, files, user);
  }

  @Get()
  findAllProducts(@Query() query: QueryDTO) {
    return this._productService.findAllProducts(query);
  }

  @Get(':id')
  findOneProduct(@Param() params: IdDto) {
    return this._productService.findOneProduct(params.id);
  }

  // @Patch(':id')
  // @Auth({ access_roles: [RoleEnum.admin] })
  // updateCategory(
  //   @Param() params: IdDto,
  //   @Body() body: UpdateCategoryDto,
  //   @User() user: HUserDocument,
  // ) {
  //   console.log(body);

  //   return this._productService.updateProduct(params.id, body, user);
  // }

  @Delete(':id')
  @Auth({ access_roles: [RoleEnum.admin] })
  removeCategory(@Param() params: IdDto, @User() user: HUserDocument) {
    return this._productService.removeProduct(params.id, user);
  }
}
