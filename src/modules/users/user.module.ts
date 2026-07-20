import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/DB/models/user.model';
import UserRepository from 'src/DB/repositories/user.repository';
import { RedisModule } from 'src/common/redis/redis.module';
import RedisService from 'src/common/services/redis.service';
import TokenService from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
// import { MulterModule } from '@nestjs/platform-express';
// import multer from 'multer';
// import type { Request } from 'express';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [
    UserModel,
    RedisModule,
    // for local storage if i want to apply multer on all routes in this module
    // MulterModule.register({
    //   storage: multer.diskStorage({
    //     destination: (
    //       req: Request,
    //       file: Express.Multer.File,
    //       cb: Function,
    //     ) => {
    //       cb(null, './upload');
    //     },
    //     filename(req: Request, file: Express.Multer.File, cb: Function) {
    //       cb(null, Date.now() + file.originalname);
    //     },
    //   }),
    // }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    RedisService,
    TokenService,
    JwtService,
    AuthenticationGuard,
    S3Service,
  ],
  exports: [],
})
export class UserModule {
  // configure(consumer: MiddlewareConsumer) {
  //   // only for get request
  //   consumer
  //     .apply(AuthenticationMiddleware)
  //     // .exclude({ path: 'user/signIn', method: RequestMethod.POST })
  //     // .forRoutes(UserController);
  //     // exclude get request
  //     // .exclude({ path: 'users', method: RequestMethod.GET }, 'users/{*splat}')
  //     // for all requests of the controller
  //     // .forRoutes(UserController);
  //     // for specific get request
  //     .forRoutes({ path: 'user/profile', method: RequestMethod.GET });
  //   // for all requests of the controller (this is what is written in the user.route.ts file)
  //   // .forRoutes('user');
  // }
}
