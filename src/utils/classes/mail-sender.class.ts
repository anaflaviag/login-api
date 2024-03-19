import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailSender {
  private logger = new Logger(MailSender.name);
  constructor(private mailerService: MailerService) {}

  async send(email: string, subject: string, template: string, context: any) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: template,
        context: context,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
