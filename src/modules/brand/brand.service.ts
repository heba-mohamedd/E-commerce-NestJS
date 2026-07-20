import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import type { HUserDocument } from 'src/DB/models/user.model';
import BrandRepository from 'src/DB/repositories/brand.repository';
import { S3Service } from 'src/common/services/s3.service';
import { QueryDTO, UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';
// import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    private readonly _brandRepository: BrandRepository,
    private readonly _s3Service: S3Service,
  ) {}

  async createBrand(
    body: CreateBrandDto,
    file: Express.Multer.File,
    user: HUserDocument,
  ) {
    const { name, slogan } = body;
    if (await this._brandRepository.findOne({ filter: { name } })) {
      throw new ConflictException('name already exist');
    }
    const logo = await this._s3Service.uploadFile({
      file,
      path: 'brands',
    });

    const brand = await this._brandRepository.create({
      name,
      slogan,
      logo,
      createdBy: user._id,
    });

    if (!brand) {
      await this._s3Service.deleteFile(logo);
      throw new BadGatewayException('fail to create brand');
    }

    return brand;
  }
  async findAllBrands(query: QueryDTO) {
    const { page, limit, search } = query;
    const filter = {
      deletedAt: { $exists: false },

      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { slogan: { $regex: search, $options: 'i' } },
        ],
      }),
    };
    return await this._brandRepository.paginate({
      page,
      limit,
      search: filter,
    });
  }
  async findBrand(id: string) {
    const objectId = new Types.ObjectId(id);
    const brand = await this._brandRepository.findOne({
      filter: { _id: objectId },
      projection: { deletedAt: 0, deletedBy: 0 },
    });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }
  async updateBrand(
    id: Types.ObjectId,
    body: UpdateBrandDto,
    user: HUserDocument,
  ) {
    const { name, slogan } = body;

    const brand = await this._brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (name) {
      const isNameExist = await this._brandRepository.findOne({
        filter: { name },
      });

      if (isNameExist) {
        throw new ConflictException(
          'Brand name not changed ,please provide another name',
        );
      }
    }

    const updatedBrand = await this._brandRepository.findOneAndUpdate({
      filter: { _id: id },
      update: {
        updatedBy: user._id,
        ...(name && { name }),
        ...(slogan && { slogan }),
      },
    });

    return updatedBrand;
  }

  // async updateBrandLogo(
  //   id: Types.ObjectId,
  //   file: Express.Multer.File,
  //   user: HUserDocument,
  // ) {
  //   let newLogoKey: string | undefined;
  //   try {
  //     const brand = await this._brandRepository.findById(id);

  //     if (!brand) {
  //       throw new NotFoundException('Brand not found');
  //     }
  //     console.log('brand logo', brand.logo); // done

  //     if (file) {
  //       console.log(file); //done

  //       newLogoKey = await this._s3Service.uploadFile({
  //         file,
  //         path: 'brands',
  //       });

  //       if (brand.logo) {
  //         console.log('old', brand.logo);

  //         await this._s3Service.deleteFile(brand.logo);
  //       }
  //       console.log('new', newLogoKey);

  //       brand.logo = newLogoKey;
  //     }
  //     brand.updatedBy = user._id;

  //     console.log('New Logo:', brand.logo);
  //     await brand.save();

  //     return brand;
  //   } catch (error) {
  //     if (newLogoKey) {
  //       // Rollback the newly uploaded S3 object if the database save fails
  //       await this._s3Service.deleteFile(newLogoKey).catch(console.error);
  //     }
  //     throw error;
  //   }
  // }

  async removeBrand(id: string) {
    const objectId = new Types.ObjectId(id);
    const brand = await this._brandRepository.findOneAndUpdate({
      filter: { _id: objectId },
      update: { deletedAt: new Date(), deletedBy: objectId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    // if (brand.logo) {
    //   await this._s3Service.deleteFile(brand.logo);
    // }
    return brand;
  }
}
