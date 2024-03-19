import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CommonLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, headers } = request;
    const oldWrite = response.write;
    const oldEnd = response.end;
    const chunks = [];
    response.write = function (chunk: any) {
      chunks.push(chunk);
      return oldWrite.apply(response, arguments);
    };
    response.end = function (chunk: any) {
      if (chunk) {
        chunks.push(chunk);
      }
      return oldEnd.apply(response, arguments);
    };

    response.on('finish', () => {
      const { statusCode } = response;
      const responseBody = Buffer.concat(chunks).toString('utf8');
      let logMessage = `${method} ${originalUrl} - ${headers.referer} - ${statusCode}`;
      if (statusCode > 300) {
        this.logger.error(`${logMessage} Response: ${responseBody}`);
      } else this.logger.log(logMessage);
    });

    next();
  }
}
