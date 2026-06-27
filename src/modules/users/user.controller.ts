import {
  // BadRequestException,
  Body,
  Controller,
  Get,
  // HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, SignInDTO } from './dto/create-user.dto';
import type { Request } from 'express';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Auth, Roles, TokenType } from 'src/common/decorator/auth.decorator';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { RoleEnum } from 'src/common/enum/user.enum';
import { User } from 'src/common/decorator/user.decorator';
import type { HUserDocument } from 'src/DB/models/user.model';
import { TokenEnum } from 'src/common/enum/token.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import multerCloud from 'src/common/utils/multer.utils';
import { Store_Enum } from 'src/common/enum/multer.enum';
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

  @Get('profile')
  @Auth({
    token_type: TokenEnum.access_token,
    access_roles: [RoleEnum.user, RoleEnum.admin],
  })
  getProfile(@User() user: HUserDocument) {
    return this.userService.getProfile(user);
  }

  // @Get('profile')
  // @TokenType() //  get token type from decorator (order is important)
  // @UseGuards(AuthenticationGuard) // order is important (AuthenticationGuard must be before AuthorizationGuard)
  // getProfile(@User() user: HUserDocument) {
  //   return this.userService.getProfile(user);
  // }

  @Get(':id')
  getUsers(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): any {
    return this.userService.getUsers(id);
  }

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

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post('signUp')
  signUp(@Body() body: CreateUserDTO) {
    return this.userService.signUp(body);
  }

  @Post('signIn')
  signIn(@Body() body: SignInDTO) {
    return this.userService.signIn(body);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ store_type: Store_Enum.disk })),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return file;
  }
}
