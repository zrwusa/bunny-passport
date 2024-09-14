import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationService } from '../../translation.service';
import { isUpperSnakeCase } from '../../utils';

// Used to translate the fields in the returned information that need to be internationalized.
@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const lang = request.headers['accept-language'] || 'en';
    request.i18nLang = lang;

    return next.handle().pipe(
      map(async (data) => {
        if (data) {
          const {
            controllerBusinessLogicCode,
            serviceBusinessLogicCode,
            message,
          } = data;
          const translating =
            controllerBusinessLogicCode || serviceBusinessLogicCode;
          if (translating && isUpperSnakeCase(translating)) {
            const res = await this.translationService.translate(
              translating,
              lang,
            );

            const { success, translated } = res;
            if (success) {
              data.message = translated;
            }
          }
          if (message && isUpperSnakeCase(message)) {
            const res = await this.translationService.translate(message, lang);

            const { success, translated } = res;
            if (success) {
              data.message = translated;
            }
          }
        }
        return data;
      }),
    );
  }
}
