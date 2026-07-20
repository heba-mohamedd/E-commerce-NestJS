import { BadRequestException, Injectable } from '@nestjs/common';
import {
  confirmEmailDto,
  CreateUserDTO,
  forgetPasswordDto,
  resendOtpDTO,
  resetPasswordDTO,
  SignInDTO,
  updatePasswordDTO,
} from './dto/create-user.dto';
import UserRepository from 'src/DB/repositories/user.repository';
import { encrypt } from 'src/common/utils/security/encrypt.security';
import type { HUserDocument } from 'src/DB/models/user.model';
import { generateOtp, sendEmail } from 'src/common/utils/email/send.email';
import { EmailEnum } from 'src/common/enum/email.enum';
import { emailTemplete } from 'src/common/utils/email/email.templete';
import { eventEmitter } from 'src/common/utils/email/email.events';
import RedisService from 'src/common/services/redis.service';
import { Compare, Hash } from 'src/common/utils/security/hash.security';
import TokenService from 'src/common/services/token.service';
import { ProviderEnum, RoleEnum } from 'src/common/enum/user.enum';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { S3Service } from 'src/common/services/s3.service';

@Injectable()
export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _redisService: RedisService,
    private readonly _tokenService: TokenService,
    private readonly _s3Service: S3Service,
  ) {}
  // async getUsers(id: number): Promise<object> {
  //   return await this._userRepository.find({
  //     filter: {
  //       _id: id,
  //     },
  //   });
  // }

  // async signUp(body: CreateUserDTO): Promise<object> {
  //   const {
  //     firstName,
  //     lastName,
  //     email,
  //     password,
  //     // cPassword,
  //     age,
  //     phone,
  //     address,
  //   } = body;
  //   await this._userRepository.checkUserAccount(email);
  //   const userData: Partial<HUserDocument> = {
  //     firstName,
  //     lastName,
  //     email,
  //     password,
  //     age,
  //   };
  //   if (phone) userData.phone = encrypt(phone);
  //   if (address) userData.address = address;

  //   const otp = generateOtp();
  //   console.log(otp);

  //   eventEmitter.emit(EmailEnum.confirmEmail, async () => {
  //     await sendEmail({
  //       to: email,
  //       subject: 'confirmation Email',
  //       html: emailTemplete(otp),
  //     });
  //     await this._redisService.setValue({
  //       key: this._redisService.otp_key({
  //         email,
  //         subject: EmailEnum.confirmEmail,
  //       }),
  //       value: await Hash({
  //         plainText: `${otp}`,
  //       }),
  //       ttl: 2 * 60,
  //     });

  //     await this._redisService.setValue({
  //       key: this._redisService.max_otp_key({
  //         email,
  //         subject: EmailEnum.confirmEmail,
  //       }),
  //       value: 1,
  //       ttl: 30 * 60,
  //     });
  //   });

  //   const user = await this._userRepository.create(userData);
  //   return user;
  // }

  // async signIn(body: SignInDTO): Promise<object> {
  //   const { email, password }: SignInDTO = body;
  //   if (!email && !password)
  //     throw new BadRequestException('Email & Password are required');
  //   if (!email) throw new BadRequestException('Email is required');
  //   if (!password) throw new BadRequestException('Password is required');

  //   const user = await this._userRepository.findOne({
  //     filter: {
  //       email,
  //       provider: ProviderEnum.system,
  //     },
  //   });
  //   if (!user) {
  //     throw new BadRequestException('user not exist');
  //   }

  //   const ttl = await this._redisService.get_ttl(
  //     this._redisService.blocked_login_key(email),
  //   );
  //   if (ttl && ttl > 0) {
  //     throw new BadRequestException(
  //       `you are blocked, please try again after ${ttl} saconds`,
  //     );
  //   }

  //   if (!(await Compare({ plainText: password, cipherText: user.password }))) {
  //     const attempts = await this._redisService.incr(
  //       this._redisService.count_login_key(email),
  //     );

  //     if (attempts === 1) {
  //       await this._redisService.expire(
  //         this._redisService.count_login_key(email),
  //         2 * 60,
  //       );
  //     }

  //     if (attempts && attempts >= 5) {
  //       await this._redisService.setValue({
  //         key: this._redisService.blocked_login_key(email),
  //         value: 1,
  //         ttl: 5 * 60,
  //       });
  //     }
  //     throw new BadRequestException('Invalid Password');
  //   }
  //   const jwtid = randomUUID();

  //   const access_token = await this._tokenService.GenerateToken({
  //     payload: { id: user._id, email: user.email },

  //     options: {
  //       expiresIn: '1h',
  //       jwtid,
  //       secret:
  //         user?.role == RoleEnum.user
  //           ? process.env.ACCESS_SECRET_KEY_USER!
  //           : process.env.ACCESS_SECRET_KEY_ADMIN!,
  //     },
  //   });
  //   const refresh_token = await this._tokenService.GenerateToken({
  //     payload: { id: user._id, email: user.email },

  //     options: {
  //       expiresIn: '1y',
  //       jwtid,
  //       secret:
  //         user?.role == RoleEnum.user
  //           ? process.env.REFRESH_SECRET_KEY_USER!
  //           : process.env.REFRESH_SECRET_KEY_ADMIN!,
  //     },
  //   });

  //   await this._redisService.deleteKey(
  //     this._redisService.count_login_key(email),
  //   );

  //   return { access_token, refresh_token };
  // }

  // async getAllUsers() {
  //   return this._userRepository.find({ filter: {} });
  // }
  // // async getProfile(req: Request) {
  // //   return this._userRepository.findById(req.user?._id!);
  // // }
  // getProfile(user: HUserDocument) {
  //   return user;
  // }

  // async uploadProfileImage(file: Express.Multer.File) {
  //   return await this._s3Service.uploadFile({ file: file, path: 'nest' });
  // }

  sendEmailOtp = async ({
    email,
    subject,
  }: {
    email: string;
    subject: EmailEnum;
  }) => {
    const isBlocked = await this._redisService.get_ttl(
      this._redisService.block_otp_key({ email, subject }),
    );
    if (isBlocked && isBlocked > 0) {
      throw new Error(
        `you are blocked ,please try again after ${isBlocked} seconds`,
      );
    }
    const ttl = await this._redisService.get_ttl(
      this._redisService.otp_key({ email, subject }),
    );
    if (ttl && ttl > 0) {
      throw new Error(`you can resend otp after ${ttl} seconds`);
    }
    const maxOtp = await this._redisService.getValue(
      this._redisService.max_otp_key({ email, subject }),
    );
    if (maxOtp >= 3) {
      await this._redisService.setValue({
        key: this._redisService.block_otp_key({ email, subject }),
        value: 1,
        ttl: 15 * 60,
      });
      throw new Error(`Too many attempts. Please try again later.`);
    }

    const otp = await generateOtp();

    // Fire-and-forget: send email asynchronously via event
    eventEmitter.emit(subject, async () => {
      await sendEmail({
        to: email,
        subject: 'E - Commerce ',
        html: emailTemplete(otp),
      });
    });

    // OTP storage MUST be outside the event callback to guarantee it's saved
    await this._redisService.setValue({
      key: this._redisService.otp_key({ email, subject }),
      value: await Hash({ plainText: `${otp}` }),
      ttl: 2 * 60,
    });
    const newCount = await this._redisService.incr(
      this._redisService.max_otp_key({ email, subject }),
    );
    if (newCount === 1) {
      await this._redisService.expire(
        this._redisService.max_otp_key({ email, subject }),
        6 * 60,
      );
    }
  };
  signUp = async (body: CreateUserDTO) => {
    const {
      firstName,
      lastName,
      email,
      password,
      cPassword,
      gender,
      age,
      address,
      phone,
    } = body;

    if (password !== cPassword) {
      throw new BadRequestException(' password not matched');
    }
    await this._userRepository.checkUserAccount(email);

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

    const user = await this._userRepository.create({
      firstName,
      lastName,
      email,
      password,
      gender,
      age,
      address,
      phone: phone ? encrypt(phone!) : null,
    } as Partial<HUserDocument>);

    return {
      message: 'User signed up Successfully',
      success: true,
      data: user,
    };
  };
  confirmEmail = async (body: confirmEmailDto) => {
    const { email, code } = body;
    const otpValue = await this._redisService.getValue(
      this._redisService.otp_key({ email, subject: EmailEnum.confirmEmail }),
    );
    if (!otpValue) {
      throw new BadRequestException('otp expired');
    }
    if (!(await Compare({ plainText: code, cipherText: otpValue }))) {
      throw new BadRequestException('Invalid Otp');
    }

    const user = await this._userRepository.findOneAndUpdate({
      filter: {
        email,
        confirmed: { $exists: false },
        provider: ProviderEnum.system,
      },
      update: {
        confirmed: true,
      },
    });

    if (!user) {
      throw new BadRequestException('user not Exist');
    }

    await this._redisService.deleteKey(
      this._redisService.otp_key({ email, subject: EmailEnum.confirmEmail }),
    );

    return { message: 'User confirmed Successfully', user };
  };
  getProfile = (req: any) => {
    return req.user;
  };
  // signUpWithGmail = async (req: Request, res: Response, next: NextFunction) => {
  //   const { idToken } = req.body;
  //   const client = new OAuth2Client(WEB_CLIENT_ID);
  //   const ticket = await client.verifyIdToken({
  //     idToken,
  //     audience: WEB_CLIENT_ID!,
  //   });
  //   const payload = ticket.getPayload();
  //   if (!payload) {
  //     throw new Error("Invalid Google token", { cause: 400 });
  //   }
  //   const { name, email, email_verified } = payload as TokenPayload;
  //   if (!email) {
  //     throw new Error("Email not provided by Google", { cause: 400 });
  //   }
  //   if (!email_verified) {
  //     throw new Error("Email not verified with Google", { cause: 400 });
  //   }
  //   let user = await this._userRepository.findOne({
  //     filter: { email },
  //   });

  //   if (!user) {
  //     user = await this._userRepository.create({
  //       email,
  //       userName: name,
  //       confirmed: true,
  //       provider: ProviderEnum.google,
  //     } as Partial<IUser>);
  //   }

  //   if (user.provider !== ProviderEnum.google) {
  //     throw new Error("please log in using your original provider", {
  //       cause: 400,
  //     });
  //   }

  //   const access_token = this._tokenService.GenerateToken({
  //     payload: { id: user._id, email: user.email, provider: user.provider },
  //     secretOrPrivateKey:
  //       user?.role == RoleEnum.user
  //         ? ACCESS_SECRET_KEY_USER!
  //         : ACCESS_SECRET_KEY_ADMIN!,
  //     options: { expiresIn: "1h" },
  //   });

  //   return res.status(200).json({
  //     message: "sign in success",
  //     data: { access_token, user },
  //   });
  // };
  signIn = async (body: SignInDTO) => {
    const { email, password } = body;
    if (!email && !password)
      throw new BadRequestException('Email & Password are required');
    if (!email) throw new BadRequestException('Email is required');
    if (!password) throw new BadRequestException('Password is required');

    const user = await this._userRepository.findOne({
      filter: {
        email,
        confirmed: { $exists: true },
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

    return {
      success: 'User signed in Successfully',
      access_token,
      refresh_token,
    };
  };

  forgetPassword = async (body: forgetPasswordDto) => {
    const { email } = body;
    if (!email) throw new BadRequestException('Email is required');

    const user = await this._userRepository.findOne({
      filter: {
        email,
        confirmed: { $exists: true },
        provider: ProviderEnum.system,
      },
    });
    if (!user) {
      throw new BadRequestException('user not exist');
    }

    await this.sendEmailOtp({ email, subject: EmailEnum.forgetPassword });

    return {
      message: 'success',
    };
  };
  resendOtp = async (body: resendOtpDTO) => {
    const { email } = body;

    const user = await this._userRepository.findOne({
      filter: {
        email,
        confirmed: { $exists: false },
        provider: ProviderEnum.system,
      },
    });
    if (!user) {
      throw new BadRequestException('user not Exist or already Confirmed');
    }
    await this.sendEmailOtp({ email, subject: EmailEnum.confirmEmail });
    return { message: 'OTP sent successfully' };
  };

  resetPassword = async (body: resetPasswordDTO) => {
    const { email, code, password } = body;
    if (!email) throw new BadRequestException('Email is required');
    const otpValue = await this._redisService.getValue(
      this._redisService.otp_key({ email, subject: EmailEnum.forgetPassword }),
    );
    if (!otpValue) {
      throw new BadRequestException('otp expired');
    }

    if (!(await Compare({ plainText: code, cipherText: otpValue }))) {
      throw new BadRequestException('Invalid Otp');
    }

    const user = await this._userRepository.findOneAndUpdate({
      filter: {
        email,
        confirmed: { $exists: true },
        provider: ProviderEnum.system,
      },
      update: {
        password: await Hash({ plainText: password }),
        changeCredential: new Date(),
      },
    });
    if (!user) {
      throw new BadRequestException('user not exist');
    }

    await this._redisService.deleteKey(
      this._redisService.otp_key({ email, subject: EmailEnum.forgetPassword }),
    );

    return { message: 'success' };
  };

  updatePassword = async (body: updatePasswordDTO, req: any) => {
    const { oldPassword, newPassword } = body;
    if (!newPassword) {
      throw new BadRequestException('New password is required');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('New password must be different');
    }

    if (
      !(await Compare({
        plainText: oldPassword,
        cipherText: req.user!.password,
      }))
    ) {
      throw new Error('Invalid Password', { cause: 400 });
    }

    req.user!.password = newPassword;
    req.user!.changeCredential = new Date();
    await req.user!.save();

    // to remove new password from response
    req.user!.password = undefined as any;

    return { message: 'Password updated successfully', data: req.user };
  };

  updateProfilePicture = async (file: Express.Multer.File, req: any) => {
    const profilePicture = await this._s3Service.uploadFile({
      file: file,
      path: 'nest',
    });

    const user = await this._userRepository.findOneAndUpdate({
      filter: { _id: req.user!._id },
      update: { profilePicture },
    });
    return { message: 'Profile picture updated successfully', data: user };
  };

  logout = async (query: any, req: any) => {
    const { flag } = query;

    if (flag === 'all') {
      req.user!.changeCredential = new Date();
      await req.user!.save();

      const keyList = await this._redisService.keys(
        this._redisService.get_key(req.user!._id),
      );
      if (keyList && keyList.length) {
        await Promise.all(keyList.map((k) => this._redisService.deleteKey(k)));
      }
    } else {
      await this._redisService.setValue({
        key: this._redisService.revoked_key({
          userId: req.user!._id,
          jti: req.decoded!.jti ?? '',
        }),
        value: `${req.decoded!.jti ?? ''}`,
        ttl:
          (req.decoded!.exp ?? Math.floor(Date.now() / 1000)) -
          Math.floor(Date.now() / 1000),
      });
    }

    return { message: 'done' };
  };
}
