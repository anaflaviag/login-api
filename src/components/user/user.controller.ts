import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserData } from './classes/create-user.class';
import { SkipAuth } from 'src/config/authentication/skip-auth.decorator';
import { UpdateUserData } from './classes/update-user.class';
import { BaseGuard } from 'src/config/authentication/classes/base-guard.class';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @SkipAuth()
  @UseGuards(BaseGuard)
  @ApiSecurity('Authorization')
  @ApiOperation({ summary: 'Auth base token needed' })
  async createUser(@Body() createUserData: CreateUserData) {
    return await this.userService.createUser(createUserData);
  }

  @Get('profile')
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    return await this.userService.getUser(req.user);
  }

  @Get('list')
  @ApiBearerAuth()
  async listUsers() {
    return await this.userService.getUsers();
  }

  @Put(':id')
  @ApiBearerAuth()
  async updateUser(
    @Body() updateUserData: UpdateUserData,
    @Param('id') id: string,
  ) {
    return await this.userService.updateUser(id, updateUserData);
  }

  @Delete(':id')
  @ApiBearerAuth()
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @Post('forgot-password')
  @SkipAuth()
  @ApiQuery({ name: 'service', required: false })
  async forgotPassword(
    @Query('service') service,
    @Body('email') email: string,
  ) {
    await this.userService.forgotPassword(email, service);
  }

  @Get('reset/confirm')
  @SkipAuth()
  @ApiQuery({ name: 'token', required: true })
  async validatePasswordTokenAndUser(@Query('token') token) {
    await this.userService.validatePasswordTokenAndUser(token);
  }

  @Put('reset/confirm')
  @SkipAuth()
  @ApiQuery({ name: 'token', required: true })
  async resetPassword(
    @Query('token') token,
    @Body('password') password: string,
  ) {
    return await this.userService.resetPassword(token, password);
  }
}
