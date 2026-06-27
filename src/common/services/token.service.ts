import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import UserRepository from 'src/DB/repositories/user.repository';

@Injectable()
class TokenService {
  constructor(
    private jwtService: JwtService,
    private readonly _userRepository: UserRepository,
  ) {}

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
  }): Promise<string | JwtPayload> => {
    return this.jwtService.verifyAsync(token, options);
  };

  getSignature = (prefix: string) => {
    let ACCESS_SECRET_KEY: string = '';
    let REFRESH_SECRET_KEY: string = '';

    if (prefix === process.env.PREFIX_USER) {
      ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY_USER!;
      REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY_USER!;
    } else if (prefix === process.env.PREFIX_ADMIN) {
      ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY_ADMIN!;
      REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY_ADMIN!;
    } else {
      throw new BadRequestException('invalid token Prefix');
    }

    return { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY };
  };

  decodeToken_and_fetchUser = async (token: string, secret: string) => {
    const decoded = (await this.VerifyToken({
      token,
      options: { secret },
    })) as any;

    if (!decoded?.id) {
      throw new BadRequestException('inValid token');
    }

    const user = await this._userRepository.findOne({
      filter: {
        _id: decoded.id,
      },
    });
    if (!user) {
      throw new BadRequestException('user not exist');
    }
    // if (!decoded.iat) {
    //   throw new BadRequestException('invalid token');
    // }
    // if (
    //   user?.changeCredential &&
    //   user?.changeCredential?.getTime() > decoded.iat * 1000
    // ) {
    //   throw new BadRequestException('inValid token');
    // }

    return { user, decoded };
  };
  // authentication = (tokenType: TokenEnum = TokenEnum.access_token) => {
  //   return async (req: Request, res: Response, next: NextFunction) => {
  //     const { authorization } = req.headers;
  //     if (!authorization) {
  //       throw new BadRequestException('token not exist');
  //     }
  //     const [prefix, token]: string[] = authorization.split(' ');

  //     if (!token || !prefix) {
  //       throw new BadRequestException('token not found');
  //     }

  //     const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } =
  //       await this.getSignature(prefix);
  //     let secret_key =
  //       tokenType == TokenEnum.access_token
  //         ? ACCESS_SECRET_KEY
  //         : REFRESH_SECRET_KEY;
  //     const { user, decoded } = await this.decodeToken_and_fetchUser(
  //       token,
  //       secret_key,
  //     );

  //     req.user = user;
  //     req.decoded = decoded;
  //     next();
  //   };
  // };
}

export default TokenService;
