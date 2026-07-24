import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { HUserDocument } from 'src/DB/models/user.model';
import CategoryRepository from 'src/DB/repositories/category.repository';
import { S3Service } from 'src/common/services/s3.service';
import BrandRepository from 'src/DB/repositories/brand.repository';
import { Types } from 'mongoose';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryDTO } from 'src/types/queryDto';

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
    const { name, brands } = body;
    const strictIDs = ([...new Set(brands || [])] as any).map((id) =>
      Types.ObjectId.createFromHexString(id),
    );

    if (await this._categoryRepository.findOne({ filter: { name } })) {
      throw new ConflictException('name already exist');
    }

    if (
      strictIDs.length > 0 &&
      (
        await this._brandRepository.find({
          filter: { _id: { $in: strictIDs } },
        })
      ).length != strictIDs.length
    ) {
      throw new NotFoundException('some of id not found');
    }

    // const logo = await this._s3Service.uploadFile({
    //   file,
    //   path: 'categories',
    // });

    const category = await this._categoryRepository.create({
      name,
      brands: strictIDs,
      // logo,
      createdBy: user._id,
    });

    // if (!category) {
    //   await this._s3Service.deleteFile(logo);
    //   throw new BadGatewayException('fail to create category');
    // }

    return category;
  }

  async findAllCategories(query: QueryDTO) {
    const { page, limit, search } = query;
    const filter = {
      deletedAt: { $exists: false },

      ...(search && {
        $or: [{ name: { $regex: search, $options: 'i' } }],
      }),
    };
    return await this._categoryRepository.paginate({
      page,
      limit,
      search: filter,
    });
  }

  async findOneCategory(id: string) {
    const objectId = new Types.ObjectId(id);
    const category = await this._categoryRepository.findOne({
      filter: { _id: objectId },
      projection: { deletedAt: 0, deletedBy: 0 },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async updateCategory(
    id: Types.ObjectId,
    body: UpdateCategoryDto,
    user: HUserDocument,
  ) {
    const { name, brands } = body;

    if (!(await this._categoryRepository.findOne({ filter: { _id: id } }))) {
      throw new NotFoundException('category not found');
    }

    if (name) {
      if (await this._categoryRepository.findOne({ filter: { name } })) {
        throw new ConflictException('name not updated');
      }
    }

    const strictIDs = brands
      ? ([...new Set(brands)] as any as string[]).map((brandId) =>
          Types.ObjectId.createFromHexString(brandId),
        )
      : undefined;

    if (strictIDs && strictIDs.length > 0) {
      const foundBrands = await this._brandRepository.find({
        filter: { _id: { $in: strictIDs } },
      });
      if (foundBrands.length !== strictIDs.length) {
        throw new NotFoundException('some brand ids not found');
      }
    }

    return this._categoryRepository.findByIdAndUpdate({
      id,
      update: {
        ...(name && { name }),
        ...(strictIDs && { brands: strictIDs }),
        updatedBy: user._id,
      },
    });
  }

  async removeCategory(id: string) {
    const objectId = new Types.ObjectId(id);
    const category = await this._categoryRepository.findOneAndUpdate({
      filter: { _id: objectId },
      update: { deletedAt: new Date(), deletedBy: objectId },
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }
    // if (category.logo) {
    //   await this._s3Service.deleteFile(category.logo);
    // }
    return category;
  }
}
