// import {
//   BadRequestException,
//   Injectable,
//   NestMiddleware,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
// import TokenService from 'src/common/services/token.service';
// import { TokenEnum } from '../enum/token.enum';

// @Injectable()
// export class AuthenticationMiddleware implements NestMiddleware {
//   private readonly tokenType: TokenEnum = TokenEnum.access_token;

//   constructor(private readonly tokenService: TokenService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     const { authorization } = req.headers;
//     if (!authorization) {
//       throw new BadRequestException('token not exist');
//     }
//     const [prefix, token]: string[] = authorization.split(' ');

//     if (!token || !prefix) {
//       throw new BadRequestException('token not found');
//     }

//     //getSignature
//     const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } =
//       this.tokenService.getSignature(prefix);

//     const secret_key =
//       this.tokenType === TokenEnum.access_token
//         ? ACCESS_SECRET_KEY
//         : REFRESH_SECRET_KEY;

//     try {
//       // decodeToken_and_fetchUser
//       const { user, decoded } =
//         await this.tokenService.decodeToken_and_fetchUser(token, secret_key);
//       req.user = user;
//       req.decoded = decoded;

//       next();
//     } catch (error) {
//       if (error instanceof TokenExpiredError) {
//         throw new UnauthorizedException('token expired, please login again');
//       }
//       if (error instanceof JsonWebTokenError) {
//         throw new UnauthorizedException('invalid token');
//       }
//       throw error;
//     }
//   }
// }
