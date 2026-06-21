import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDTO, SignInDTO } from './dto/create-user.dto';
import UserRepository from 'src/DB/repositories/user.repository';
import { encrypt } from 'src/common/utils/security/encrypt.security';
import { HUserDocument } from 'src/DB/models/user.model';
import { generateOtp, sendEmail } from 'src/common/utils/email/send.email';
import { EmailEnum } from 'src/common/enum/email.enum';
import { emailTemplete } from 'src/common/utils/email/email.templete';
import { eventEmitter } from 'src/common/utils/email/email.events';
import RedisService from 'src/common/services/redis.service';
import { Compare, Hash } from 'src/common/utils/security/hash.security';
import TokenService from 'src/common/services/token.service';
import { ProviderEnum, RoleEnum } from 'src/common/enum/user.enum';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _redisService: RedisService,
    private readonly _tokenService: TokenService,
  ) {}
  async getUsers(id: number): Promise<object> {
    return await this._userRepository.find({
      filter: {
        _id: id,
      },
    });
  }

  async signUp(body: CreateUserDTO): Promise<object> {
    const {
      firstName,
      lastName,
      email,
      password,
      // cPassword,
      age,
      phone,
      address,
    } = body;
    await this._userRepository.checkUserAccount(email);
    const userData: Partial<HUserDocument> = {
      firstName,
      lastName,
      email,
      password,
      age,
    };
    if (phone) userData.phone = encrypt(phone);
    if (address) userData.address = address;

    const otp = generateOtp();
    console.log(otp);

    eventEmitter.emit(EmailEnum.confirmEmail, async () => {
      await sendEmail({
        to: email,
        subject: 'confirmation Email',
        html: emailTemplete(otp),
      });
      await this._redisService.setValue({
        key: this._redisService.otp_key({
          email,
          subject: EmailEnum.confirmEmail,
        }),
        value: await Hash({
          plainText: `${otp}`,
        }),
        ttl: 2 * 60,
      });

      await this._redisService.setValue({
        key: this._redisService.max_otp_key({
          email,
          subject: EmailEnum.confirmEmail,
        }),
        value: 1,
        ttl: 30 * 60,
      });
    });

    const user = await this._userRepository.create(userData);
    return user;
  }

  async signIn(body: SignInDTO): Promise<object> {
    const { email, password }: SignInDTO = body;
    if (!email && !password)
      throw new BadRequestException('Email & Password are required');
    if (!email) throw new BadRequestException('Email is required');
    if (!password) throw new BadRequestException('Password is required');

    const user = await this._userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.system,
      },
    });
    if (!user) {
      throw new BadRequestException('user not exist');
    }

    const ttl = await this._redisService.get_ttl(
      this._redisService.blocked_login_key(email),
    );
    if (ttl && ttl > 0) {
      throw new BadRequestException(
        `you are blocked, please try again after ${ttl} saconds`,
      );
    }

    if (!(await Compare({ plainText: password, cipherText: user.password }))) {
      const attempts = await this._redisService.incr(
        this._redisService.count_login_key(email),
      );

      if (attempts === 1) {
        await this._redisService.expire(
          this._redisService.count_login_key(email),
          2 * 60,
        );
      }

      if (attempts && attempts >= 5) {
        await this._redisService.setValue({
          key: this._redisService.blocked_login_key(email),
          value: 1,
          ttl: 5 * 60,
        });
      }
      throw new BadRequestException('Invalid Password');
    }
    const jwtid = randomUUID();

    const access_token = await this._tokenService.GenerateToken({
      payload: { id: user._id, email: user.email },

      options: {
        expiresIn: '1h',
        jwtid,
        secret:
          user?.role == RoleEnum.user
            ? process.env.ACCESS_SECRET_KEY_USER!
            : process.env.ACCESS_SECRET_KEY_ADMIN!,
      },
    });
    const refresh_token = await this._tokenService.GenerateToken({
      payload: { id: user._id, email: user.email },

      options: {
        expiresIn: '1y',
        jwtid,
        secret:
          user?.role == RoleEnum.user
            ? process.env.REFRESH_SECRET_KEY_USER!
            : process.env.REFRESH_SECRET_KEY_ADMIN!,
      },
    });

    await this._redisService.deleteKey(
      this._redisService.count_login_key(email),
    );

    return { access_token, refresh_token };
  }
}
