import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomToken {
  constructor(private readonly jwtService: JwtService) {}

  async create(data: any, expiration: string, secretKey: string) {
    try {
      return this.jwtService.signAsync(data, {
        expiresIn: expiration,
        secret: secretKey,
      });
    } catch (error) {
      throw new HttpException(
        'token generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validate(token: string, secretKey: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      });
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
