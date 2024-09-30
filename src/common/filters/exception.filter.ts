import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { TranslationService } from "../../translation.service";
import { ControllerBusinessLogicCode, ServiceBusinessLogicCode } from "../../types";
import { isUpperSnakeCase } from "../../utils";

// Capture and translate the HTTP errors of the NestJS specification
@Catch()
export class ExceptionI18nFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionI18nFilter.name);

  constructor(private readonly translationService: TranslationService) {}

  async catch(exception: Error, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      const lang = request.headers['accept-language'] || 'en';

      let message = exceptionResponse.message;
      if (typeof message === 'string' && isUpperSnakeCase(message)) {
        message = message as
          | ControllerBusinessLogicCode
          | ServiceBusinessLogicCode;

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
    } else {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const message = 'Internal server error';
      this.logger.error(
        `HTTP Status: ${status}, Error Message: ${message}, URL: ${request.url}, Method: ${request.method}`,
        exception.stack,
      );
      // Returns a standardized error response
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
      });
    }
  }
}
