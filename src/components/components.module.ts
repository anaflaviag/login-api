import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { MongoSchemas } from './mongo-schemas';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { BaseGuard } from 'src/config/authentication/classes/base-guard.class';
import { JwtStrategy } from 'src/config/authentication/classes/jwt-strategy.class';
import { LocalStrategy } from 'src/config/authentication/classes/local-strategy.class';
import { CustomToken } from 'src/utils/classes/custom-token.class';
import { MailSender } from 'src/utils/classes/mail-sender.class';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature(MongoSchemas),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('EXPIRES_IN') },
      }),
    }),
    HttpModule.register({
      timeout: 30000,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get('GMAIL_USER'),
            pass: configService.get('GMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"no reply" <noreply.${configService.get('GMAIL_USER')}>`,
        },
        template: {
          dir: join(__dirname, '..', 'assets', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserService,
    LocalStrategy,
    AuthService,
    JwtStrategy,
    BaseGuard,
    MailSender,
    CustomToken,
  ],
})
export class ComponentsModule {}
