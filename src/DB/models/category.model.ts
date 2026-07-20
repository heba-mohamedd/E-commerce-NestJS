import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { User } from './user.model';
import { Brand } from './brand.model';

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'name must be at least 3 characters long'],
    maxlength: [30, 'name must be at most 30 characters long'],
    unique: true,
  })
  name: string;

  @Prop({
    type: String,
    default: function (this: Category) {
      return slugify(this.name, { replacement: '-', lower: true, trim: true });
    },
  })
  slug: string;

  @Prop([{ type: Types.ObjectId, ref: Brand.name }])
  brands: Types.ObjectId;

  @Prop({ type: String, required: true })
  logo: string;

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
export const CategorySchema = SchemaFactory.createForClass(Category);
export type HCategoryDocument = HydratedDocument<Category>;

CategorySchema.pre(['findOneAndUpdate', 'updateOne'], function () {
  const updateQuery = this.getUpdate() as UpdateQuery<Category>;
  if (updateQuery?.name) {
    updateQuery.slug = slugify(updateQuery.name, {
      replacement: '-',
      lower: true,
      trim: true,
    });
  }
});
export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema },
]);
