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
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, SignInDTO } from './dto/create-user.dto';
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

  @Post('signUp')
  signUp(@Body() body: CreateUserDTO) {
    return this.userService.signUp(body);
  }
  @Post('signIn')
  signIn(@Body() body: SignInDTO) {
    return this.userService.signIn(body);
  }
}
