import { Model } from 'mongoose';
import BaseRepository from './base.repository';
import { User } from '../models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';

class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) protected model: Model<User>) {
    super(model);
  }

  async checkUserAccount(email: string): Promise<void> {
    const user = await this.findOne({
      filter: { email },
    });

    if (user) {
      throw new ConflictException('Email already exists');
    }
  }
}

export default UserRepository;
