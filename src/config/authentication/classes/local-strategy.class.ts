import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/components/user/models/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  'generate-token',
) {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req: any, username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({
      email: username,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }
    return user._id;
  }
}
