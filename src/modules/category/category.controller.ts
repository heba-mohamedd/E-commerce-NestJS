import {
  Controller,
  // Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  // Patch,
  // Param,
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

@Controller('category')
export class CategoryController {
  constructor(private readonly _categoryService: CategoryService) {}

  @Post()
  @Auth({ access_roles: [RoleEnum.admin] })
  @UseInterceptors(FileInterceptor('logo', multerCloud()))
  createCategory(
    @Body() body: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: HUserDocument,
  ) {
    return this._categoryService.createCategory(body, file, user);
  }

  // @Get()
  // findAllCategories() {
  //   return this.categoryService.findAll();
  // }

  // @Get(':id')
  // findOneCategory(@Param('id') id: string) {
  //   return this.categoryService.findOne(+id);
  // }

  // @Patch(':id')
  // updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
  //   return this.categoryService.update(+id, updateCategoryDto);
  // }

  // @Delete(':id')
  // removeCategory(@Param('id') id: string) {
  //   return this.categoryService.remove(+id);
  // }
}
