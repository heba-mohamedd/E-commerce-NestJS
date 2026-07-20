import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  confirmEmailDto,
  CreateUserDTO,
  forgetPasswordDto,
  resendOtpDTO,
  resetPasswordDTO,
  SignInDTO,
  updatePasswordDTO,
} from './dto/create-user.dto';
import type { Request } from 'express';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Auth, Roles, TokenType } from 'src/common/decorator/auth.decorator';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { RoleEnum } from 'src/common/enum/user.enum';

import { FileInterceptor } from '@nestjs/platform-express';
import multerCloud from 'src/common/utils/multer.utils';
import { multer_enum } from 'src/common/enum/multer.enum';
// import { ZodValidationPipe } from 'src/common/pipes/validation.pipe';

@Controller('user')

// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     forbidNonWhitelisted: true,
//   }),
// )
export class UserController {
  constructor(private readonly userService: UserService) {}
  // @Get('profile')
  // @TokenType() //  get token type from decorator (order is important)
  // @Roles([RoleEnum.user, RoleEnum.admin]) // get roles from decorator (order is important)
  // @UseGuards(AuthenticationGuard, AuthorizationGuard) // order is important (AuthenticationGuard must be before AuthorizationGuard)
  // // @SetMetadata('tokenType', TokenEnum.access_token) // old way to set metadata before custom decorators
  // getProfile(@Req() req: Request) {
  //   return this.userService.getProfile(req);
  // }

  // @Get('profile')
  // @Auth({
  //   token_type: TokenEnum.access_token,
  //   access_roles: [RoleEnum.user, RoleEnum.admin],
  // })
  // getProfile(@User() user: HUserDocument) {
  //   return this.userService.getProfile(user);
  // }

  // @Get('profile')
  // @TokenType() //  get token type from decorator (order is important)
  // @UseGuards(AuthenticationGuard) // order is important (AuthenticationGuard must be before AuthorizationGuard)
  // getProfile(@User() user: HUserDocument) {
  //   return this.userService.getProfile(user);
  // }

  // @Get(':id')
  // getUsers(
  //   @Param(
  //     'id',
  //     new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
  //   )
  //   id: number,
  // ): any {
  //   return this.userService.getUsers(id);
  // }

  // @Post()
  // // @UsePipes(
  // //   new ValidationPipe({
  // //     whitelist: true,s
  // //     forbidNonWhitelisted: true,
  // //   }),
  // // )
  // craeteUser(
  //   //     @Body(
  //   //   new ValidationPipe({
  //   //     whitelist: true,
  //   //     forbidNonWhitelisted: true,
  //   //     errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
  //   //   }),
  //   // )
  //   @Body()
  //   body: CreateUserDTO,
  // ): any {
  //   // throw new BadRequestException();
  //   return this.userService.craeteUser(body);
  // }

  // @Get()
  // getAllUsers() {
  //   return this.userService.getAllUsers();
  // }

  @Post('signUp')
  signUp(@Body() body: CreateUserDTO) {
    return this.userService.signUp(body);
  }

  @Post('signIn')
  signIn(@Body() body: SignInDTO) {
    return this.userService.signIn(body);
  }

  @Patch('confirmEmail')
  confirmEmail(@Body() body: confirmEmailDto) {
    return this.userService.confirmEmail(body);
  }

  @Post('forgetPassword')
  forgetPassword(@Body() body: forgetPasswordDto) {
    return this.userService.forgetPassword(body);
  }

  @Patch('resend-otp')
  resendOtp(@Body() body: resendOtpDTO) {
    return this.userService.resendOtp(body);
  }

  @Post('resetPassword')
  resetPassword(@Body() body: resetPasswordDTO) {
    return this.userService.resetPassword(body);
  }

  @Post('updatePassword')
  @Auth()
  @UseGuards(AuthenticationGuard)
  updatePassword(@Body() body: updatePasswordDTO, @Req() req: any) {
    return this.userService.updatePassword(body, req);
  }

  @Get('profile')
  @Auth()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles([RoleEnum.user])
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req);
  }

  // @Post('upload')
  // @UseInterceptors(
  //   FilesInterceptor('files', 2, multerCloud({ store_type: Store_Enum.disk })),
  // )
  // uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
  //   return files;
  // }

  // @Post('upload')
  // @UseInterceptors(
  //   // FilesInterceptor('files', 2, multerCloud({ store_type: Store_Enum.disk })),
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'avatar', maxCount: 2 },
  //       { name: 'background', maxCount: 1 },
  //     ],
  //     multerCloud({ store_type: Store_Enum.disk }),
  //   ),
  // )
  // uploadFiles(
  //   @UploadedFiles() avatar: Express.Multer.File[],
  //   @UploadedFile() background: Express.Multer.File,
  // ) {
  //   return { avatar, background };
  // }

  @Post('upload-s3')
  @TokenType()
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ custom_types: multer_enum.image })),
  )
  updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.userService.updateProfilePicture(file, req);
  }

  @Post('logout')
  @TokenType()
  @UseGuards(AuthenticationGuard)
  logout(@Query() query: any, @Req() req: any) {
    return this.userService.logout(query, req);
  }
}
