import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { User } from './user.model';

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Brand {
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
    default: function (this: Brand) {
      return slugify(this.name, { replacement: '-', lower: true, trim: true });
    },
  })
  slug: string;

  @Prop({
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 25,
  })
  slogan?: string;

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
export const BrandSchema = SchemaFactory.createForClass(Brand);
export type HBrandDocument = HydratedDocument<Brand>;

BrandSchema.pre(['findOneAndUpdate', 'updateOne'], function () {
  const updateQuery = this.getUpdate() as UpdateQuery<Brand>;
  if (updateQuery?.name) {
    updateQuery.slug = slugify(updateQuery.name, {
      replacement: '-',
      lower: true,
      trim: true,
    });
  }
});
export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: BrandSchema },
]);
