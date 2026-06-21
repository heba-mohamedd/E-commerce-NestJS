// import * as z from 'zod';

import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  Max,
  Min,
  registerDecorator,
  // Validate,
  ValidateIf,
  ValidationOptions,
} from 'class-validator';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { GenderEnum, RoleEnum } from 'src/common/enum/user.enum';

@ValidatorConstraint({ name: 'matchKey', async: false })
export class matchKey implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    // console.log(args);

    return value === args.object[args.constraints[0]]; // for async validations you must return a Promise<boolean> here
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `${args.property} is not matched ${args.constraints[0]}`;
  }
}

export function IsMatch(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: matchKey,
    });
  };
}

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @Length(5, 30)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 30)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsInt()
  @Min(18)
  @Max(60)
  age: number;

  // @Validate(MatchPassword)
  @IsMatch(['password'])
  @ValidateIf((data: CreateUserDTO) => {
    return Boolean(data.password);
  })
  cPassword: string;

  @IsPhoneNumber()
  @IsOptional()
  @IsString()
  @Length(11)
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @IsEnum(RoleEnum)
  @IsOptional()
  role?: RoleEnum;

  @IsString()
  @IsOptional()
  profilePicture?: string;
}
/**************************************************************************/
// export const signUpSchema = z
//   .strictObject({
//     name: z.string(),
//     email: z.string().email(),
//     password: z.string(),
//     age: z.number(),
//     cPassword: z.string(),
//   })
//   .superRefine((args, ctx) => {
//     if (args.cPassword !== args.password) {
//       ctx.addIssue({
//         code: 'custom',
//         path: ['cPassword'],
//         message: 'password not matched confirm password',
//       });
//     }
//   });

// export type CreateUserDTO = z.infer<typeof signUpSchema>;

/**************************************************************************/

export class SignInDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
