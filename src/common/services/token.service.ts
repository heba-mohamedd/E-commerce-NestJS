import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
class TokenService {
  constructor(private jwtService: JwtService) {}

  GenerateToken = ({
    payload,
    options,
  }: {
    payload: object;
    options?: JwtSignOptions;
  }): Promise<string> => {
    return this.jwtService.signAsync(payload, options);
  };

  VerifyToken = ({
    token,
    options,
  }: {
    token: string;
    options?: JwtVerifyOptions;
  }): Promise<JwtPayload> => {
    return this.jwtService.verifyAsync(token, options);
  };

  getSignature = (prefix: string) => {
    let ACCESS_SECRET_KEY: string = '';
    let REFRESH_SECRET_KEY: string = '';

    if (prefix == process.env.PREFIX_USER) {
      ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY_USER!;
      REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY_USER!;
    } else if (prefix == process.env.PREFIX_ADMIN) {
      ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY_ADMIN!;
      REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY_ADMIN!;
    } else {
      throw new BadRequestException('invalid token Prefix');
    }

    return { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY };
  };

  //    decodeToken_and_fetchUser = async (token: string) => {

  //   const decoded = this.VerifyToken({
  //     token: token,
  //     secretOrPublicKey: ACCESS_SECRET_KEY,
  //   });

  //   if (!decoded || !decoded?.id) {
  //     throw new AppError("inValid token");
  //   }

  //   const user = await _userModel.findOne({
  //     filter: {
  //       _id: decoded.id,
  //     },
  //   });
  //   if (!user) {
  //     throw new AppError("user not exist", 404);
  //   }

  //   return { user, decoded };
  // };
  // authentication = async (req: Request, res: Response, next: NextFunction) => {
  //   const { authorization } = req.headers;

  //   const { user, decoded } = await decodeToken_and_fetchUser(authorization!);

  //   if (
  //     user?.changeCredential &&
  //     user?.changeCredential?.getTime() > decoded.iat! * 1000
  //   ) {
  //     throw new AppError('inValid token');
  //   }

  //   const revokeToken = await redisService.getValue(
  //     redisService.revoked_key({ userId: user._id, jti: decoded.jti! }),
  //   );

  //   if (revokeToken) {
  //     throw new AppError('inValid token revoked');
  //   }
  //   req.user = user;
  //   req.decoded = decoded;
  //   next();
  // };
}

export default TokenService;
