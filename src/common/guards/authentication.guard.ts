import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';
import TokenService from 'src/common/services/token.service';
import { TokenEnum } from '../enum/token.enum';
import { Reflector } from '@nestjs/core';
import { token_type_key } from '../decorator/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req: any;
    let authorization: string = '';

    const tokenType = this.reflector.get<TokenEnum>(
      token_type_key,
      context.getHandler(),
    );

    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
      authorization = req.headers.authorization;
    } else if (context.getType() === 'rpc') {
    } else if (context.getType() === 'ws') {
    }

    if (!authorization) {
      throw new BadRequestException('token not exist');
    }

    const [prefix, token]: string[] = authorization.split(' ');

    if (!token || !prefix) {
      throw new BadRequestException('token not found');
    }

    // getSignature
    const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } =
      this.tokenService.getSignature(prefix);

    const secret_key =
      tokenType === TokenEnum.access_token
        ? ACCESS_SECRET_KEY
        : REFRESH_SECRET_KEY;

    // decodeToken_and_fetchUser
    try {
      const { user, decoded } =
        await this.tokenService.decodeToken_and_fetchUser(token, secret_key);

      req.user = user;
      req.decoded = decoded;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('invalid token');
      }
      throw error;
    }

    return true;
  }
}
