import { Injectable, NotFoundException } from '@nestjs/common';
import type { HUserDocument } from 'src/DB/models/user.model';
import CategoryRepository from 'src/DB/repositories/category.repository';
import { S3Service } from 'src/common/services/s3.service';
import BrandRepository from 'src/DB/repositories/brand.repository';
import ProductRepository from 'src/DB/repositories/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { Types } from 'mongoose';
import { QueryDTO } from 'src/types/queryDto';

@Injectable()
export class ProcustService {
  constructor(
    private readonly _categoryRepository: CategoryRepository,
    private readonly _productRepository: ProductRepository,
    private readonly _brandRepository: BrandRepository,
    private readonly _s3Service: S3Service,
  ) {}

  async createProduct(
    body: CreateProductDto,
    files: {
      mainImage: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
    user: HUserDocument,
  ) {
    // const { mainImage, subImages } = files;
    const { name, brandId, categoryId, description, price, discount, stock } =
      body;

    if (
      !(await this._categoryRepository.findOne({ filter: { _id: categoryId } }))
    ) {
      throw new NotFoundException('category not found');
    }

    if (!(await this._brandRepository.findOne({ filter: { _id: brandId } }))) {
      throw new NotFoundException('brand not found');
    }

    const finalPrice = discount
      ? price - price * ((discount || 0) / 100)
      : price;

    // const mainImageKey = await this._s3Service.uploadFile({
    //   file: mainImage[0],
    //   path: 'products/main',
    // });

    // let subImageKeys: string[] = [];
    // if (subImages && subImages.length > 0) {
    //   subImageKeys = await this._s3Service.uploadFiles({
    //     files: subImages,
    //     path: 'products/subs',
    //   });
    // }

    const product = await this._productRepository.create({
      name,
      description,
      brandId: new Types.ObjectId(brandId),
      categoryId: new Types.ObjectId(categoryId),
      // mainImage: mainImageKey,
      // subImages: subImageKeys,
      price: finalPrice,
      discount,
      stock,
      createdBy: user._id,
    });

    // if (!product) {
    //   await this._s3Service.deleteFile(mainImageKey);
    //   if (subImageKeys.length > 0) {
    //     await this._s3Service.deleteFiles(subImageKeys);
    //   }
    //   throw new BadGatewayException('failed to create product');
    // }

    return product;
  }

  async removeProduct(id: Types.ObjectId, user: HUserDocument) {
    const product = await this._productRepository.findOneAndUpdate({
      filter: { _id: id },
      update: { deletedAt: new Date(), deletedBy: user._id },
    });

    if (!product) {
      throw new NotFoundException('category not found');
    }
    if (product.mainImage) {
      await this._s3Service.deleteFile(product.mainImage);
    }
    if (product.subImages) {
      await this._s3Service.deleteFiles(product.subImages);
    }
    return product;
  }

  async findAllProducts(query: QueryDTO) {
    const { page, limit, search } = query;
    const filter = {
      deletedAt: { $exists: false },
      ...(search && {
        $or: [{ name: { $regex: search, $options: 'i' } }],
      }),
    };
    return await this._productRepository.paginate({
      page,
      limit,
      search: filter,
    });
  }

  async findOneProduct(id: Types.ObjectId) {
    const objectId = new Types.ObjectId(id);
    const product = await this._productRepository.findOne({
      filter: { _id: objectId },
      projection: { deletedAt: 0, deletedBy: 0 },
    });
    if (!product) {
      throw new NotFoundException('Category not found');
    }
    return product;
  }
}
