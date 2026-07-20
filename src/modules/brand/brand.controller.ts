import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { Auth } from 'src/common/decorator/auth.decorator';
import { RoleEnum } from 'src/common/enum/user.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import multerCloud from 'src/common/utils/multer.utils';
import { User } from 'src/common/decorator/user.decorator';
import type { HUserDocument } from 'src/DB/models/user.model';
import { IdDto, QueryDTO, UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Auth({ access_roles: [RoleEnum.admin] })
  @UseInterceptors(FileInterceptor('logo', multerCloud()))
  createBrand(
    @Body() body: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @User() user: HUserDocument,
  ) {
    return this.brandService.createBrand(body, file, user);
  }

  @Get()
  findAllBrand(@Query() query: QueryDTO) {
    return this.brandService.findAllBrands(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findBrand(id);
  }

  @Patch(':id')
  @Auth({ access_roles: [RoleEnum.admin] })
  updateBrand(
    @Param() params: IdDto,
    @Body() body: UpdateBrandDto,
    @User() user: HUserDocument,
  ) {
    return this.brandService.updateBrand(params.id, body, user);
  }

  // @Patch('updata-logo/:id')
  // @Auth({ access_roles: [RoleEnum.admin] })
  // @UseInterceptors(FileInterceptor('attachment', multerCloud()))
  // updateBrandLogo(
  //   @Param() params: IdDto,
  //   @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  //   @User() user: HUserDocument,
  // ) {
  //   return this.brandService.updateBrandLogo(params.id, file, user);
  // }

  @Delete(':id')
  @Auth({ access_roles: [RoleEnum.admin] })
  removeBrand(@Param('id') id: string) {
    return this.brandService.removeBrand(id);
  }
}
