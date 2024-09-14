import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { TranslationService } from '../../translation.service';
import { ServiceBusinessLogicCode } from '../../types';
import { isUpperSnakeCase } from '../../utils';

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

    let message = exceptionResponse.message;
    if (typeof message === 'string' && isUpperSnakeCase(message)) {
      message = message as ServiceBusinessLogicCode;

      const translateRes = await this.translationService.translate(
        message,
        lang,
      );

      const { success, translated } = translateRes;
      if (success) {
        exceptionResponse.message = translated;
      }
    }

    response.status(status).json(exceptionResponse);
  }
}
