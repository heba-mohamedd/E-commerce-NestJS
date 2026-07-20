import {
  BadGatewayException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { HUserDocument } from 'src/DB/models/user.model';
import CategoryRepository from 'src/DB/repositories/category.repository';
import { S3Service } from 'src/common/services/s3.service';
import BrandRepository from 'src/DB/repositories/brand.repository';
// import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly _categoryRepository: CategoryRepository,
    private readonly _brandRepository: BrandRepository,
    private readonly _s3Service: S3Service,
  ) {}
  async createCategory(
    body: CreateCategoryDto,
    file: Express.Multer.File,
    user: HUserDocument,
  ) {
    const { name } = body;
    if (await this._categoryRepository.findOne({ filter: { name } })) {
      throw new ConflictException('name already exist');
    }
    const logo = await this._s3Service.uploadFile({
      file,
      path: 'categories',
    });

    const category = await this._categoryRepository.create({
      name,
      logo,
      createdBy: user._id,
    });

    if (!category) {
      await this._s3Service.deleteFile(logo);
      throw new BadGatewayException('fail to create category');
    }

    return category;
  }

  // findAll() {
  //   return `This action returns all category`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} category`;
  // }

  // update(id: number, updateCategoryDto: UpdateCategoryDto) {
  //   return `This action updates a #${id} category`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} category`;
  // }
}
