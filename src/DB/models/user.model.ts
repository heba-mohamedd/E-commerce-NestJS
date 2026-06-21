import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from 'src/common/enum/user.enum';
import { Hash } from 'src/common/utils/security/hash.security';

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 25,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 25,
  })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  userName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
    required: function (this: User): boolean {
      return this.provider !== ProviderEnum.google;
    },
    trim: true,
    minlength: 6,
  })
  password: string;

  @Prop({
    type: Number,
    required: function (this: User): boolean {
      return this.provider !== ProviderEnum.google;
    },
    min: 15,
    max: 60,
  })
  age: number;

  @Prop({
    type: String,
    trim: true,
  })
  phone?: string;

  @Prop({
    type: String,
    trim: true,
  })
  address?: string;

  @Prop({
    type: String,
    enum: Object.values(GenderEnum),
    default: GenderEnum.male,
  })
  gender?: GenderEnum;

  @Prop({
    type: String,
    enum: Object.values(RoleEnum),
    default: RoleEnum.user,
  })
  role?: RoleEnum;

  @Prop(Boolean)
  confirmed?: boolean;

  @Prop({
    type: String,
    enum: Object.values(ProviderEnum),
    default: ProviderEnum.system,
  })
  provider?: ProviderEnum;

  @Prop(Date)
  changeCredential?: Date;

  @Prop(String)
  profilePicture?: string;
}

// this is schema with pre save hook
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await Hash({ plainText: this.password });
  }
});

export type HUserDocument = HydratedDocument<User>;

// this is schema with pre save hook but in factory (better approach)
// export const UserModel = MongooseModule.forFeatureAsync([
//   {
//     name: User.name,
//     useFactory: () => {
//       const schema = UserSchema;
//       schema.pre('save', async function () {
//         if (this.isModified('password')) {
//           this.password = await Hash({ plainText: this.password });
//         }
//       });
//       return schema;
//     },
//   },
// ]);

export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
