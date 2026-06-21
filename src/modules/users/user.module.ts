import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel } from 'src/DB/models/user.model';
import UserRepository from 'src/DB/repositories/user.repository';
import { RedisModule } from 'src/common/redis/redis.module';
import RedisService from 'src/common/services/redis.service';
import TokenService from 'src/common/services/token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModel, RedisModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    RedisService,
    TokenService,
    JwtService,
  ],
  exports: [],
})
export class UserModule {}
