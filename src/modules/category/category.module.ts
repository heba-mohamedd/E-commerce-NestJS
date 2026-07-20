import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { BrandModel } from 'src/DB/models/brand.model';
import { UserModel } from 'src/DB/models/user.model';
import { CategoryModel } from 'src/DB/models/category.model';
import CategoryRepository from 'src/DB/repositories/category.repository';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/common/services/s3.service';
import UserRepository from 'src/DB/repositories/user.repository';
import TokenService from 'src/common/services/token.service';
import BrandRepository from 'src/DB/repositories/brand.repository';

@Module({
  imports: [UserModel, BrandModel, CategoryModel],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    JwtService,
    TokenService,
    UserRepository,
    CategoryRepository,
    BrandRepository,
    S3Service,
  ],
})
export class CategoryModule {}
