import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { TranslationService } from '../../translation.service';
import { BusinessLogicNotificationCode } from '../../types/i18n';

// Capture and translate the HTTP errors of the NestJS specification
@Catch(HttpException)
export class ExceptionI18nFilter implements ExceptionFilter {
  constructor(private readonly translationService: TranslationService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();
    const lang = request.headers['accept-language'] || 'en';

    const message = exceptionResponse.message as BusinessLogicNotificationCode;
    const translatedMessage = await this.translationService.translate(
      message,
      lang,
    );

    response.status(status).json({
      ...exceptionResponse,
      message: translatedMessage,
    });
  }
}
