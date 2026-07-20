import { Model } from 'mongoose';
import BaseRepository from './base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from '../models/brand.model';

class BrandRepository extends BaseRepository<Brand> {
  constructor(@InjectModel(Brand.name) protected model: Model<Brand>) {
    super(model);
  }
}

export default BrandRepository;
