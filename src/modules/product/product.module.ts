import { Module } from '@nestjs/common';
import { BrandModel } from 'src/DB/models/brand.model';
import { UserModel } from 'src/DB/models/user.model';
import { CategoryModel } from 'src/DB/models/category.model';
import CategoryRepository from 'src/DB/repositories/category.repository';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/common/services/s3.service';
import UserRepository from 'src/DB/repositories/user.repository';
import TokenService from 'src/common/services/token.service';
import BrandRepository from 'src/DB/repositories/brand.repository';
import { ProcustService } from './product.service';
import ProductRepository from 'src/DB/repositories/product.repository';
import { ProductModel } from 'src/DB/models/product.model';
import { ProductController } from './product.controller';

@Module({
  imports: [UserModel, BrandModel, CategoryModel, ProductModel],
  controllers: [ProductController],
  providers: [
    ProcustService,
    JwtService,
    TokenService,
    UserRepository,
    CategoryRepository,
    BrandRepository,
    ProductRepository,
    S3Service,
  ],
})
export class ProductModule {}
