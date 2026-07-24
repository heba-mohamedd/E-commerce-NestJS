import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { User } from './user.model';
import { Brand } from './brand.model';
import { Category } from './category.model';

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'name must be at least 3 characters long'],
    maxlength: [30, 'name must be at most 30 characters long'],
  })
  name: string;

  @Prop({
    type: String,
    default: function (this: Product) {
      return slugify(this.name, { replacement: '-', lower: true, trim: true });
    },
  })
  slug: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'description must be at least 3 characters long'],
  })
  description: string;

  @Prop({ type: Types.ObjectId, ref: Brand.name, required: true })
  brandId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: String })
  mainImage: string;

  @Prop({ type: [String], default: [] })
  subImages: string[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number })
  discount: number;

  @Prop({ type: Number, required: true })
  stock: number;

  @Prop({ type: Number })
  rateNum: number;

  @Prop({ type: Number })
  rateAvg: number;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  deletedBy?: Types.ObjectId;
}

// this is schema with pre save hook
export const ProductSchema = SchemaFactory.createForClass(Product);
export type HProductDocument = HydratedDocument<Product>;

ProductSchema.pre(['findOneAndUpdate', 'updateOne'], function () {
  const updateQuery = this.getUpdate() as UpdateQuery<Product>;
  if (updateQuery?.name) {
    updateQuery.slug = slugify(updateQuery.name, {
      replacement: '-',
      lower: true,
      trim: true,
    });
  }
});
export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
