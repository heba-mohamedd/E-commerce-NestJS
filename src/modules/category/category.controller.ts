import {
  Controller,
  // Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Param,
  Patch,
  Get,
  Query,
  Delete,
  // Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Auth } from 'src/common/decorator/auth.decorator';
import { RoleEnum } from 'src/common/enum/user.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import multerCloud from 'src/common/utils/multer.utils';
import type { HUserDocument } from 'src/DB/models/user.model';
import { User } from 'src/common/decorator/user.decorator';
import { IdDto, UpdateCategoryDto } from './dto/update-category.dto';
import { QueryDTO } from 'src/types/queryDto';

@Controller('category')
export class CategoryController {
  constructor(private readonly _categoryService: CategoryService) {}

  @Post()
  @Auth({ access_roles: [RoleEnum.admin] })
  @UseInterceptors(FileInterceptor('categoryImg', multerCloud()))
  createCategory(
    @Body() body: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: HUserDocument,
  ) {
    return this._categoryService.createCategory(body, file, user);
    // return this._categoryService.createCategory(body, user);
  }

  @Get()
  findAllCategories(@Query() query: QueryDTO) {
    return this._categoryService.findAllCategories(query);
  }

  @Get(':id')
  findOneCategory(@Param('id') id: string) {
    return this._categoryService.findOneCategory(id);
  }

  @Patch(':id')
  @Auth({ access_roles: [RoleEnum.admin] })
  updateCategory(
    @Param() params: IdDto,
    @Body() body: UpdateCategoryDto,
    @User() user: HUserDocument,
  ) {
    console.log(body);

    return this._categoryService.updateCategory(params.id, body, user);
  }

  @Delete(':id')
  @Auth({ access_roles: [RoleEnum.admin] })
  removeCategory(@Param('id') id: string) {
    return this._categoryService.removeCategory(id);
  }
}
