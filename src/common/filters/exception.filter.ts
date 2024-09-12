import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { TranslationService } from '../../translation.service';

// Capture and translate the HTTP errors of the NestJS specification
@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly translationService: TranslationService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();
    const lang = request.headers['accept-language'] || 'en';

    let translatedMessage = exceptionResponse.message;

    if (typeof translatedMessage === 'string') {
      translatedMessage = await this.translationService.translate(
        translatedMessage,
        lang,
      );
    }

    response.status(status).json({
      ...exceptionResponse,
      message: translatedMessage,
    });
  }
}
