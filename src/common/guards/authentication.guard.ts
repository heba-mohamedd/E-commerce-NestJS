// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   BadRequestException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class AuthenticationGuard implements CanActivate {
//   constructor(private reflector = Reflector) {}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     let req: any;
//     let authorization: string = '';
//     if (context.getType() === 'http') {
//       req = context.switchToHttp().getRequest();
//       authorization = req.headers.authorization;
//     }
//     const token_type = this.reflector.get(
//       'token_type_key',
//       context.getHandler(),
//     );
//     if (!authorization) {
//       throw new BadRequestException('token not found');
//     }
//     const [prefix, token] = authorization.split(' ');
//     if (!token || !prefix) {
//       throw new BadRequestException('token not exist or prefix not correct');
//     }

//     return true;
//   }
// }
