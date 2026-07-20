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
  // Validate,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common/decorator/user.decorator';

import { GenderEnum, RoleEnum } from 'src/common/enum/user.enum';

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

export class confirmEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class forgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class resendOtpDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class resetPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

export class updatePasswordDTO {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}

export class updateProfilePictureDTO {
  @IsString()
  @IsNotEmpty()
  profilePicture: string;
}
