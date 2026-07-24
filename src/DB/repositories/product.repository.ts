import { Model } from 'mongoose';
import BaseRepository from './base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../models/product.model';

class ProductRepository extends BaseRepository<Product> {
  constructor(@InjectModel(Product.name) protected model: Model<Product>) {
    super(model);
  }
}

export default ProductRepository;
