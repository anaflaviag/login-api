import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BaseGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const secretKey = process.env.AUTH_BASE_TOKEN;
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers.authorization;
    if (apiKey !== secretKey) throw new UnauthorizedException();
    return true;
  }
}
