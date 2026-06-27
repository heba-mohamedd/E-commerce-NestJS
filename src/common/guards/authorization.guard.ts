import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';
import TokenService from 'src/common/services/token.service';
import { Reflector } from '@nestjs/core';
import { access_roles_key } from '../decorator/auth.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      let req: any;

      const Roles = this.reflector.get(
        access_roles_key,
        context.getHandler(),
      ) as string[];

      if (context.getType() === 'http') {
        req = context.switchToHttp().getRequest();
      } else if (context.getType() === 'rpc') {
      } else if (context.getType() === 'ws') {
      }

      if (!Roles.includes(req.user.role)) {
        throw new UnauthorizedException();
      }
      return true;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException();
      }
      throw error;
    }
  }
}
