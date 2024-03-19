import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserData } from './classes/create-user.class';
import { User, UserDocument } from './models/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserData } from './classes/update-user.class';
import { MailSender } from 'src/utils/classes/mail-sender.class';
import { randomUUID } from 'crypto';
import { CustomToken } from 'src/utils/classes/custom-token.class';

@Injectable()
export class UserService {
  private secretKey = process.env.JWT_SECRET_PASSWORD;
  private appName = process.env.APP_NAME;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailSender: MailSender,
    private customToken: CustomToken,
  ) {}

  async createUser(createUserData: CreateUserData) {
    const { email } = createUserData;
    const checkUserEmail = await this.userModel.findOne({
      email,
    });
    if (checkUserEmail) {
      throw new HttpException(
        'already exists a user with this e-mail',
        HttpStatus.BAD_REQUEST,
      );
    }
    const temporaryPassword = randomUUID().substring(0, 16);
    const hash = await this.hashPassword(temporaryPassword);
    const user = await this.userModel.create({
      ...createUserData,
      password: hash,
      changePassword: true,
    });
    this.sendPasswordMail(email, createUserData.name, temporaryPassword);
    return {
      id: user._id,
      message: 'successfully created and notified',
    };
  }

  async getUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException(
        {
          code: 'user.get.notFound',
          message: 'user not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      changePassword: user.changePassword,
    };
  }

  async getUsers() {
    const users = await this.userModel.find();
    return users.map((user) => {
      return {
        id: user._id,
        name: user.name,
        email: user.email,
      };
    });
  }

  async updateUser(id: string, updateUserData: UpdateUserData) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException(
        {
          code: 'user.update.notFound',
          message: 'user not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const { name, newPassword, oldPassword } = updateUserData;
    let updateData = {};
    if (name) updateData['name'] = name;
    if (newPassword) {
      if (!oldPassword) {
        throw new HttpException(
          {
            code: 'user.update.missingPassword',
            message: 'old password required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const matchOldPassword = await bcrypt.compare(oldPassword, user.password);
      if (!matchOldPassword) {
        throw new HttpException(
          {
            code: 'user.update.invalidPassword',
            message: 'invalid old password',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.validateNewPassword(newPassword, user.password);
      const hash = await this.hashPassword(newPassword);
      updateData['password'] = hash;
      updateData['changePassword'] = false;
    }
    if (!Object.keys(updateData).length) {
      throw new HttpException(
        {
          code: 'user.update.emptyData',
          message: 'nothing to update',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userModel.updateOne({ _id: id }, { $set: updateData });
    return {
      id: id,
      message: 'successfully updated',
    };
  }

  async deleteUser(id: string) {
    await this.userValidate(id);
    await this.userModel.deleteOne({ _id: id });
    return {
      id: id,
      message: 'successfully deleted',
    };
  }

  async forgotPassword(email: string, service?: string) {
    const user = await this.userModel.findOne({
      email,
    });
    if (!user || (user.changePassword && service !== 'retry')) return;
    const temporaryPassword = randomUUID().substring(0, 16);
    const hash = await this.hashPassword(temporaryPassword);
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { password: hash, changePassword: true } },
    );
    this.sendPasswordMail(email, user.name, temporaryPassword);
  }

  async validatePasswordTokenAndUser(token: string) {
    const decode = await await this.customToken.validate(token, this.secretKey);
    const user = await this.userModel.findOne({ email: decode.user });
    if (!user || !user.changePassword) {
      throw new HttpException(
        {
          code: 'user.update.unqualified',
          message: 'unqualified user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async resetPassword(token: string, password: string) {
    const decode = await await this.customToken.validate(token, this.secretKey);
    const user = await this.userModel.findOne({ email: decode.user });
    if (!user || !user.changePassword) {
      throw new HttpException(
        {
          code: 'user.update.unqualified',
          message: 'unqualified user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.validateNewPassword(password, user.password);
    const hash = await this.hashPassword(password);
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { password: hash, changePassword: false } },
    );
    return {
      id: user._id,
      message: 'successfully updated',
    };
  }

  private async userValidate(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
  }

  private async hashPassword(password: string) {
    try {
      return await bcrypt.hash(password, 10);
    } catch (err) {
      throw new HttpException(
        'password registration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async sendPasswordMail(
    email: string,
    name: string,
    temporaryPassword: string,
  ) {
    const token = await this.customToken.create(
      { user: email },
      '7200s',
      this.secretKey,
    );
    const mailContext = {
      username: name,
      resetUrl: `${process.env.APP_URL}/reset-password?token=${token}`,
      temporaryPassword: temporaryPassword,
      appName: this.appName,
    };
    await this.mailSender.send(
      email,
      `Configure sua senha da ${this.appName}`,
      './password',
      mailContext,
    );
  }

  private async validateNewPassword(
    password: string,
    encriptedPassword: string,
  ) {
    const match = await bcrypt.compare(password, encriptedPassword);
    if (match) {
      throw new HttpException(
        {
          code: 'user.update.repeatedPassword',
          message: 'new password must be different from the last one',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
