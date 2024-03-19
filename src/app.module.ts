import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonLoggerMiddleware } from './config/middlewares/classes/common-logger.class';
import { ComponentsModule } from './components/components.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './config/authentication/classes/jwt-guard.class';

@Module({
  imports: [
    ComponentsModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const enable = process.env.ENABLE_COMMON_LOGGER === 'true';
    if (enable) {
      consumer
        .apply(CommonLoggerMiddleware)
        .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
  }
}
