import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { LocalAuthGuard } from '../../config/authentication/classes/local-guard.class';
import { AuthService } from './auth.service';
import { SkipAuth } from 'src/config/authentication/skip-auth.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @SkipAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }
}
